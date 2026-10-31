<script setup>
import { computed, ref } from 'vue'
import { connection, dismissApiError, retryLastRequest } from '@/lib/api'
import Btn from './Btn.vue'
import Icon from './Icon.vue'

const checking = ref(false)

const offline = computed(() => !connection.online)
const unreachable = computed(() => connection.online && !connection.apiReachable)
const serverError = computed(() => connection.online && connection.apiReachable && Boolean(connection.error))
const visible = computed(() => offline.value || unreachable.value || serverError.value)

const tone = computed(() => (offline.value || unreachable.value ? 'signal' : 'attention'))
const toneClass = computed(() =>
  tone.value === 'signal'
    ? 'border-signal-bd bg-signal-bg text-signal'
    : 'border-attention-bd bg-attention-bg text-attention',
)

const message = computed(() => {
  if (offline.value) return "You're offline — new records can't be saved until the connection returns."
  if (unreachable.value) return "Can't reach the Tenure API. Sign-in, payments and requests may not save."
  if (connection.error?.status) return `The API returned ${connection.error.status}: ${connection.error.message}`
  return connection.error?.message || 'The API request failed.'
})

async function retry() {
  if (checking.value) return
  checking.value = true
  try {
    // Replays the failed call; only probes the API when nothing is pending.
    await retryLastRequest()
  } finally {
    checking.value = false
  }
}
</script>

<template>
  <div
    v-if="visible"
    class="flex flex-wrap items-center gap-3 border-b px-4 py-2 text-[12px] font-medium"
    :class="toneClass"
    role="status"
    aria-live="polite"
  >
    <Icon :name="tone === 'signal' ? 'alert' : 'info'" :size="15" class="shrink-0" />
    <p class="min-w-0 flex-1 leading-snug">
      {{ message }}
      <span v-if="checking" class="font-mono text-[10px] uppercase tracking-[0.08em] opacity-70">checking…</span>
    </p>
    <Btn variant="ghost" size="xs" :disabled="checking" @click="retry">
      <Icon name="check" :size="13" />
      {{ connection.hasFailedRequest ? 'Retry' : 'Recheck' }}
    </Btn>
    <button
      v-if="serverError"
      type="button"
      class="rounded-chip p-1 transition hover:bg-surface/70"
      aria-label="Dismiss API error"
      @click="dismissApiError"
    >
      <Icon name="close" :size="14" />
    </button>
  </div>
</template>
