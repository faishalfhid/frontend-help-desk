import { createRouter, createWebHistory } from 'vue-router'
import ManagerDashboardView from '../views/ManagerDashboardView.vue'
import NewTicketView from '../views/NewTicketView.vue'
import TicketTrackingView from '../views/TicketTrackingView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'manager-dashboard',
      component: ManagerDashboardView,
    },
    {
      path: '/tiket-baru',
      name: 'new-ticket',
      component: NewTicketView,
    },
    {
      path: '/lacak-tiket',
      name: 'ticket-tracking',
      component: TicketTrackingView,
    },
  ],
})
