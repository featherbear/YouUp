// https://www.googleapis.com/auth/youtube	Manage your YouTube account
// https://www.googleapis.com/auth/youtube.channel-memberships.creator	See a list of your current active channel members, their current level, and when they became a member
// https://www.googleapis.com/auth/youtube.force-ssl	See, edit, and permanently delete your YouTube videos, ratings, comments and captions
// https://www.googleapis.com/auth/youtube.readonly	View your YouTube account
// https://www.googleapis.com/auth/youtube.upload	Manage your YouTube videos
// https://www.googleapis.com/auth/youtubepartner	View and manage your assets and associated content on YouTube
// https://www.googleapis.com/auth/youtubepartner-channel-audit	View private information of your YouTube channel relevant during the audit process with a YouTube partner

import { uid } from "uid";
import { AUTH_CALLBACK_URL, AUTH_CLIENT_ID, AUTH_STORAGE_KEY } from "./consts/auth";


// let uri = oauthClient.generateAuthUrl({
//     access_type: 'online',
//      scope: [
//         

//     ]
// })

// console.log(uri);

// https://developers.googleblog.com/2021/08/gsi-jsweb-deprecation.html
import { readable, Subscriber } from "svelte/store";
import type AuthObject from "./types/AuthObject";
import { getPlaylistsSTUB } from "./STUB";
import type PlaylistObject from "./types/PlaylistObject";

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

withYoutube.uploadVideo = function (file: File) {

    }
    breakHereHah();
    let body = file.slice(0)

    console.log(file.size);
    console.log(await file.text(), await (await file.text()).length);

    gapi.client.request({
        method: "PUT",
        path: 'https://content.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=id%2Csnippet%2Cstatus&upload_id=ADPycdsnxSHi6FzThuZ-GuIlztQ1fAHTraFv-usc6SmKSK5ML1bW2MRHL8fvup-QHdiv9BGzJJJPu1_mU82v2QNis2M',
        body: body,
        headers: {
            // 'Content-Type': file.type,
            // 'content-type': 'multipart/related; boundary="random123"',
            'Content-Length': body.size,
            'Content-Range': `bytes ${0}-${file.size - 1}/${file.size}`
        }

    }).then(function (a) {
        console.log('success', a);
    }, function fail(a) {
        console.log('fail', a);
    })

    return;



    // return (async function () {
    //     console.log(file);
    //     console.log((await file.text()).length)
    //     console.log((await file.arrayBuffer()))
    //     console.log(new Uint8Array(await file.arrayBuffer()))
    // })();

    // return withYoutube(async (c) => {
    //     // https://developers.google.com/youtube/v3/docs/videos/insert
    //     // As of 25th December 2021 (Happy birthday Jesus)
    //     // - Maximum file size: 128GB
    //     // - Accepted Media MIME types: video/*, application/octet-stream

    //     if (file.name != "ABCDEFGH.mov") {
    //         console.log('rejected for wrong file');
    //         return
    //     }

    //     await gapi.client.request(
    //         {
    //             path: 'https://www.googleapis.com/upload/youtube/v3/videos',
    //             method: "POST",
    //             params: {
    //                 uploadType: 'resumable',
    //                 part: 'id,snippet,status'
    //             },
    //             headers: {
    //                 'Content-Type': 'application/json; charset=UTF-8',
    //                 'X-Upload-Content-Length': file.size,
    //                 'x-upload-content-type': file.type
    //             },
    //             body: JSON.stringify({
    //                 snippet: {
    //                     title: "test video",
    //                     description: "this is a test video"
    //                 },
    //                 status: {
    //                     privacyStatus: 'unlisted'
    //                 }

    //             })
    //         }
    //     ).then(function (c) {
    //         console.log('Created video', c);

    //         let reqURL = c.headers['location']

    //         async function response(f) {
    //             console.log('got status', f);
    //             if (f.status == 308) {
    //                 let done;
    //                 if (Number.isNaN((done = Math.trunc(f.headers.range?.split("-")?.[1])))) {
    //                     done = -1
    //                 }

    //                 let body = file.slice(done + 1, null, file.type)

    //                 // 10k quota
    //                 console.log('start upload');
    //                 console.log(body);

    //                 function Uint8ToString(u8a) {
    //                     var CHUNK_SZ = 0x8000;
    //                     var c = [];
    //                     for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
    //                         c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ)));
    //                     }
    //                     return c.join("");
    //                 }

    //                 gapi.client.request({
    //                     method: "PUT",
    //                     path: reqURL,
    //                     // body: `--random123\nContent-Type: ${file.type}\nMIME-Version: 1.0\nContent-Transfer-Encoding: base64\n\n` + btoa(Uint8ToString(new Uint8Array(await body.arrayBuffer()))) + '\n--random123--\n',
    //                     body: new Uint8Array(await file.arrayBuffer()),
    //                     headers: {
    //                         // 'Content-Type': file.type,
    //                         // 'content-type': 'multipart/related; boundary="random123"',
    //                         'Content-Length': body.size,
    //                         'Content-Range': `bytes ${done + 1}-${file.size - 1}/${file.size}`
    //                     }

    //                 }).then(function (a) {
    //                     console.log('success', a);
    //                 }, function fail(a) {
    //                     console.log('fail', a);
    //                 })
    //             }
    //         }


    //         gapi.client.request({
    //             path: reqURL,
    //             method: "PUT",
    //             headers: {
    //                 'Content-Length': 0,
    //                 'Content-Range': `bytes */${file.size}`,
    //                 'Accept-Encoding': 'deflate, br'
    //             },
    //         }).then(response, response)

    //     })

    // })
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
            console.log('got a response');
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

                console.log('fin');

                callback?.(authObject)
            } catch {
                console.log('failed response');
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