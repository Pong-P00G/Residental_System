<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Spacing between crosshair centres in pixels. */
  size: { type: Number, default: 64 },
  /** Full length of each crosshair arm. */
  mark: { type: Number, default: 8 },
  /** Crosshair colour, including alpha. */
  color: { type: String, default: 'rgba(15, 27, 38, 0.18)' },
  strokeWidth: { type: Number, default: 1 },
  /** Pin the pattern to the viewport instead of the nearest positioned parent. */
  fixed: { type: Boolean, default: false },
})

const patternStyle = computed(() => {
  const centre = props.size / 2
  const half = props.mark / 2
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${props.size}" height="${props.size}" viewBox="0 0 ${props.size} ${props.size}"><path d="M${centre - half} ${centre}H${centre + half}M${centre} ${centre - half}V${centre + half}" fill="none" stroke="${props.color}" stroke-width="${props.strokeWidth}" stroke-linecap="square"/></svg>`

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
