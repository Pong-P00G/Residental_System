<script setup>
defineProps({
  shape: { type: String, default: 'block' }, // block | text | circle
})

const shapes = {
  text: 'rounded',
  circle: 'rounded-full',
}
</script>

<template>
  <span aria-hidden="true" class="skeleton block" :class="shapes[shape] || ''" />
</template>
