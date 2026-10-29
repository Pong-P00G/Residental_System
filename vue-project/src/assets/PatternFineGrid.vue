<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** Grid pitch in pixels. 32 matches the data-interface grid. */
  size: { type: Number, default: 32 },
  /** Line colour, including alpha. */
  color: { type: String, default: 'rgba(15, 27, 38, 0.055)' },
  /** Pin the pattern to the viewport instead of the nearest positioned parent. */
  fixed: { type: Boolean, default: false },
})

const gridStyle = computed(() => ({
  backgroundImage: `linear-gradient(to right, ${props.color} 1px, transparent 1px), linear-gradient(to bottom, ${props.color} 1px, transparent 1px)`,
  backgroundSize: `${props.size}px ${props.size}px`,
}))
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none -z-10"
    :class="fixed ? 'fixed inset-0' : 'absolute inset-0'"
    :style="gridStyle"
  />
</template>
