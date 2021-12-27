import App from './App.svelte'
import "carbon-components-svelte/css/all.css";
import { sub } from './VirtualIPC';

const controller = {
    showInfo: () => {
        document.getElementById('info').innerHTML = `
            ${NL_APPID} is running on port ${NL_PORT}  inside ${NL_OS} 
            <br/><br/>
            <span>server: v${NL_VERSION} . client: v${NL_CVERSION}</span>
            `;
    },
    openDocs: () => {
        Neutralino.os.open("https://neutralino.js.org/docs");
    },
    openTutorial: () => {
        Neutralino.os.open("https://www.youtube.com/watch?v=txDlNNsgSh8&list=PLvTbqpiPhQRb2xNQlwMs0uVV0IN8N-pKj");
    },
    setTray: () => {
        if (NL_MODE != "window") {
            console.log("INFO: Tray menu is only available in the window mode.");
            return;
        }
        let tray = {
            icon: "/resources/icons/trayIcon.png",
            menuItems: [
                { id: "VERSION", text: "Get version" },
                { id: "SEP", text: "-" },
                { id: "QUIT", text: "Quit" }
            ]
        };
        Neutralino.os.setTray(tray);
    },
    onTrayMenuItemClicked: (event) => {
        switch (event.detail.id) {
            case "VERSION":
                Neutralino.os.showMessageBox("Version information",
                    `Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`);
                break;
            case "QUIT":
                Neutralino.app.exit();
                break;
        }
    },
    onWindowClose: () => {
        Neutralino.app.exit();
    }
};

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
        sub(windowID)(function (data) {
            console.log('Received data', data);
        })
        console.log('Subscribed to events');
    }
    console.log("Location", window.location);
})


export default new App({
    target: document.getElementById('app'),
    props: { controller }
})

// controller.showInfo();

