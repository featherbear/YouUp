<script>
  import { completeAuthChallenge, parseResponseURL } from "../../youtube";

  let response = parseResponseURL(
    location.hash.substring(location.hash.indexOf("?") + 1)
  );
  
  completeAuthChallenge(response)
  window.close();
</script>

Auth complete!
