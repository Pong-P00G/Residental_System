<script setup>
defineProps({
  steps: { type: Array, default: () => [] },
})

const dot = (state) => {
  if (state === 'done') return 'border-settled bg-settled'
  if (state === 'now') return 'border-attention bg-surface ring-4 ring-attention-bg'
  return 'border-rule-2 bg-surface'
}
</script>

<template>
  <ol class="relative space-y-4 pl-6">
    <span class="absolute bottom-2 left-[5px] top-2 w-px bg-rule" aria-hidden="true"></span>
    <li v-for="(step, index) in steps" :key="index" class="relative">
      <span class="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full border-2" :class="dot(step.state)"></span>
      <b class="block text-[13px] font-semibold leading-snug">{{ step.label }}</b>
      <span class="mt-0.5 block text-[11px] text-ink-3">{{ step.meta }}</span>
      <slot name="step" :step="step" :index="index" />
    </li>
  </ol>
</template>
