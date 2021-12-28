import type PlaylistObject from '../types/PlaylistObject'
import _EditTemplate from './_EditTemplate.svelte'

function createDialog(playlist: PlaylistObject) {
    // if (typeof props === 'string') props = { title: props }

    const lightbox = new _EditTemplate({
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

const EditTemplate: _EditTemplate & {
    createDialog(playlist: PlaylistObject): any
} = _EditTemplate as any

EditTemplate.createDialog = createDialog

export default EditTemplate