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

export function parsePlaylistObject(playlist: PlaylistObject) {
    const tagIdx = playlist.description.indexOf(SEARCH_TAG)
    if (tagIdx === -1) return playlist

    const payload = playlist.description.slice(tagIdx + SEARCH_TAG.length)
    let data: InternalYouUpSchema

    try {
        data = JSON.parse(atob(`{${payload}}`))
    } catch (e) {
        return playlist
    }

    if (!data) return playlist

    if (data.t !== 'YouUp') {
        return playlist
    } else {
        delete data.t
    }

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