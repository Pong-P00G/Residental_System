<script setup>
import { RouterLink } from 'vue-router'
import Icon from './Icon.vue'

defineProps({
  title: { type: String, required: true },
  meta: { type: String, default: '' },
  tone: { type: String, default: '' },
  to: { type: [String, Object], default: '' },
  tall: { type: Boolean, default: false },
  chevron: { type: Boolean, default: true },
})

const key = (tone) => ({ warn: 'bg-attention', crit: 'bg-signal', ok: 'bg-settled' })[tone] || 'bg-rule-2'
</script>

<template>
  <component
    :is="to ? RouterLink : 'div'"
    :to="to || undefined"
    class="group relative flex items-start gap-3 overflow-hidden rounded-card border border-rule bg-surface p-4 shadow-e1 transition hover:border-navy-300"
    :class="tall ? 'py-4' : ''"
  >
    <span class="absolute bottom-3 left-0 top-3 w-[3px] rounded-r" :class="key(tone)" aria-hidden="true"></span>
    <div class="min-w-0 flex-1">
      <b class="block text-[13px] font-semibold leading-snug">{{ title }}</b>
      <span v-if="meta" class="mt-0.5 block text-[11.5px] text-ink-2">{{ meta }}</span>
      <slot />
    </div>
    <slot name="right" />
    <Icon v-if="chevron" name="chevron" :size="16" class="mt-0.5 shrink-0 text-ink-3" />
  </component>
</template>
