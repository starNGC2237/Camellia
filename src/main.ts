import {createApp} from 'vue'
import router from './router'
import './assets/index.css'
import App from './App.vue'

const app = createApp(App)
app
  .use(router)
  .mount('#app')
  .$nextTick(() => {
    // Remove Preload scripts loading
    postMessage({payload: 'removeLoading'}, '*')

    // Use contextBridge
    window.ipcRenderer.on('main-process-message', (_event, message) => {
      console.log(message)
    })
  })
