<script>
  import {
    Tile,
    Button,
    ButtonSet,
    TextInput,
    TextInputSkeleton,
  } from "carbon-components-svelte";

  import { uid } from "uid";
  import { authStore } from "../youtube";
  import * as youtube from "../youtube";
  import { asPlaylistObjectArray } from "../types/SvelteCompat";

  import { attach as attachDragOverlay, registerDragListener } from "../drag/";
import createPlaylistDialog from "./PlaylistDialogLauncher";
import UploadDialog from "./_UploadDialog.svelte";
import EditTemplate from "./_EditTemplate.svelte";

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
    registerDragListener();
  });

  function doRequest() {
    youtube.withYoutube.getPlaylists().then((d) => {
      playlists = d;
    });
  }

  function openUploadModal(playlist) {
    console.log(playlist);
    createPlaylistDialog(UploadDialog, playlist)
  }

  function openEditModal(playlist) {
    createPlaylistDialog(EditTemplate, playlist)
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
  }}>Load Playlists</Button
>

<!-- <Button
  on:click={() => {
    console.log(Neutralino);
    Neutralino.os.showOpenDialog();
  }}>Open</Button
> -->

      <!-- use:attachDragOverlay={function (f) {
        console.log("select ", f);
      }} -->
<div class="cards">
  {#each asPlaylistObjectArray(playlists) as playlist (playlist.id)}
    <div
      on:click|self={() => openUploadModal(playlist)}
    >
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
      <ButtonSet>
        <Button
          size={"small"}
          on:click={() => openEditModal(playlist)}
        >
          abc
        </Button>
        <Button size={"small"}>def</Button>
      </ButtonSet>
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
