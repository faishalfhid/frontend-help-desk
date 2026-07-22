<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: String, required: true },
  note: { type: String, required: true },
  accent: {
    type: String,
    default: 'green',
    validator: (value) => ['green', 'blue', 'gold', 'red'].includes(value),
  },
  icon: { type: String, required: true },
})
</script>

<template>
  <article
    class="kpi-card"
    :class="`kpi-card--${accent}`"
  >
    <div class="kpi-card__top">
      <p>{{ title }}</p>
      <img
        :src="icon"
        alt=""
        width="32"
        height="32"
      >
    </div>
    <strong>{{ value }}</strong>
    <span>{{ note }}</span>
  </article>
</template>
