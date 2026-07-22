<script setup>
import statusNew from '../assets/figma/status-new.svg'
import statusQueue from '../assets/figma/status-queue.svg'
import statusProcess from '../assets/figma/status-process.svg'
import statusDone from '../assets/figma/status-done.svg'
import statusRejected from '../assets/figma/status-rejected.svg'

const props = defineProps({
  status: { type: String, required: true },
})

const statusMap = {
  Baru: { className: 'new', icon: statusNew },
  'Dalam Antrean': { className: 'queue', icon: statusQueue },
  Diproses: { className: 'process', icon: statusProcess },
  Selesai: { className: 'done', icon: statusDone },
  Ditolak: { className: 'rejected', icon: statusRejected },
  Dibatalkan: { className: 'cancelled', icon: statusQueue },
}

const presentation = statusMap[props.status] ?? statusMap.Baru
</script>

<template>
  <span
    class="status-badge"
    :class="`status-badge--${presentation.className}`"
  >
    <img
      :src="presentation.icon"
      alt=""
      width="6"
      height="6"
    >
    {{ status }}
  </span>
</template>
