import UploadDialog from './_UploadDialog.svelte'

function createDialog(props) {
    // if (typeof props === 'string') props = { title: props }

    const lightbox = new UploadDialog({
        target: document.body,
        props: {
            data: props
        },
        intro: true
    })

    lightbox.$on('destroy', () => {
        lightbox.$destroy()
    })

    return lightbox.promise
}

const _UploadDialog: UploadDialog & {
    createDialog(props): any
} = UploadDialog as any

_UploadDialog.createDialog = createDialog

export default _UploadDialog