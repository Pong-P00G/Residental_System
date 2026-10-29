<script setup>
import { onMounted, onUnmounted } from 'vue'
import Icon from './Icon.vue'

defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})

const emit = defineEmits(['close'])

function onKey(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 bg-navy-900/45" @click="emit('close')"></div>
    <div
      class="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] animate-sheet-up overflow-y-auto rounded-t-2xl border border-rule bg-surface px-5 pb-6 pt-3 shadow-e2 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85vh] sm:w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-rule-2 sm:hidden"></div>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p v-if="eyebrow" class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
            {{ eyebrow }}
          </p>
          <h3 class="mt-1 text-lg font-bold tracking-[-0.025em]">{{ title }}</h3>
          <p v-if="subtitle" class="mt-1 text-[13px] text-ink-2">{{ subtitle }}</p>
        </div>
        <button
          type="button"
          class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-rule-2 bg-surface text-ink-2 transition hover:bg-alt"
          aria-label="Close"
          @click="emit('close')"
        >
          <Icon name="close" :size="16" />
        </button>
      </div>
      <div class="mt-4">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
