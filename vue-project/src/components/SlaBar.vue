<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  tone: { type: String, default: '' },
})

const barTone = computed(() => {
  if (props.tone) return props.tone
  if (props.value < 50) return 'ok'
  if (props.value >= 85) return 'crit'
  return 'warn'
})

const toneClass = computed(
  () => ({ ok: 'bg-settled', warn: 'bg-attention', crit: 'bg-signal' })[barTone.value] || 'bg-attention',
)
</script>

<template>
  <div
    class="h-1.5 w-full overflow-hidden rounded-full bg-fyi-bg"
    role="progressbar"
    :aria-valuenow="value"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <span
      class="block h-full rounded-full transition-[width]"
      :class="toneClass"
      :style="{ width: Math.min(Math.max(value, 0), 100) + '%' }"
    ></span>
  </div>
</template>
