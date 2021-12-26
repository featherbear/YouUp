import type PlaylistObject from "./types/PlaylistObject";
import dayjs from 'dayjs'

const SEARCH_TAG = "==YOUUP=="

type InternalYouUpSchema = {
    t: 'YouUp'
    titleFormat: string,
    descriptionFormat: string,
    defaultPrivacy: 'public' | 'unlisted' | 'private'
}

export type YouUpSchema = Omit<InternalYouUpSchema, 't'>

export type YouUpPlaylistObject = PlaylistObject & {
    YouUp?: YouUpSchema & {
        generateTitle(file: File): string,
        generateDescription(file: File): string
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
        t: 'YouUp',
        titleFormat,
        descriptionFormat,
        defaultPrivacy
    }).slice(1, -1)
}

function parseMetadata(metadata: string) {
    let data: InternalYouUpSchema

    try {
        data = JSON.parse(atob(`{${metadata}}`))
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

export function parsePlaylistObject(playlist: PlaylistObject) {
    const tagIdx = playlist.description.indexOf(SEARCH_TAG)
    if (tagIdx === -1) return playlist

    let data = parseMetadata(playlist.description.slice(
        tagIdx + SEARCH_TAG.length,
        // Get position of next space, or very end if there is no space
        Math.max(0, playlist.description.indexOf(' ', tagIdx + SEARCH_TAG.length)) || playlist.description.length
    ))
    if (!data) return playlist

    // Assume all is well
    function makeReplacement(file: File, formatter: string) {
        let today = dayjs()

        const replacements = {
            'oldCount': playlist.itemCount,
            'newCount': playlist.itemCount + 1,
            'playlistTitle': playlist.title,
            'fileTitle': file.name,
            'date-DDMMYYYY': today.format('DDMMYYYY'),
            'date-YYYYMMDD': today.format('YYYYMMDD'),
        }

        var re = new RegExp(Object.keys(replacements).map(v => `:(${v}):`).join("|"), "g");

        return formatter.replace(re, function (matched) {
            return replacements[matched];
        });

    }

    const YouUpPlaylist: YouUpPlaylistObject = {
        ...playlist,
        YouUp: {
            ...data,
            generateDescription(file) {
                return makeReplacement(file, data.descriptionFormat)
            },
            generateTitle(file) {
                return makeReplacement(file, data.titleFormat)
            }
        }
    }

    return YouUpPlaylist
}