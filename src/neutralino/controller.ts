
export default {
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
