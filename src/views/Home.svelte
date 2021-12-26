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
  import { asPlaylistObjectArray } from "../types/SvelteCompat";

  import { attach as attachDragOverlay, registerDragListener } from "../drag/";
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
    doRequest();
    registerDragListener();
  });

  function doRequest() {
    youtube.withYoutube.getPlaylists().then((d) => {
      playlists = d;
    });
  }

  function handleSelectFile(f) {
    console.log(f);
    youtube.withYoutube.uploadVideo(f);
  }

  let playlists = [];
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

<div class="cards">
  {#each asPlaylistObjectArray(playlists) as playlist (playlist.id)}
    <div use:attachDragOverlay={handleSelectFile}>
      <h4>{playlist.title} ({playlist.itemCount})</h4>
      <p>{playlist.description}</p>

      <img
        src={(
          playlist.thumbnails.maxres ||
          playlist.thumbnails.standard ||
          playlist.thumbnails.high ||
          playlist.thumbnails.medium ||
          playlist.thumbnails.default
        )?.url}
        alt="playlist thumbnail"
      />
    </div>
  {/each}
</div>

<style>
  .cards {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 15px;
    padding-left: 15px;
    padding-right: 15px;
    /* justify-content: center; */
  }
  @media (max-width: 540px) {
    .cards {
      flex-direction: column;
      background-color: red;
    }
    .cards {
      width: 100%;
    }
  }
  .cards > div {
    width: 360px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    background-color: #bec6dd;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;

    /* Set relative style for absolute positioned drag */
    position: relative;
  }
  .cards > div:hover {
    background-color: #d4dcf3;
  }
  .cards > div > p {
    flex: 1;
  }
  .cards > div > img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 5px;
  }
</style>
