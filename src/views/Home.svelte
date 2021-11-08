<script>
  import {
    Button,
    TextInput,
    TextInputSkeleton,
  } from "carbon-components-svelte";

  import { uid } from "uid";

  function once(target, eventName, callback) {
    let fn = function () {
      console.log("Callback for", eventName);
      callback.apply(this, arguments);
      target.off(eventName, fn);
    };

    console.log("setup for", eventName, fn);
    target.on(eventName, fn);
  }

  function spawnWindow(path, seedData = {}) {
    let windowID = uid(20);
    Neutralino.window.create(`/resources/index.html#/${path}/${windowID}`);

    Neutralino.events.on(`ipc`, function () {
      console.log("base");
    });
    once(Neutralino.events, `ipc:${windowID}:ready`, function () {
      Neutralino.events.dispatch(
        `ipc:${windowID}:data`,
        JSON.stringify(seedData)
      );
    });
  }
</script>

<svelte:head>
  <title>YouUp</title>
</svelte:head>

<h1>NeutralinoJs</h1>
<div id="info" />
<br />
<div>
  <!-- <a href="#" on:click={() => controller.openDocs()}>Docs</a> &middot;
  <a href="#" on:click={() => controller.openTutorial()}>Tutorial</a> &middot; -->
</div>

<Button
  on:click={() => {
      Neutralino.events.on('myTestEvent', function(){
          console.log('pass data');
      })
      Neutralino.events.dispatch('myTestEvent', {myData: 'Test data'});
    spawnWindow("upload", { data: "aa" });
  }}>Change View</Button
>

<Button
  on:click={() => {
    console.log(Neutralino);
    Neutralino.os.showOpenDialog();
  }}>Open</Button
>
