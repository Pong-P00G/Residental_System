<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  sub: { type: String, default: '' },
  tone: { type: String, default: '' },
})

const tops = {
  crit: 'border-t-signal',
  warn: 'border-t-attention',
  ok: 'border-t-settled',
}
</script>

<template>
  <div class="rounded-card border border-rule border-t-[3px] bg-surface px-4 py-3 shadow-e1" :class="tops[tone] || 'border-t-rule-2'">
    <span class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">{{ label }}</span>
    <b class="mt-1 block font-mono text-2xl font-semibold tracking-[-0.02em]" :class="{ 'text-signal': tone === 'crit' }">
      {{ value }}
    </b>
    <span class="mt-0.5 block text-[10.5px] text-ink-3">{{ sub }}</span>
  </div>
</template>
