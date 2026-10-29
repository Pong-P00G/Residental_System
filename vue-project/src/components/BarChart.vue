<script setup>
import { computed } from 'vue'
import { compactMoney } from '@/data/app'

const props = defineProps({
  series: { type: Array, default: () => [] }, // [{ label, value, secondary? }]
  height: { type: Number, default: 132 },
  money: { type: Boolean, default: true },
  showSecondary: { type: Boolean, default: false },
  tone: { type: String, default: 'bg-navy-800' },
  secondaryTone: { type: String, default: 'bg-navy-100' },
})

const max = computed(() => {
  const values = props.series.flatMap((item) => [item.value, props.showSecondary ? item.secondary : 0])
  return Math.max(...values, 1)
})

const heightOf = (value) => `${Math.max((Number(value || 0) / max.value) * 100, 2)}%`
const format = (value) => (props.money ? compactMoney(value) : value)
</script>

<template>
  <div class="flex items-end gap-1.5" :style="{ height: height + 'px' }" role="img" aria-label="Monthly bar chart">
    <div v-for="item in series" :key="item.label" class="group flex h-full flex-1 flex-col justify-end gap-1">
      <div class="relative flex h-full items-end justify-center gap-0.5">
        <span
          v-if="showSecondary"
          class="w-1/2 rounded-t-[2px] transition group-hover:opacity-90"
          :class="secondaryTone"
          :style="{ height: heightOf(item.secondary) }"
          :title="`Invoiced ${format(item.secondary)}`"
        ></span>
        <span
          class="w-1/2 rounded-t-[2px] transition group-hover:opacity-90"
          :class="tone"
          :style="{ height: heightOf(item.value) }"
          :title="`${item.label}: ${format(item.value)}`"
        ></span>
      </div>
      <span class="text-center font-mono text-[9px] uppercase tracking-[0.04em] text-ink-3">{{ item.label }}</span>
    </div>
  </div>
</template>
