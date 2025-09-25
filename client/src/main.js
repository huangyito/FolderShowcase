import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Category from './views/Category.vue'
import Work from './views/Work.vue'
import About from './views/About.vue'
import './style.css'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/category/:name', name: 'Category', component: Category },
  { path: '/work/:category/:work', name: 'Work', component: Work },
  { path: '/about', name: 'About', component: About }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')