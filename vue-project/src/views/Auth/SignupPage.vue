<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { org } from '@/data/app'
import { authErrorMessage } from '@/lib/firebase'
import { useAuthStore } from '@/stores/auth'
import AuthShell from '@/components/AuthShell.vue'
import SocialAuth from '@/components/SocialAuth.vue'
import Field from '@/components/Field.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({ name: '', email: '', password: '' })
const errors = reactive({ name: '', email: '', password: '' })
const formError = ref('')
const socialError = ref('')
const submitting = ref(false)

const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : ''))

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const strength = computed(() => {
  const value = form.password
  let score = 0
  if (value.length >= 8) score += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 1
  if (!value) score = 0
  const tones = [
    { label: 'Too short', bar: 'bg-signal', text: 'text-signal' },
    { label: 'Weak', bar: 'bg-signal', text: 'text-signal' },
    { label: 'Good', bar: 'bg-attention', text: 'text-attention' },
    { label: 'Strong', bar: 'bg-settled', text: 'text-settled' },
  ]
  return { score, ...tones[score] }
})

function validate() {
  errors.name = form.name.trim() ? '' : 'Enter the name on your tenancy record.'
  errors.email = emailPattern.test(form.email.trim()) ? '' : 'Enter a valid email address.'
  errors.password = form.password.length >= 8 ? '' : 'Use at least 8 characters.'
  return !errors.name && !errors.email && !errors.password
}

async function createAccount() {
  if (!validate()) return
  formError.value = ''
  submitting.value = true
  try {
    await auth.registerAccount({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    })
    router.push(redirect.value || '/')
  } catch (err) {
    const message = authErrorMessage(err)
    if (err?.code === 'auth/email-already-in-use') errors.email = message
    else if (err?.code === 'auth/weak-password') errors.password = message
    else formError.value = message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthShell
  headline="Set up your tenancy account."
  sub="One account for rent, repairs, notices and every document attached to your home."
  >
    <div class="flex items-center justify-between gap-3">
      <span
        class="inline-flex items-center gap-1.5 rounded-chip border border-navy-100 bg-navy-50 px-2 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-navy-600"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-navy-600" />
        Resident access
      </span>
      <span class="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">Apt 4B</span>
    </div>

    <h2 class="mt-3 text-[26px] font-bold leading-tight tracking-[-0.035em]">Create your account</h2>
    <p class="mt-1.5 text-sm leading-relaxed text-ink-2">Marsh Lane 12, managed by {{ org.name }}.</p>

    <SocialAuth class="mt-6" :redirect="redirect" @error="socialError = $event" />
    <p v-if="socialError" class="mt-2 flex items-start gap-1.5 text-[11.5px] text-signal">
      <Icon name="alert" :size="13" class="mt-px shrink-0" />
      {{ socialError }}
    </p>
    <p class="mt-2 text-[11px] leading-relaxed text-ink-3">
      Continuing with Google or Facebook creates your account in one step — no form to fill in.
    </p>

    <div class="my-6 flex items-center gap-3">
      <span class="h-px flex-1 bg-rule"></span>
      <span class="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-3">or with email</span>
      <span class="h-px flex-1 bg-rule"></span>
    </div>

    <form class="flex flex-col gap-3" novalidate @submit.prevent="createAccount">
      <Field
        v-model="form.name"
        label="Full name"
        icon="user"
        autocomplete="name"
        placeholder="Alex Morgan"
        :error="errors.name"
      />
      <Field
        v-model="form.email"
        label="Email"
        type="email"
        icon="mail"
        autocomplete="email"
        placeholder="you@example.com"
        :error="errors.email"
      />
      <div class="flex flex-col gap-1.5">
        <Field
          v-model="form.password"
          label="Password"
          type="password"
          icon="lock"
          autocomplete="new-password"
          placeholder="At least 8 characters"
          :error="errors.password"
        />
        <div v-if="form.password && !errors.password" class="flex items-center gap-2.5 px-0.5">
          <div class="flex flex-1 gap-1">
            <span
              v-for="i in 3"
              :key="i"
              class="h-1 flex-1 rounded-full transition-colors"
              :class="i <= strength.score ? strength.bar : 'bg-rule'"
            />
          </div>
          <span class="font-mono text-[9px] font-semibold uppercase tracking-widest" :class="strength.text">
            {{ strength.label }}
          </span>
        </div>
      </div>

      <p class="mt-1 rounded-btn bg-alt px-3 py-2.5 text-[11px] leading-relaxed text-ink-2">
        {{ org.name }} verifies your tenancy against the email you register with before granting access to the full
        record.
      </p>

      <p v-if="formError" class="flex items-start gap-1.5 text-[11.5px] text-signal" role="alert">
        <Icon name="alert" :size="13" class="mt-px shrink-0" />
        {{ formError }}
      </p>

      <Btn type="submit" block class="mt-1" :disabled="submitting">
        {{ submitting ? 'Creating account…' : 'Create account' }}
        <Icon v-if="!submitting" name="chevron" :size="15" />
      </Btn>
    </form>

    <div class="mt-6 flex items-center justify-between gap-3 border-t border-rule pt-4">
      <p class="text-xs text-ink-2">Already registered?</p>
      <RouterLink to="/login" class="text-xs font-semibold text-navy-600 hover:underline">Sign in instead</RouterLink>
    </div>

    <div class="mt-4 flex items-start gap-2.5 rounded-card border border-rule bg-alt px-3.5 py-3">
      <Icon name="info" :size="14" class="mt-0.5 shrink-0 text-ink-3" />
      <p class="text-[11.5px] leading-relaxed text-ink-2">
        Accounts are created with Firebase Authentication. Prefer to look around first? Use the demo access buttons on
        the sign-in page.
      </p>
    </div>

    <p class="mt-6 text-center text-[11px] leading-relaxed text-ink-3">
      By creating an account you agree to the tenancy terms and privacy notice.<br />
      Questions? Call {{ org.phone }}.
    </p>
  </AuthShell>
</template>
