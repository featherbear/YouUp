import { uid } from "uid";
import type IPCTypes from "./IPCEvents";

export function sub(stream: string) {
    let cb: ({ type: IPCTypes, data: any }) => void;

    let consumed = []
    setInterval(function () {
        if (!cb) return

        Neutralino.storage.getData(`${stream}_queue`).catch(err => null).then((d: any) => {
            if (!d) return
            let data: any[] = JSON.parse(d)

            // Remove keys that were dequeued
            consumed = consumed.filter(v => !data.includes(v))

            let change = false

            // Consume new data
            for (let key of data.filter(v => !consumed.includes(v))) {
                change = true;
                consumed = [...consumed, key]
                Neutralino.storage.getData(key).then(v => {
                    cb(JSON.parse(v))
                    Neutralino.storage.setData(key, null)
                })
            }

            if (change) {
                Neutralino.storage.setData(`${stream}_consumed`, JSON.stringify(consumed))
            }
        })
    }, 250)

    return function (callback: typeof cb) {
        cb = callback
    }
}

export function pub(stream: string) {
    let events = []

    setInterval(function () {
        Neutralino.storage.getData(`${stream}_consumed`).catch(err => null).then((d: any) => {
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
                Neutralino.storage.setData(`${stream}_queue`, JSON.stringify(events))
            }
        })
    }, 250)

    return function emit(type: IPCTypes, data) {
        let id = `${stream}-${uid(20)}`
        Neutralino.storage.setData(id, JSON.stringify({ type, data })).then(() => {
            events = [...events, id]
            Neutralino.storage.setData(`${stream}_queue`, JSON.stringify(events))
        })
    }

}