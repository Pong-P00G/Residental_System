<script setup>
import Icon from './Icon.vue'

defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  back: { type: String, default: '' },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-0">
      <div class="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
        <RouterLink v-if="back" :to="back" class="inline-flex items-center gap-1 text-ink-3 hover:text-navy-800">
          <Icon name="back" :size="14" />
          Back
        </RouterLink>
        <span v-if="back" class="text-rule-2">/</span>
        <span>{{ eyebrow }}</span>
      </div>
      <h1 class="mt-1 text-2xl font-bold tracking-[-0.03em] sm:text-[28px]">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="description" class="mt-1.5 max-w-2xl text-sm text-ink-2">{{ description }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
