const { optimizeImports } = require('carbon-preprocess-svelte')
const sveltePreprocess = require('svelte-preprocess')

module.exports = {
  preprocess: [optimizeImports(), sveltePreprocess()]
}
