import controller from "./controller";
import storage from "../VirtualIPC/neutralino";

export default function startup() {

    // Initialize native API communication. This is non-blocking
    // use 'ready' event to run code on app load.
    // Avoid calling API functions before init or after init.
    Neutralino.init();

    Neutralino.events.on("trayMenuItemClicked", controller.onTrayMenuItemClicked);
    Neutralino.events.on("windowClose", controller.onWindowClose);
    Neutralino.events.on("ready", () => {
        if (NL_OS != "Darwin") { // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
            controller.setTray();
        }

        new MutationObserver(function (mutations) {
            console.log(mutations[0].target.nodeValue);
        }).observe(
            document.querySelector('title'),
            { subtree: true, characterData: true, childList: true }
        );

        let windowID = window.location.hash.split('/').pop()
        if (windowID) {
            console.log('Window opened as ID', windowID);
            storage.sub(windowID)(function (data) {
                console.log('Received data', data);
            })
            console.log('Subscribed to events');
        }
        console.log("Location", window.location);
    })

}