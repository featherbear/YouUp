<script>
  import {
    Button,
    TextInput,
    TextInputSkeleton,
  } from "carbon-components-svelte";

  import { uid } from "uid";
  import { createAuthChallenge } from "../youtube";

  import { pub, sub } from "../VirtualIPC";

  // gapi.load("client", function () {
  // });

  function spawnWindow(path, seedData = {}) {
    let windowID = uid(20);
    const emit = pub(windowID);
    emit("seed", "hello!");

    // TODO: Create secret pair for state, maybe pass in port?

    window.open(
      createAuthChallenge(function (response) {
        console.log("response is", response);
      }),
      "WEEEE",
      "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no"
    );
    // Navigate
    // Redirect to a port loopback
    // $$$
    // Poll with sessionStorage?

    // gapi.auth.setToken({})

    // gapi.auth2.getAuthInstance().signIn();

    // Neutralino.window.create(`/resources/index.html#/${path}/${windowID}`);
  }
</script>

<svelte:head>
  <title>YouUp</title>
</svelte:head>

<h1>NeutralinoJs</h1>
<div id="info" />
<br />
<div>
  <!-- <a href="#" on:click={() => controller.openDocs()}>Docs</a> &middot;
  <a href="#" on:click={() => controller.openTutorial()}>Tutorial</a> &middot; -->
</div>

<Button
  on:click={() => {
    spawnWindow("upload", { data: "aaf" });
  }}>Change View</Button
>

<Button
  on:click={() => {
    console.log(Neutralino);
    Neutralino.os.showOpenDialog();
  }}>Open</Button
>
