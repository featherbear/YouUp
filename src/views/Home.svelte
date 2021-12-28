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
  import {
    updatePlaylistInternal,
    regeneratePlaylistMetadata,
    sanitiseText,
  } from "../YouUpPlaylistObject";
  import dayjs from "dayjs";
  import dayjs_relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(dayjs_relativeTime);

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

  let filePickerElem;

  function handleSelectFile(f, playlist) {
    createPlaylistDialog(UploadDialog, playlist, { file: f }).then(
      async (resp) => {
        if (!resp) return;
        const { detail } = resp;

        youtube.withYoutube(async (c) => {
          const video = await youtube.withYoutube.uploadVideo(f, detail);
          await c.playlistItems.insert({
            part: "snippet",
            snippet: {
              playlistId: playlist.id,
              resourceId: video.id,
            },
          });
          alert(":)");
        });
      }
    );
  }

  function openEditModal(playlist) {
    createPlaylistDialog(EditTemplate, playlist).then(async (resp) => {
      if (!resp) return;
      const { detail } = resp;
      let newDescription = regeneratePlaylistMetadata(
        updatePlaylistInternal(playlist, {
          titleFormat: detail.title,
          descriptionFormat: detail.description,
          defaultPrivacy: detail.privacy,
        })
      );
      playlist.description = newDescription;

      await youtube.withYoutube.updateRemotePlaylist(playlist, newDescription);

      // Reassign playlist array to cause UI update
      // Or maybe use the Svelte #key block?
      let idx = playlists.indexOf(playlist);
      playlists = [
        ...playlists.slice(0, idx),
        playlist,
        ...playlists.slice(idx + 1),
      ];
    });
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
  {#if $authStore}
    Current access token expires {dayjs().to($authStore.expiry)}
  {/if}
  <!-- <a href="#" on:click={() => controller.openDocs()}>Docs</a> &middot;
  <a href="#" on:click={() => controller.openTutorial()}>Tutorial</a> &middot; -->
</div>

<Button
  on:click={() => {
    window.open(
      youtube.createAuthChallenge(),
      null,
      "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no"
    );
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

<input
  type="file"
  bind:this={filePickerElem}
  on:change={() => {
    let playlist = filePickerElem.target;
    filePickerElem.target = null;
    if (!playlist) return;
    handleSelectFile(filePickerElem.files[0], playlist);
  }}
  accept="video/*"
  style="display:none"
/>

<div class="cards">
  {#key playlists}
    {#each asPlaylistObjectArray(playlists) as playlist (playlist.id)}
      <div use:attachDragOverlay={(f) => handleSelectFile(f, playlist)}>
        <h4>{playlist.title} ({playlist.itemCount})</h4>
        <p>{sanitiseText(playlist.description)}</p>

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
          <Button size={"small"} on:click={() => openEditModal(playlist)}>
            Edit
          </Button>
          <Button
            size={"small"}
            on:click={() => {
              filePickerElem.target = playlist;
              filePickerElem.click();
            }}>Upload</Button
          >
        </ButtonSet>
      </div>
    {/each}
  {/key}
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
