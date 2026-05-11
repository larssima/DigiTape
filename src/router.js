import { createRouter, createWebHistory } from 'vue-router'
import Scan from './views/Scan.vue'
import Callback from './views/Callback.vue'
import History from './views/History.vue'
import Settings from './views/Settings.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Scan },
    { path: '/callback', component: Callback },
    { path: '/history', component: History },
    { path: '/settings', component: Settings }
  ]
})
