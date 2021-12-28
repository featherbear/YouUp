import type PlaylistObject from '../types/PlaylistObject'

export default function createPlaylistDialog(component: any, playlist: PlaylistObject) {
    // if (typeof props === 'string') props = { title: props }

    const lightbox = new component({
        target: document.body,
        props: {
            playlist
        },
        intro: true
    })

    lightbox.$on('destroy', () => {
        lightbox.$destroy()
    })

    return lightbox.promise
}
