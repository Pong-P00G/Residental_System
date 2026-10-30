<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authErrorMessage } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  redirect: { type: String, default: '' },
})

const emit = defineEmits(['error', 'signed-in'])

const auth = useAuthStore()
const router = useRouter()
const pending = ref('')

async function signIn(provider) {
  if (pending.value) return
  pending.value = provider
  emit('error', '')
  try {
    await auth.signInWithProvider(provider)
    emit('signed-in')
    router.push(props.redirect || '/')
  } catch (err) {
    emit('error', authErrorMessage(err))
  } finally {
    pending.value = ''
  }
}
</script>

<template>
  <div class="grid gap-2 sm:grid-cols-2">
    <button
      type="button"
      class="flex h-11 items-center justify-center gap-2.5 rounded-btn border border-rule-2 bg-surface px-3.5 text-[12.5px] font-semibold text-ink transition hover:border-navy-300 hover:bg-navy-50 disabled:pointer-events-none disabled:text-ink-3"
      :disabled="Boolean(pending)"
      @click="signIn('google')"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.86c2.26-2.08 3.56-5.14 3.56-8.87z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
      </svg>
      {{ pending === 'google' ? 'Opening Google…' : 'Google' }}
    </button>

    <button
      type="button"
      class="flex h-11 items-center justify-center gap-2.5 rounded-btn border border-rule-2 bg-surface px-3.5 text-[12.5px] font-semibold text-ink transition hover:border-navy-300 hover:bg-navy-50 disabled:pointer-events-none disabled:text-ink-3"
      :disabled="Boolean(pending)"
      @click="signIn('facebook')"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#1877F2"
          d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z"
        />
      </svg>
      {{ pending === 'facebook' ? 'Opening Facebook…' : 'Facebook' }}
    </button>
  </div>
</template>
