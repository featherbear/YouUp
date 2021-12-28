import type PlaylistObject from "./types/PlaylistObject";
import dayjs from 'dayjs'

import bs58 from 'base-58'
import { Buffer } from 'buffer/'

const SEARCH_TAG = "==YOUUP=="

type InternalYouUpSchema = {
    t: 'YouUp'
    titleFormat: string,
    descriptionFormat: string,
    defaultPrivacy: 'public' | 'unlisted' | 'private'
}

export type YouUpSchema = Omit<InternalYouUpSchema, 't'>

export type YouUpPlaylistObject = PlaylistObject & {
    YouUp: YouUpSchema & {
        generateTitle(file: File, formatter?: string): string,
        generateDescription(file: File, formatter?: string): string
        buildReplacements(file: File): {[key: string]: any}
    }
}

export function updatePlaylistMetadata(playlist: YouUpPlaylistObject) {
    let newDescription = playlist.description
    const tagIdx = playlist.description.indexOf(SEARCH_TAG)
    const newPayload = createMetadata(playlist)

    if (tagIdx === -1) {
        // If not found - add at the end
        newDescription += '\n\n\n' + SEARCH_TAG + newPayload
    } else {
        let metadataIdxStart = tagIdx + SEARCH_TAG.length
        let metadataIdxEnd = Math.max(0, playlist.description.indexOf(' ', tagIdx + SEARCH_TAG.length)) || playlist.description.length // Get position of next space, or very end if there is no space
        if (!parseMetadata(playlist.description.slice(metadataIdxStart, metadataIdxEnd))) {
            throw new Error("Did not successfully decode existing metadata")
        }

        const [pre, _, post] = [
            playlist.description.slice(0, metadataIdxStart),
            playlist.description.slice(metadataIdxStart, metadataIdxEnd),
            playlist.description.slice(metadataIdxEnd),
        ]

        // TODO: Update the object itself?
        newDescription = [pre, newPayload, post].join("")
    }

    if (newDescription.length > 5000) {
        throw new Error("Could not update. Description too long")
    }

    return newDescription
}

export function createMetadata(playlist: YouUpPlaylistObject) {
    if (!Object.prototype.hasOwnProperty.call(playlist, 'YouUp' as keyof YouUpPlaylistObject)) throw new Error("Provided object is not a YouUp playlist")

    const {
        titleFormat,
        descriptionFormat,
        defaultPrivacy,
    }: { [key in keyof YouUpSchema]: any } = playlist.YouUp

    return JSON.stringify({
    return bs58.encode(Buffer.from(JSON.stringify({
        t: 'YouUp',
        titleFormat,
        descriptionFormat,
        defaultPrivacy
    }).slice(1, -1).replace(/=*$/g, '')))
}

function parseMetadata(metadata: string) {
    let data: InternalYouUpSchema

    try {
        data = JSON.parse(Buffer.from(bs58.decode(`{${metadata}}`)).toString())
    } catch (e) {
        return null
    }

    if (!data) return null

    if (data.t !== 'YouUp') {
        return null
    }

    delete data.t
    return data as YouUpSchema

}

export function parsePlaylistObject(playlist: PlaylistObject): YouUpPlaylistObject {
    const defaults: YouUpSchema = {
        defaultPrivacy: 'unlisted',
        titleFormat: '',
        descriptionFormat: '',
    }

    // Clone data
    playlist = { ...playlist }

    const tagIdx = playlist.description.indexOf(SEARCH_TAG)
    let data: YouUpSchema;

    if (tagIdx === -1 || !(data = parseMetadata(playlist.description.slice(
        tagIdx + SEARCH_TAG.length,
        // Get position of next space, or very end if there is no space
        Math.max(0, playlist.description.indexOf(' ', tagIdx + SEARCH_TAG.length)) || playlist.description.length
    )))) {
        data = defaults
    }

    (playlist as any).YouUp = data

    function buildReplacements(file: File) {
        let today = dayjs()

        const replacements = {
            'oldCount': playlist.itemCount,
            'newCount': playlist.itemCount + 1,
            'playlistTitle': playlist.title,
            'fileTitle': file.name,
            'date-DDMMYYYY': today.format('DDMMYYYY'),
            'date-DD/MM/YYYY': today.format('DD/MM/YYYY'),
            'date-YYYYMMDD': today.format('YYYYMMDD'),
        }
        return replacements
    }

    // Assume all is well
    function makeReplacement(file: File, formatter: string) {
        // Recreate replacements so that dates (e.g.) will be correct as the day spills over to tomorrow
        let replacements = buildReplacements(file)

        var re = new RegExp(":(" + Object.keys(replacements).join("|") + "):", "g");

        return formatter.replace(re, function (_, matched) {
            return replacements[matched];
        });

    }

    const YouUpPlaylist: YouUpPlaylistObject = {
        ...playlist,
        YouUp: {
            ...data,
            generateDescription(file, formatter?: string) {
                return makeReplacement(file, formatter ?? data.descriptionFormat)
            },
            generateTitle(file, formatter?: string) {
                return makeReplacement(file, formatter ?? data.titleFormat)
            },
            buildReplacements
        }
    }

    return YouUpPlaylist
}

export const TestFile: File = {
    name: "ExampleFile.mp4",
    type: 'video/mp4',
    size: 13723,
    lastModified: dayjs().subtract(5, 'minute').toDate().getTime()
} as any