<script>
  import { Modal } from "carbon-components-svelte";
  import { asPlaylistObject } from "src/types/SvelteCompat";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let open = true;

  export let playlist;

  let formReady = false;

  $: formReady = false;

  function submit() {
    if (!formReady) return;
  }

  import {
    Button,
    TextInput,
    TextInputSkeleton,
  } from "carbon-components-svelte";
</script>

{#if playlist}
  {#await asPlaylistObject(playlist) then obj}
    <Modal
      bind:open
      modalHeading="Upload video to {obj.title}"
      primaryButtonText="Upload"
      primaryButtonDisabled={!formReady}
      secondaryButtonText="Cancel"
      on:click:button--primary={() => submit()}
      on:click:button--secondary={() => dispatch("destroy")}
    >
      <TextInput labelText="Title" placeholder="Enter video title..." />

      <TextInput
        labelText="Description"
        placeholder="Enter video description..."
      />
    </Modal>
  {/await}
{/if}
