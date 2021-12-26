<script>
  // Do not use this component directly
  // Use the .createDialog(playlist: Playlist) method

  import { TextInput, Modal, Form } from "carbon-components-svelte";
  import { asPlaylistObject } from "../types/SvelteCompat";
  import { createEventDispatcher, onMount } from "svelte";
  import { parsePlaylistObject } from "../YouUpPlaylistObject";

  const dispatch = createEventDispatcher();

  export let playlist;
  let parsedPlaylist = parsePlaylistObject(playlist);
  console.log(parsedPlaylist);

  let data = {
    title: "",
    description: "",
  };

  let formReady = false;
  $: formReady = !!data.title?.trim();

  function submit() {
    if (!formReady) return;
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
      on:click:button--secondary={() => dispatch("destroy")}
    >
      <Form>
        <TextInput
          labelText="Title (required)"
          placeholder="Enter video title..."
          required={true}
          bind:value={data.title}
        />

        <TextInput
          labelText="Description"
          placeholder="Enter video description..."
          bind:value={data.description}
        />
      </Form>
    </Modal>
  {/await}
{/if}
