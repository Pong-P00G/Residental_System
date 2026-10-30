<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { accounts, org } from '@/data/app'
import { authErrorMessage } from '@/lib/firebase'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import AuthShell from '@/components/AuthShell.vue'
import SocialAuth from '@/components/SocialAuth.vue'
import Field from '@/components/Field.vue'
import Btn from '@/components/Btn.vue'
import Chip from '@/components/Chip.vue'
import Icon from '@/components/Icon.vue'

const router = useRouter()
const route = useRoute()
const store = useAppStore()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const socialError = ref('')
const loading = ref(false)

const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : ''))

function enter(role) {
  store.signIn(role)
  error.value = ''
  router.push(redirect.value || (role === 'resident' ? '/' : '/dashboard'))
}

async function signIn() {
  if (!email.value.trim() || !password.value.trim()) {
    error.value = 'Enter the email and password on your tenancy record.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await auth.signInWithEmail(email.value.trim(), password.value)
    router.push(redirect.value || '/')
  } catch (err) {
    error.value = authErrorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthShell headline="Sign in to your home.">
    <div class="flex items-center justify-between gap-3">
      <span
        class="inline-flex items-center gap-1.5 rounded-chip border border-navy-100 bg-navy-50 px-2 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-navy-600"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-navy-600" />
        Resident access
      </span>
      <span class="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-3">Apt 4B</span>
    </div>

    <h2 class="mt-3 text-[26px] font-bold leading-tight tracking-[-0.035em]">Welcome back</h2>
    <p class="mt-1.5 text-sm leading-relaxed text-ink-2">Marsh Lane 12, managed by {{ org.name }}.</p>

    <SocialAuth class="mt-6" :redirect="redirect" @error="socialError = $event" />
    <p v-if="socialError" class="mt-2 flex items-start gap-1.5 text-[11.5px] text-signal">
      <Icon name="alert" :size="13" class="mt-px shrink-0" />
      {{ socialError }}
    </p>

    <div class="my-6 flex items-center gap-3">
      <span class="h-px flex-1 bg-rule"></span>
      <span class="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-3">or with email</span>
      <span class="h-px flex-1 bg-rule"></span>
    </div>

    <form class="flex flex-col gap-3" @submit.prevent="signIn">
      <Field
        v-model="email"
        label="Email"
        type="email"
        icon="mail"
        autocomplete="email"
        placeholder="you@example.com"
        :error="error"
      />
      <Field
        v-model="password"
        label="Password"
        type="password"
        icon="lock"
        autocomplete="current-password"
        placeholder="••••••••"
      />

      <div class="flex justify-end">
        <RouterLink to="/forgot-password" class="text-[11.5px] font-semibold text-navy-600 hover:underline"
          >Forgot password?</RouterLink
        >
      </div>

      <Btn type="submit" block class="mt-1" :disabled="loading">
        {{ loading ? 'Signing in…' : 'Sign in' }}
        <Icon v-if="!loading" name="chevron" :size="15" />
      </Btn>
    </form>

    <div class="mt-6 flex items-center justify-between gap-3 border-t border-rule pt-4">
      <p class="text-xs text-ink-2">New here?</p>
      <RouterLink to="/signup" class="text-xs font-semibold text-navy-600 hover:underline">Create an account</RouterLink>
    </div>

    <RouterLink
      to="/properties"
      class="mt-3 flex items-center justify-between gap-2 rounded-btn border border-dashed border-rule-2 px-3.5 py-2.5 text-[11.5px] font-medium text-ink-2 transition hover:border-navy-300 hover:bg-navy-50 hover:text-ink"
    >
      <span class="flex items-center gap-2">
        <Icon name="building" :size="14" class="text-ink-3" />
        Browse available properties
      </span>
      <Icon name="chevron" :size="14" class="text-ink-3" />
    </RouterLink>

    <div class="mt-6 overflow-hidden rounded-card border border-rule bg-alt">
      <div class="flex items-start gap-2.5 border-b border-rule px-3.5 py-3">
        <Icon name="info" :size="14" class="mt-0.5 shrink-0 text-ink-3" />
        <p class="text-[11.5px] leading-relaxed text-ink-2">
          Accounts are handled by Firebase. Use the demo access buttons below to explore the resident, owner and admin
          views without an account.
        </p>
      </div>

      <div class="grid gap-2 p-3.5 sm:grid-cols-2">
        <button
          type="button"
          class="group flex items-center gap-3 rounded-btn border border-rule-2 bg-surface px-3.5 py-3 text-left shadow-e1 transition hover:-translate-y-0.5 hover:border-navy-300 hover:bg-navy-50"
          @click="enter('owner')"
        >
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-navy-100 bg-navy-50 text-navy-800">
            <Icon name="key" :size="16" />
          </span>
          <span class="min-w-0 flex-1">
            <b class="block text-[12.5px] font-semibold">Owner</b>
            <span class="block text-[10.5px] text-ink-3">Full portfolio, no admin tools</span>
          </span>
          <Icon name="chevron" :size="14" class="shrink-0 text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-navy-600" />
        </button>
        <button
          type="button"
          class="group flex items-center gap-3 rounded-btn border border-rule-2 bg-surface px-3.5 py-3 text-left shadow-e1 transition hover:-translate-y-0.5 hover:border-navy-300 hover:bg-navy-50"
          @click="enter('admin')"
        >
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-progress-bd bg-progress-bg text-progress">
            <Icon name="shield" :size="16" />
          </span>
          <span class="min-w-0 flex-1">
            <b class="block text-[12.5px] font-semibold">Admin</b>
            <span class="block text-[10.5px] text-ink-3">Adds users, audit &amp; analytics</span>
          </span>
          <Icon name="chevron" :size="14" class="shrink-0 text-ink-3 transition group-hover:translate-x-0.5 group-hover:text-navy-600" />
        </button>
      </div>

      <div class="flex flex-wrap gap-1.5 border-t border-rule px-3.5 py-3">
        <Chip tone="neutral" icon="user">Owner · {{ accounts.owner.email }}</Chip>
        <Chip tone="neutral" icon="shield">Admin · {{ accounts.admin.email }}</Chip>
      </div>
    </div>

    <p class="mt-6 text-center text-[11px] leading-relaxed text-ink-3">
      Need help? Call {{ org.phone }} or
      <RouterLink to="/support" class="font-semibold text-navy-600 hover:underline">contact support</RouterLink>
    </p>
  </AuthShell>
</template>
