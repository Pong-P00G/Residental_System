<script setup>
import { computed, ref } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  textarea: { type: Boolean, default: false },
  rows: { type: [String, Number], default: 3 },
  search: { type: Boolean, default: false },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  icon: { type: String, default: '' },
  autocomplete: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const revealed = ref(false)

const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value && revealed.value ? 'text' : props.type))
</script>

<template>
  <div>
    <label
      class="block rounded-btn border bg-surface px-3.5 py-2.5 transition"
      :class="
        error
          ? 'border-signal bg-signal-bg/30 focus-within:ring-2 focus-within:ring-signal/15'
          : 'border-rule-2 hover:border-navy-300 focus-within:border-navy-800 focus-within:ring-2 focus-within:ring-navy-800/15'
      "
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

      <span v-else class="mt-1 flex items-center gap-2.5">
        <Icon v-if="icon" :name="icon" :size="16" class="shrink-0 text-ink-3" />
        <input
          :value="modelValue"
          :type="inputType"
          :placeholder="placeholder"
          :autocomplete="autocomplete"
          class="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
          @input="$emit('update:modelValue', $event.target.value)"
        />
        <button
          v-if="isPassword"
          type="button"
          class="-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded text-ink-3 transition hover:bg-alt hover:text-navy-800"
          :aria-label="revealed ? 'Hide password' : 'Show password'"
          :aria-pressed="revealed"
          @mousedown.prevent
          @click.stop="revealed = !revealed"
        >
          <Icon :name="revealed ? 'eye-off' : 'eye'" :size="16" />
        </button>
      </span>
    </label>

    <p v-if="error" class="mt-1.5 flex items-start gap-1.5 text-[11.5px] leading-snug text-signal" role="alert">
      <Icon name="alert" :size="13" class="mt-px shrink-0" />
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1.5 text-[11px] leading-snug text-ink-3">{{ hint }}</p>
  </div>
</template>
