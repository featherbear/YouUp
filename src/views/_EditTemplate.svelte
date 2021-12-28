<script>
  import {
    TextInput,
    Modal,
    Form,
    TextArea,
    Select,
    SelectItem,
    Tile,
    CodeSnippet,
    TooltipDefinition,
  } from "carbon-components-svelte";
  import { asPlaylistObject } from "../types/SvelteCompat";
  import { createEventDispatcher } from "svelte";
  import { parsePlaylistObject, TestFile } from "../YouUpPlaylistObject";

  const dispatch = createEventDispatcher();

  export let playlist;
  let parsedPlaylist = parsePlaylistObject(playlist);

  let data = {
    title: parsedPlaylist.YouUp?.titleFormat,
    description: parsedPlaylist.YouUp?.descriptionFormat,
    privacy: parsedPlaylist.YouUp?.defaultPrivacy,
  };

  let formReady = false;
  $: formReady = !!data.title?.trim();

  // Set DOM readonly attribute without building readonly component elements
  let previewTitleElem;
  $: previewTitleElem?.setAttribute("readonly", true);

  function submit() {
    if (!formReady) return;
    dispatch("submit", data);
    return data;
  }
</script>

{#if playlist}
  {#await asPlaylistObject(playlist) then obj}
    <Modal
      open={true}
      modalHeading="Update templates for {obj.title}"
      primaryButtonText="Save"
      primaryButtonDisabled={!formReady}
      secondaryButtonText="Cancel"
      on:click:button--primary={() => submit()}
      on:click:button--secondary={() => dispatch("close")}
    >
      <div class="splitPane">
        <Form>
          <TextInput
            labelText="Title Format"
            placeholder="e.g. YouUp Sessions | #:newCount:"
            required={true}
            bind:value={data.title}
          />

          <TextArea
            labelText="Description"
            placeholder="e.g. File - :fileTitle: (:date-YYYYMMDD:)"
            bind:value={data.description}
            style="resize: none"
          />

          <Select labelText="Default Visiblity" bind:selected={data.privacy}>
            <SelectItem value="public" text="Public" />
            <SelectItem value="unlisted" text="Unlisted" />
            <SelectItem value="private" text="Private" />
          </Select>
        </Form>
        <section class="preview">
          <Form>
            <TextInput
              labelText="Title Preview"
              placeholder="Type something in!"
              bind:ref={previewTitleElem}
              light
              value={parsedPlaylist.YouUp.generateTitle(TestFile, data.title)}
              tabindex={-1}
            />

            <TextArea
              labelText="Description Preview"
              placeholder="Type something in!"
              readonly={true}
              value={parsedPlaylist.YouUp.generateDescription(
                TestFile,
                data.description
              )}
              style="resize: none"
              tabindex={-1}
            />
            <Tile>
              <TooltipDefinition
                tooltipText={"Template tags allow you to add variables to your title and descriptions"}
                direction="top"
              >
                <h5>Template Tags</h5>
              </TooltipDefinition>

              <ul>
                {#each Object.entries(parsedPlaylist.YouUp.buildReplacements(TestFile)) as [key, value] (key)}
                  <li>
                    <CodeSnippet
                      tabindex={-1}
                      type="inline"
                      code=":{key}:"
                      light={true}
                    /> = {value}
                  </li>
                {/each}
              </ul>
            </Tile>
          </Form>
        </section>
      </div>
    </Modal>
  {/await}
{/if}

<style>
  .splitPane {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }
</style>
