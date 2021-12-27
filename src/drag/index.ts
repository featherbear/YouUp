import DragOverlay from './DragOverlay.svelte'

let components: DragOverlay[] = [];

export function setOverlayVisiblity(value) {
    components.forEach(c => c.setOverlayVisiblity(value))
}

export function attach(elem, handlerFn: (file: File) => void) {
    const ref = new DragOverlay({
        target: elem,
        props: {
            handler: function (file) {
                setOverlayVisiblity(false)
                handlerFn(file)
            } as typeof handlerFn,
            notifyFn: function (event: Event) {
                setOverlayVisiblity(false)
            }
        }
    })

    components = [...components, ref]

    return function unmount() {
        components = components.filter(x => x !== ref)
    }
}

export function registerDragListener() {
    window.addEventListener('dragenter', () => {
        setOverlayVisiblity(true)
    }, false);


    window.addEventListener('dragleave', function (e) {
        if (e.relatedTarget === null) setOverlayVisiblity(false)
    }, false);

    window.addEventListener('dragend', () => {
        setOverlayVisiblity(false)
    }, false)
}