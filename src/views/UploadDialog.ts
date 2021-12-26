import type PlaylistObject from '../types/PlaylistObject'
import _UploadDialog from './_UploadDialog.svelte'

function createDialog(playlist: PlaylistObject) {
    // if (typeof props === 'string') props = { title: props }

    const lightbox = new _UploadDialog({
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

const UploadDialog: _UploadDialog & {
    createDialog(playlist: PlaylistObject): any
} = _UploadDialog as any

UploadDialog.createDialog = createDialog

export default UploadDialog