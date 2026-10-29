<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  to: { type: [String, Object], default: '' },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})

const variants = {
  primary: 'border-transparent bg-navy-800 text-white hover:bg-navy-900',
  ghost: 'border-rule-2 bg-surface text-ink hover:bg-navy-50',
  danger: 'border-signal-bd bg-surface text-signal hover:bg-signal-bg',
  light: 'border-transparent bg-white text-navy-900 hover:bg-navy-100',
  quiet: 'border-transparent bg-alt text-ink-2 hover:bg-navy-50 hover:text-ink',
}

const sizes = {
  md: 'h-12 px-5 text-sm',
  sm: 'h-9 px-3.5 text-xs',
  xs: 'h-7 px-2.5 text-[11px]',
}

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 rounded-btn border font-semibold transition-colors',
  'disabled:pointer-events-none disabled:border-transparent disabled:bg-board disabled:text-ink-3',
  variants[props.variant] || variants.primary,
  sizes[props.size] || sizes.md,
  props.block ? 'w-full' : 'w-auto',
])
</script>

<template>
  <component
    :is="to ? RouterLink : 'button'"
    :to="to || undefined"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled"
    :class="classes"
  >
    <slot />
  </component>
</template>
