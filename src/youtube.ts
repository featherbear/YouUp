// https://www.googleapis.com/auth/youtube	Manage your YouTube account
// https://www.googleapis.com/auth/youtube.channel-memberships.creator	See a list of your current active channel members, their current level, and when they became a member
// https://www.googleapis.com/auth/youtube.force-ssl	See, edit, and permanently delete your YouTube videos, ratings, comments and captions
// https://www.googleapis.com/auth/youtube.readonly	View your YouTube account
// https://www.googleapis.com/auth/youtube.upload	Manage your YouTube videos
// https://www.googleapis.com/auth/youtubepartner	View and manage your assets and associated content on YouTube
// https://www.googleapis.com/auth/youtubepartner-channel-audit	View private information of your YouTube channel relevant during the audit process with a YouTube partner

import { uid } from "uid";
import { AUTH_CALLBACK_URL, AUTH_CLIENT_ID } from "./consts/auth";


// let uri = oauthClient.generateAuthUrl({
//     access_type: 'online',
//      scope: [
//         

//     ]
// })

// console.log(uri);

// https://developers.googleblog.com/2021/08/gsi-jsweb-deprecation.html


function generateOAuth2URL(state) {
    return "https://accounts.google.com/o/oauth2/v2/auth?" +
        new URLSearchParams({
            client_id: AUTH_CLIENT_ID,
            redirect_uri: 'http://localhost:64573' + `/${AUTH_CALLBACK_URL}`.replace(/\/\//g, '/'),
            response_type: "token",
            scope: ["https://www.googleapis.com/auth/youtube.upload"].join(" "),
            ...(state ? { state } : {})
        }).toString();
}
export function createAuthChallenge(callback?: (response: GoogleApiOAuth2TokenObject) => void) {
    let id = uid(20)
    let interval = setInterval(function () {
        let response;
        if ((response = localStorage.getItem(`challenge-${id}`))) {
            console.log('got a response');
            try {
                response = JSON.parse(response)
                callback?.(response)
                clearInterval(interval)
                console.log('fin');
            } catch {
                console.log('failed response');
            }
        }
    }, 500)

    return generateOAuth2URL(btoa(JSON.stringify([location.port, id])))
}

export function completeAuthChallenge(response: GoogleApiOAuth2TokenObject) {
    const [port, id] = JSON.parse(atob(response.state))
    localStorage.setItem(`challenge-${id}`, JSON.stringify(response))
    console.log(`challenge-${id}`, JSON.stringify(response));
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

export default {

    // auth: 
}