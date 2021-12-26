<script>
  import { setContext } from "svelte";

  export let controller;
  import Router from "svelte-spa-router";
  import { routes } from "./routes";

  $: setContext("controller", controller);
</script>

<Router {routes} />
