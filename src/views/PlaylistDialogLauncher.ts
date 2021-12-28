import type { SvelteComponent } from 'svelte'
import type PlaylistObject from '../types/PlaylistObject'

export default function createPlaylistDialog(component: typeof SvelteComponent, playlist: PlaylistObject) {
    // if (typeof props === 'string') props = { title: props }

    return new Promise((resolve, reject) => {
        const lightbox: SvelteComponent = new component({
            target: document.body,
            props: {
                playlist
            },
            intro: true
        })

        lightbox.$on('close', () => {
            resolve(null)
            lightbox.$destroy()
        })


        lightbox.$on('submit', (data) => {
            resolve(data)
            lightbox.$destroy()
        })
    })
}
