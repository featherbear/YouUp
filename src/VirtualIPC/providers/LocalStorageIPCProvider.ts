import type { VirtualIPCProvider } from "../VirtualIPC";

const LocalStorageIPCProvider: VirtualIPCProvider = {
    async get(key) {
        return localStorage.getItem(key)
    },
    async set(key, value) {
        return localStorage.setItem(key, value)
    }
}

export default LocalStorageIPCProvider