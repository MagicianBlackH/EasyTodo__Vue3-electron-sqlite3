import { createApp } from 'vue'
import App from './App.vue'
import 'ant-design-vue/dist/antd.css'
import naive from 'naive-ui'

const app = createApp(App)
app.use(naive).mount('#app')
