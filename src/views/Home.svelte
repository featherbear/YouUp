<script>
  import {
    Button,
    TextInput,
    TextInputSkeleton,
  } from "carbon-components-svelte";

  import { uid } from "uid";
  import { authStore } from "../youtube";
  import * as youtube from "../youtube";
  import { pub, sub } from "../VirtualIPC";
  import { AUTH_STORAGE_KEY } from "../consts/auth";

  console.log($authStore);

  function spawnWindow(path, seedData = {}) {
    let windowID = uid(20);
    const emit = pub(windowID);
    emit("seed", "hello!");

    // TODO: Create secret pair for state, maybe pass in port?

    window.open(
      youtube.createAuthChallenge(),
      null,
      "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no"
    );
  }

  youtube.init().then(() => {
    console.log("YouTube API Loaded");
  });

  function doRequest() {
    youtube.withYoutube.getPlaylists().then((d) => {
      console.log(d);
    });
  }

  let playlists
</script>

<svelte:head>
  <title>YouUp</title>
</svelte:head>

<h1>NeutralinoJs</h1>
<div id="info" />
<br />
<div>
  {JSON.stringify($authStore)}
  <!-- <a href="#" on:click={() => controller.openDocs()}>Docs</a> &middot;
  <a href="#" on:click={() => controller.openTutorial()}>Tutorial</a> &middot; -->
</div>

<Button
  on:click={() => {
    spawnWindow("upload", { data: "aaf" });
  }}>Authenticate</Button
>

<Button
  on:click={() => {
    doRequest();
  }}>Request</Button
>

<Button
  on:click={() => {
    console.log(Neutralino);
    Neutralino.os.showOpenDialog();
  }}>Open</Button
>
