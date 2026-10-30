<script setup>
import { ref } from 'vue'
import { org } from '@/data/app'
import { authErrorMessage } from '@/lib/firebase'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import AuthShell from '@/components/AuthShell.vue'
import Field from '@/components/Field.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
const auth = useAuthStore()

const email = ref('')
const error = ref('')
const sent = ref(false)
const submitting = ref(false)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function sendLink() {
  if (!emailPattern.test(email.value.trim())) {
    error.value = 'Enter the email on your tenancy record.'
    return
  }
  error.value = ''
  submitting.value = true
  try {
    await auth.requestPasswordReset(email.value.trim())
    sent.value = true
  } catch (err) {
    error.value = authErrorMessage(err)
  } finally {
    submitting.value = false
  }
}

async function resend() {
  try {
    await auth.requestPasswordReset(email.value.trim())
  } catch (err) {
    store.toast(authErrorMessage(err))
  }
}

function startOver() {
  sent.value = false
  submitting.value = false
  email.value = ''
  error.value = ''
}
</script>

<template>
  <AuthShell
    headline="Get back into your home."
    sub="We will send a one-time link so you can choose a new password. Nothing about your tenancy changes."
  >
    <div class="flex items-center justify-between gap-3">
      <span
        class="inline-flex items-center gap-1.5 rounded-chip border border-navy-100 bg-navy-50 px-2 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-navy-600"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-navy-600" />
        Account recovery
      </span>
      <span class="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">Step {{ sent ? 2 : 1 }}/2</span>
    </div>

    <template v-if="!sent">
      <h2 class="mt-3 text-[26px] font-bold leading-tight tracking-[-0.035em]">Forgot password</h2>
      <p class="mt-1.5 text-sm leading-relaxed text-ink-2">
        Enter the email on your tenancy record and we will send a reset link, usually within a minute.
      </p>

      <form class="mt-6 flex flex-col gap-3" novalidate @submit.prevent="sendLink">
        <Field
          v-model="email"
          label="Email"
          type="email"
          icon="mail"
          autocomplete="email"
          placeholder="you@example.com"
          :error="error"
        />
        <Btn type="submit" block class="mt-1" :disabled="submitting">
          <Icon name="key" :size="15" />
          {{ submitting ? 'Sending…' : 'Send reset link' }}
        </Btn>
      </form>

      <div class="mt-6 flex items-center gap-2.5 rounded-card border border-rule bg-alt px-3.5 py-3">
        <Icon name="clock" :size="15" class="shrink-0 text-ink-3" />
        <p class="text-[11px] leading-relaxed text-ink-2">
          Reset links expire after 30 minutes and can only be used once.
        </p>
      </div>

      <div class="mt-5 border-t border-rule pt-4">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">No longer at this address?</p>
        <p class="mt-1.5 text-[11.5px] leading-relaxed text-ink-2">
          Call
          <a :href="org.phoneHref" class="font-semibold text-navy-600 hover:underline">{{ org.phone }}</a>
          or
          <RouterLink to="/support" class="font-semibold text-navy-600 hover:underline">contact support</RouterLink>
          so we can verify your identity and update the email on your record.
        </p>
      </div>

      <div class="mt-5 flex items-center justify-between gap-3 text-xs">
        <RouterLink to="/login" class="inline-flex items-center gap-1 font-semibold text-navy-600 hover:underline">
          <Icon name="back" :size="13" />
          Back to sign in
        </RouterLink>
        <RouterLink to="/signup" class="font-semibold text-navy-600 hover:underline">Create an account</RouterLink>
      </div>
    </template>

    <template v-else>
      <div class="mt-5 rounded-card border border-settled-bd bg-settled-bg p-4">
        <span class="grid h-10 w-10 place-items-center rounded-full bg-surface text-settled shadow-e1">
          <Icon name="check" :size="20" />
        </span>
        <h2 class="mt-3 text-xl font-bold tracking-[-0.03em] text-ink">Check your inbox</h2>
        <p class="mt-1.5 text-sm leading-relaxed text-ink-2">
          We sent a reset link to <b class="break-all font-semibold text-ink">{{ email }}</b>. Open it to choose a new
          password.
        </p>
        <p class="mt-2 text-[11.5px] leading-relaxed text-ink-3">
          Nothing yet? Check spam, or confirm this is the email on your tenancy record.
        </p>
      </div>

      <div class="mt-4 flex flex-col gap-2">
        <Btn block @click="resend">
          <Icon name="share" :size="15" />
          Resend reset link
        </Btn>
        <Btn variant="ghost" block @click="startOver">
          <Icon name="back" :size="15" />
          Use a different email
        </Btn>
      </div>

      <div class="mt-5 flex items-center justify-between gap-3 border-t border-rule pt-4 text-xs">
        <RouterLink to="/login" class="font-semibold text-navy-600 hover:underline">Back to sign in</RouterLink>
        <RouterLink to="/support" class="font-semibold text-navy-600 hover:underline">Contact support</RouterLink>
      </div>

      <p class="mt-5 text-center text-[11px] leading-relaxed text-ink-3">
        The link is sent by Firebase Authentication to the address above.
      </p>
    </template>
  </AuthShell>
</template>
