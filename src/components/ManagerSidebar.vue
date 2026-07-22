<script setup>
import { ref } from 'vue'
import navActive from '../assets/figma/nav-active.svg'
import navDefault from '../assets/figma/nav-default.svg'

const props = defineProps({
  activeItem: { type: String, required: true },
})

const isNavigationOpen = ref(false)

const navigationItems = [
  { label: 'Dashboard', routeName: 'manager-dashboard' },
  { label: 'Tiket Baru', routeName: 'new-ticket' },
  { label: 'Lacak Tiket', routeName: 'ticket-tracking' },
  { label: 'Antrean Tiket' },
  { label: 'Laporan' },
  { label: 'Audit Log' },
]
</script>

<template>
  <button
    class="mobile-menu-button"
    type="button"
    :aria-expanded="isNavigationOpen"
    aria-controls="manager-navigation"
    @click="isNavigationOpen = !isNavigationOpen"
  >
    <span aria-hidden="true">☰</span>
    <span>Menu</span>
  </button>

  <aside
    id="manager-navigation"
    class="sidebar"
    :class="{ 'sidebar--open': isNavigationOpen }"
  >
    <div class="brand">
      <div class="brand__mark">
        UIN
      </div>
      <div>
        <strong>UPA TIPD</strong>
        <span>Helpdesk UIN Kediri</span>
      </div>
    </div>

    <nav aria-label="Navigasi pengelola">
      <template
        v-for="item in navigationItems"
        :key="item.label"
      >
        <RouterLink
          v-if="item.routeName"
          :to="{ name: item.routeName }"
          :class="{ active: item.label === props.activeItem }"
          :aria-current="item.label === props.activeItem ? 'page' : undefined"
          @click="isNavigationOpen = false"
        >
          <img
            :src="item.label === props.activeItem ? navActive : navDefault"
            alt=""
            width="20"
            height="20"
          >
          {{ item.label }}
        </RouterLink>
        <a
          v-else
          href="#"
          @click.prevent="isNavigationOpen = false"
        >
          <img
            :src="navDefault"
            alt=""
            width="20"
            height="20"
          >
          {{ item.label }}
        </a>
      </template>
    </nav>

    <div class="manager-profile">
      <span aria-hidden="true">AR</span>
      <div>
        <strong>Ahmad Rizky</strong>
        <small>Pengelola</small>
      </div>
    </div>
  </aside>
</template>
