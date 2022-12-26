import { createRouter, createWebHistory } from 'vue-router'
import WheelView from '../views/WheelView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/wheel',
      name: 'wheel',
      component: WheelView
    }
  ]
})

export default router
