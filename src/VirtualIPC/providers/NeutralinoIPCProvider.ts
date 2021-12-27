import type { VirtualIPCProvider } from "../VirtualIPC";

const NeutralinoIPCProvider: VirtualIPCProvider = {
    async get(key) {
        return Neutralino.storage.getData(key).catch(() => null)
    },
    async set(key, value) {
        return Neutralino.storage.setData(key, value)
    }
}

export default NeutralinoIPCProvider