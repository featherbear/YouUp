import { uid } from "uid";
import type IPCTypes from "../types/IPCEvents";

export interface VirtualIPCProvider {
    get(key: string): Promise<string>
    set(key: string, value: string): Promise<any>
}

export default function generate(provider: VirtualIPCProvider) {
    return {
        sub(stream: string) {
            let cb: ({ type: IPCTypes, data: any }) => void;

            let consumed = []
            setInterval(function () {
                if (!cb) return

                provider.get(`${stream}_queue`).then((d: any) => {
                    if (!d) return
                    let data: any[] = JSON.parse(d)

                    // Remove keys that were dequeued
                    consumed = consumed.filter(v => !data.includes(v))

                    let change = false

                    // Consume new data
                    for (let key of data.filter(v => !consumed.includes(v))) {
                        change = true;
                        consumed = [...consumed, key]
                        provider.get(key).then(v => {
                            cb(JSON.parse(v))
                            provider.set(key, null)
                        })
                    }

                    if (change) {
                        provider.set(`${stream}_consumed`, JSON.stringify(consumed))
                    }
                })
            }, 250)

            return function (callback: typeof cb) {
                cb = callback
            }
        },

        pub(stream: string) {
            let events = []

            setInterval(function () {
                provider.get(`${stream}_consumed`).then((d: any) => {
                    if (!d) return

                    let data: any[] = JSON.parse(d)

                    if (data.length === 0) return;

                    let change = false
                    let newEvents = []
                    for (let key of events) {
                        if (data.includes(key)) {
                            change = true
                        } else {
                            newEvents = [...newEvents, key]
                        }
                    }

                    events = newEvents

                    if (change) {
                        provider.set(`${stream}_queue`, JSON.stringify(events))
                    }
                })
            }, 250)

            return function emit(type: IPCTypes, data) {
                let id = `${stream}-${uid(20)}`
                provider.set(id, JSON.stringify({ type, data })).then(() => {
                    events = [...events, id]
                    provider.set(`${stream}_queue`, JSON.stringify(events))
                })
            }

        }
    }
}
