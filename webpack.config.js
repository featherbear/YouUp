const path = require('path')
const webpack = require('webpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const svelteConfig = require('./svelte.config')

module.exports = (env, argv) => {
  const config = {
    mode: 'development',
    entry: ['./src/app.ts'],
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'resources', 'build'),
      filename: 'main.js'
    },
    plugins: [],
    module: {
      rules: [
        {
          // TODO: Integrate
          test: /\.(png|jpe?g|gif|svg|bmp|otf)$/i,
          use: [
            {
              loader: 'file-loader',
              options: { publicPath: 'resources' }
            }
          ]
        },
        {
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
              // https://github.com/TypeStrong/ts-loader/blob/ea2fcf925ec158d0a536d1e766adfec6567f5fb4/README.md#faster-builds
              // https://github.com/TypeStrong/ts-loader/blob/ea2fcf925ec158d0a536d1e766adfec6567f5fb4/README.md#hot-module-replacement
              transpileOnly: true,
              allowTsInNodeModules: true,
              compilerOptions: {
                sourceMap: argv.mode !== 'production',
                declaration: false
              }
            }
          }
        },
        {
          test: /\.mjs$/,
          type: 'javascript/auto'
        },
        {
          test: /\.svelte$/,
          use: [
            {
              /**
               * Note: Svelte Native uses a minor patch of svelte-loader. I'm not sure of the significance.
               * @see https://github.com/halfnelson/svelte-native/blob/0af94fac6ea18f54f93ab299d0b512f91d722569/demo/package.json#L26
               */
              loader: 'svelte-loader',
              options: svelteConfig
            }
          ],
        },
        {
          // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
          test: /node_modules\/svelte\/.*\.mjs$/,
          resolve: {
            fullySpecified: false
          }
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
      ]
    },
    resolve: {
      extensions: ['.ts', '.mjs', '.js', '.svelte', '.scss', '.css', '.json']
    }
  }

  if (argv.mode === 'development') {
    config.plugins.push(new ForkTsCheckerWebpackPlugin())
    config.devtool = 'source-map'
    config.watch = true
  }

  return config
}
