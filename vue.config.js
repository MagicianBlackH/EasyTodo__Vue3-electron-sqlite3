const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: (config) => {
        config.output.filename('background.js');
      },
      nodeIntegration: true,
      builderOptions: {
        appId: 'hpc.easytodo.app',
        productName: 'EasyTodo',
        copyright: 'Copyright © 2022',
        win: {
          icon: './easytodoIco.ico',
          target: "portable"
        },
        extraResources: {
          from: './easytodo_DB.db',
          to: './'
        }
      }
    },
  }
})
