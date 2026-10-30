<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps({
  variant: { type: String, default: 'card' }, // card | plain
})

const bar = ref(null)
const stuck = ref(false)
let frame = 0

function measure() {
  frame = 0
  const element = bar.value
  if (!element || window.innerWidth >= 1024) {
    stuck.value = false
    return
  }
  const offset = Number.parseFloat(getComputedStyle(element).top) || 0
  stuck.value = element.getBoundingClientRect().top <= offset + 1
}

function requestMeasure() {
  if (frame) return
  frame = requestAnimationFrame(measure)
}

onMounted(() => {
  measure()
  window.addEventListener('scroll', requestMeasure, { passive: true })
  window.addEventListener('resize', requestMeasure)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', requestMeasure)
  window.removeEventListener('resize', requestMeasure)
})
</script>

<template>
  <div
    ref="bar"
    class="sticky top-16 z-20 -mx-4 mb-5 border-b border-rule bg-alt/95 px-4 py-2.5 backdrop-blur transition-shadow sm:top-20 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
    :class="stuck ? 'shadow-e1' : ''"
  >
    <div
      v-if="variant === 'card'"
      class="flex flex-col gap-3 rounded-card border border-rule bg-surface p-4 shadow-e1 lg:flex-row lg:items-center"
    >
      <slot />
      <div v-if="$slots.action && stuck" class="lg:hidden">
        <slot name="action" />
      </div>
    </div>

    <div v-else class="flex flex-wrap items-center gap-2">
      <slot />
      <div v-if="$slots.action && stuck" class="w-full pt-0.5 lg:hidden">
        <slot name="action" />
      </div>
    </div>
  </div>
</template>
