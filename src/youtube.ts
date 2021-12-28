import { uid } from "uid";
import { AUTH_CALLBACK_URL, AUTH_CLIENT_ID, AUTH_STORAGE_KEY } from "./consts/auth";

// https://developers.googleblog.com/2021/08/gsi-jsweb-deprecation.html

import { readable, Subscriber } from "svelte/store";
import type AuthObject from "./types/AuthObject";
import { getPlaylistsSTUB } from "./STUB";
import type PlaylistObject from "./types/PlaylistObject";
import type BasicYouTubeVideo from "./types/BasicYouTubeVideo";

let _setAuthStore: Subscriber<AuthObject>
let _expiryTimeout: NodeJS.Timeout

export const authStore = readable<AuthObject>(null, function (set) {
    _setAuthStore = function (auth) {
        set(auth)

        if (auth) {
            clearTimeout(_expiryTimeout)
            _expiryTimeout = setTimeout(function () {
                set(null)
            }, auth.expiry - new Date().getTime())
        }
    }

    _setAuthStore(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)))
})

export function withYoutube<T = any>(func: (client: YoutubeServiceClient) => Promise<T>): Promise<T> {
    if (!gapi) {
        console.error("gapi was not initialised")
        return
    }
    if (!gapi.client) {
        console.error("gapi.client was not initialised")
        return
    }
    if (!gapi.client.getToken()) {
        console.error("gapi.client.getToken() is empty")
        return
    }
    if (!gapi.client.youtube) {
        console.error("gapi.client.youtube was not initialised")
        return
    }

    return func(gapi.client.youtube)
}

withYoutube.updateRemotePlaylist = function (playlist: PlaylistObject, description?: string) {
    withYoutube(async (c) => {
        return c.playlists.update({
            part: 'id,snippet',
            ...{
                id: playlist.id,
                snippet: {
                    title: playlist.title,
                    description: description ?? playlist.description
                }
            } as GoogleApiYouTubePlaylistResource
        })
    })
}

withYoutube.uploadVideo = function (file: File, detail: BasicYouTubeVideo) {

    return withYoutube(async (c) => {
        // https://developers.google.com/youtube/v3/docs/videos/insert

        // As of 25th December 2021 (Happy birthday Jesus)
        // - Maximum file size: 128GB
        // - Accepted Media MIME types: video/*, application/octet-stream

        const boundaryTag = "YouUp" + Math.trunc(new Date().getTime() / 1000)

        // Some magic thing to turn a byte array to a string that retains nulls???
        function Uint8ToString(u8a) {
            var CHUNK_SZ = 0x8000;
            var c = [];
            for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
                c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
            }
            let str = c.join("");
            return str
        }

        let resp: GoogleApiYouTubeVideoResource = await gapi.client.request(
            {
                path: 'https://www.googleapis.com/upload/youtube/v3/videos',
                method: "POST",
                params: {
                    uploadType: 'multipart',
                    part: 'id,snippet,status',
                    alt: 'json',
                },
                headers: {
                    'content-type': `multipart/related; boundary="${boundaryTag}"`,
                    accept: 'application/json',
                },
                body: [
                    `--${boundaryTag}\nContent-Type: application/json\nMIME-Version: 1.0\n\n`,
                    JSON.stringify({
                        snippet: {
                            title: detail.title,
                            description: detail.description
                        },
                        status: {
                            privacyStatus: detail.privacy
                        }
                    }),
                    '\n',
                    `--${boundaryTag}\nContent-Type: ${file.type}\nMIME-Version: 1.0\nContent-Transfer-Encoding: base64\n\n`,
                    btoa(Uint8ToString(new Uint8Array(await file.arrayBuffer()))),
                    '\n',
                    `--${boundaryTag}--\n`
                ].join('')
            }
        ) as any

        return resp
    })
}

withYoutube.getPlaylists = function () {
    return withYoutube(
        async (c) => {
            let items: PlaylistObject[] = [];

            let pagetoken = undefined;
            do {
                const data = await c.playlists.list({
                    mine: true,
                    part: ["snippet", "id", "status", "contentDetails"].join(","),
                    maxResults: 50,
                    pagetoken,
                });

                pagetoken = data.result.nextPageToken;

                for (let {
                    contentDetails: { itemCount },
                    id,
                    status: { privacyStatus },
                    snippet: { description, publishedAt, title, thumbnails },
                } of data.result.items) {
                    items = [
                        ...items,
                        {
                            id,
                            title,
                            description,
                            publishedAt,
                            thumbnails,
                            privacyStatus,
                            itemCount,
                        },
                    ];
                }
            } while (pagetoken);

            return items;
        })
}

/**
 * STUB
 * @deprecated STUB STUB STUB
 * @returns TIS A MERE STUB
 */
withYoutube.getPlaylists = async function () {
    return getPlaylistsSTUB
}

export function init() {
    return _init.call(_init) as ReturnType<typeof _init>;
}

function _init(this: { callPromise?: Promise<boolean> }) {
    if (this.callPromise) return this.callPromise

    return (this.callPromise = new Promise((resolve, reject) => {
        gapi.load("client", function () {

            // Load YouTube Data v3 API
            gapi.client.load("youtube", "v3", () => resolve(true));

            // Set client token
            authStore.subscribe(function (auth) {
                if (auth) {
                    gapi.client.setToken({
                        access_token: auth.access_token,
                    });
                } else {
                    gapi.client.setToken(null)
                }
            });

        });
    }))

}


function generateOAuth2URL(state) {
    return "https://accounts.google.com/o/oauth2/v2/auth?" +
        new URLSearchParams({
            client_id: AUTH_CLIENT_ID,
            redirect_uri: 'http://localhost:64573' + `/${AUTH_CALLBACK_URL}`.replace(/\/\//g, '/'),
            response_type: "token",
            prompt: "consent",
            scope: [
                // "https://www.googleapis.com/auth/youtube.upload",


                'https://www.googleapis.com/auth/youtube'
            ].join(" "),
            ...(state ? { state } : {})
        }).toString();
}
export function createAuthChallenge(callback?: (response: AuthObject) => void) {
    let id = uid(20)
    let interval = setInterval(function () {
        let response;
        if ((response = localStorage.getItem(`challenge-${id}`))) {
            try {
                response = JSON.parse(response)

                let { access_token, expires_in } = response;
                let authObject: AuthObject = {
                    access_token,
                    expiry: new Date().getTime() + (Math.trunc(expires_in) - 60) * 1000,
                }

                clearInterval(interval)

                localStorage.removeItem(`challenge-${id}`)
                localStorage.setItem(
                    AUTH_STORAGE_KEY,
                    // Expire one minute earlier than given to ensure time sync
                    JSON.stringify(authObject)
                );
                _setAuthStore(authObject)

                callback?.(authObject)
            } catch {
                console.log('Failed auth challenge response');
            }
        }
    }, 500)

    return generateOAuth2URL(btoa(JSON.stringify([location.port, id])))
}

export function completeAuthChallenge(response: GoogleApiOAuth2TokenObject) {
    let { state, ...rest } = response
    const [port, id] = JSON.parse(atob(state))
    localStorage.setItem(`challenge-${id}`, JSON.stringify(rest))
    console.log(`challenge-${id}`, JSON.stringify(rest));
}

export function parseResponseURL(queryString) {
    try {
        let response = Object.fromEntries(new URLSearchParams(queryString).entries()) as unknown as GoogleApiOAuth2TokenObject
        return response
    } catch (err) {
        console.error("Could not parse response url", err)
        return null
    }
}