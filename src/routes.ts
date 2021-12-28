import Home from './views/Home.svelte'
// import Upload from './views/Upload.svelte'
import Auth_Callback from './views/Auth/Callback.svelte'
import { AUTH_CALLBACK_URL } from './consts/auth'

const routes = {
    "/": Home,
    // '/upload': Upload,
    [AUTH_CALLBACK_URL]: Auth_Callback
}

export { routes }