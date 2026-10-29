<script setup>
import Icon from './Icon.vue'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  textarea: { type: Boolean, default: false },
  rows: { type: [String, Number], default: 3 },
  search: { type: Boolean, default: false },
  error: { type: String, default: '' },
  autocomplete: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label
    class="block rounded-btn border bg-surface px-3.5 py-2.5 transition"
    :class="error ? 'border-signal' : 'border-rule-2 focus-within:border-navy-800 focus-within:ring-2 focus-within:ring-navy-800/15'"
  >
    <span v-if="label" class="block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
      {{ label }}
    </span>
    <span v-if="search" class="mt-0.5 flex items-center gap-2.5 text-ink-3">
      <Icon name="search" :size="18" />
      <input
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        class="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </span>
    <textarea
      v-else-if="textarea"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      class="mt-1 w-full resize-none bg-transparent text-sm leading-relaxed text-ink outline-none placeholder:text-ink-3"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <input
      v-else
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      class="mt-1 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </label>
  <p v-if="error" class="mt-1.5 text-[11.5px] text-signal">{{ error }}</p>
</template>
