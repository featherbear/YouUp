<script>
  import { onMount } from "svelte";

  // fn
  export let handler = null;
  export let notifyFn = null;

  const preventDefaults = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
  };

  function registerDragEvents(dragOverlay) {
    ["dragenter", "dragover"].forEach((evtName) => {
      dragOverlay.addEventListener(
        evtName,
        (event) => preventDefaults(event),
        false
      );
    });
    ["dragleave", "drop"].forEach((evtName) => {
      dragOverlay.addEventListener(
        evtName,
        (event) => preventDefaults(event),
        false
      );
    });

    dragOverlay.addEventListener(
      "drop",
      (event) => {
        preventDefaults(event);
        notifyFn(event);
        setOverlayVisiblity(false);

        let file = event.dataTransfer.files[0];
        if (!file) return;
        if (!file.type.startsWith("video/")) {
          console.info(
            `Attempted to drag \`${file.name}\` but it has an invalid content type`
          );
          return;
        }
        handler?.(file);
      },
      false
    );
  }

  let isVisible;
  export function setOverlayVisiblity(value) {
    isVisible = value;
  }
</script>

<div class="dragContainer">
  <div class="dragOverlay" use:registerDragEvents class:visible={isVisible} />
</div>

<style>
  .dragContainer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .dragContainer .dragOverlay.visible {
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);

    border-radius: 5px;

    background-color: rgba(29, 40, 51, 0.8);
    outline: 2px dashed black;
    outline-offset: -10px;

    height: 100%;
    width: 100%;
  }

  .dragContainer .dragOverlay.visible::before {
    content: "Drop video to upload";
    color: white;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dragContainer .dragOverlay.visible:hover {
    background-color: rgba(29, 40, 51, 0.4) !important;
  }
</style>
