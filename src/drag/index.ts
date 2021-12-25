import DragOverlay from './DragOverlay.svelte'

let components: DragOverlay[] = [];

export function setOverlayVisiblity(value) {
    components.forEach(c => c.setOverlayVisiblity(value))
}

export function attach(elem, handlerFn: (file) => void) {
    const ref = new DragOverlay({
        target: elem,
        props: {
            handler: handlerFn
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
        console.log('enter');
    }, false)

    window.addEventListener('dragend', () => {
        setOverlayVisiblity(false)
    }, false)
}