<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  tone: { type: String, default: 'neutral' },
  icon: { type: String, default: '' },
})

const tones = {
  ok: 'bg-settled-bg text-settled border-settled-bd',
  warn: 'bg-attention-bg text-attention border-attention-bd',
  crit: 'bg-signal-bg text-signal border-signal-bd',
  progress: 'bg-progress-bg text-progress border-progress-bd',
  neutral: 'bg-fyi-bg text-fyi border-fyi-bd',
  sel: 'bg-navy-800 text-white border-navy-800',
}

const classes = computed(() => [
  'inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-chip border px-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em]',
  tones[props.tone] || tones.neutral,
])
</script>

<template>
  <span :class="classes">
    <Icon v-if="icon" :name="icon" :size="12" />
    <slot />
  </span>
</template>
