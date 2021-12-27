import App from './App.svelte'
import "carbon-components-svelte/css/all.css";
import controller from './neutralino/controller';
import startup from './neutralino/startup';

startup()

export default new App({
    target: document.getElementById('app'),
    props: { controller }
})

// controller.showInfo();

