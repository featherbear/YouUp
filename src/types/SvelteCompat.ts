import type PlaylistObject from "./PlaylistObject";

export function asPlaylistObjectArray(array: []) {
    return array as PlaylistObject[]
}

export function asPlaylistObject(obj) {
    return obj as PlaylistObject
}