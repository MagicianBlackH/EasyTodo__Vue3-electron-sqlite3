const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: (config) => {
        config.output.filename('background.js');
      },
      nodeIntegration: true
    },
  }
})
