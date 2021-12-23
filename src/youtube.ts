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