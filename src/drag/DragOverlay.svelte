<script>
  import { onMount } from "svelte";

  // fn
  export let handler;

  let dragOverlay;

  const preventDefaults = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
  };

  onMount(function () {
    ["dragenter", "dragover"].forEach((evtName) => {
      dragOverlay.addEventListener(
        evtName,
        (event) => {
          preventDefaults(event);
          highlightElem(dragOverlay, true);
        },
        false
      );
    });
    ["dragleave", "drop"].forEach((evtName) => {
      dragOverlay.addEventListener(
        evtName,
        (event) => {
          preventDefaults(event);
          highlightElem(dragOverlay, false);
        },
        false
      );
    });

    dragOverlay.addEventListener(
      "drop",
      (event) => {
        preventDefaults(event);
        showDrag(false);
        let file = event.dataTransfer.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
          console.info(
            `Attempted to drag \`${file.name}\` but it has an invalid content type`
          );
          return;
        }
        handler?.(file);
      },
      false
    );
  });

  let isVisible;
  export function setOverlayVisiblity(value) {
    isVisible = value;
  }
</script>

<div class="dragContainer">
  <div class="dragOverlay" bind:this={dragOverlay} class:visible={isVisible} />
</div>

<style>
  .dragContainer {
    position: relative;
  }

  .dragContainer .dragOverlay.visible {
    background-color: white;
    outline: 2px dashed black;
    outline-offset: -10px;

    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .dragContainer .dragOverlay.visible::before {
    content: "Drop image to upload";
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dragContainer:hover {
    background-color: rgb(220, 225, 230) !important;
  }
</style>
