import { createRouter, createWebHistory } from 'vue-router'
import ManagerDashboardView from '../views/ManagerDashboardView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'manager-dashboard',
      component: ManagerDashboardView,
    },
  ],
})
