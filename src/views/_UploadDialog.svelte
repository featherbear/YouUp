<script>
  // Do not use this component directly
  // Use the .createDialog(playlist: Playlist) method

  import {
    TextInput,
    TextArea,
    Select,
    SelectItem,
    Modal,
    Form,
  } from "carbon-components-svelte";
  import { asPlaylistObject } from "../types/SvelteCompat";
  import { createEventDispatcher } from "svelte";
  import { parsePlaylistObject } from "../YouUpPlaylistObject";

  const dispatch = createEventDispatcher();

  export let playlist;
  export let file;

  let parsedPlaylist = parsePlaylistObject(playlist);

  let data = {
    title: parsedPlaylist.YouUp.generateTitle(file),
    description: parsedPlaylist.YouUp.generateDescription(file),
    privacy: parsedPlaylist.YouUp.defaultPrivacy
  };

  let formReady = false;
  $: formReady = !!data.title?.trim();

  function submit() {
    if (!formReady) return;
    dispatch("submit", data);
  }
</script>

{#if playlist}
  {#await asPlaylistObject(playlist) then obj}
    <Modal
      open={true}
      modalHeading="Upload video to {obj.title}"
      primaryButtonText="Upload"
      primaryButtonDisabled={!formReady}
      secondaryButtonText="Cancel"
      on:click:button--primary={() => submit()}
      on:click:button--secondary={() => dispatch("close")}
    >
      <Form>
        <TextInput
          labelText="Title (required)"
          placeholder="Enter video title..."
          required={true}
          bind:value={data.title}
        />

        <TextArea
          labelText="Description"
          placeholder="Enter video description"
          bind:value={data.description}
          style="resize: none"
        />

        <Select labelText="Visiblity" bind:value={data.privacy}>
          <SelectItem value="public" text="Public" />
          <SelectItem value="unlisted" text="Unlisted" />
          <SelectItem value="private" text="Private" />
        </Select>
      </Form>
    </Modal>
  {/await}
{/if}
