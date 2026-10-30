<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Spacing between dot centres in pixels. */
  size: { type: Number, default: 64 },
  /** Diameter of each dot. */
  mark: { type: Number, default: 4 },
  /** Dot colour, including alpha. */
  color: { type: String, default: 'rgba(15, 27, 38, 0.18)' },
  /** Pin the pattern to the viewport instead of the nearest positioned parent. */
  fixed: { type: Boolean, default: false },
})

const patternStyle = computed(() => {
  const centre = props.size / 2
  const radius = props.mark / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${props.size}" height="${props.size}" viewBox="0 0 ${props.size} ${props.size}"><circle cx="${centre}" cy="${centre}" r="${radius}" fill="${props.color}"/></svg>`

  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundSize: `${props.size}px ${props.size}px`,
  }
})
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none -z-10"
    :class="fixed ? 'fixed inset-0' : 'absolute inset-0'"
    :style="patternStyle"
  />
</template>
