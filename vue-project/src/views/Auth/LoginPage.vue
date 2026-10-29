<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { accounts, org } from '@/data/app'
import { useAppStore } from '@/stores/app'
import AuthShell from '@/components/AuthShell.vue'
import Field from '@/components/Field.vue'
import Btn from '@/components/Btn.vue'
import Chip from '@/components/Chip.vue'
import Icon from '@/components/Icon.vue'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const email = ref(accounts.resident.email)
const password = ref('demo1234')
const error = ref('')
const loading = ref('')

const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : ''))

function enter(role) {
  loading.value = role
  store.signIn(role)
  error.value = ''
  router.push(redirect.value || (role === 'resident' ? '/' : '/dashboard'))
}

function signIn() {
  if (!email.value.trim() || !password.value.trim()) {
    error.value = 'Enter the email and password on your tenancy record.'
    return
  }
  enter('resident')
}
</script>

<template>
  <AuthShell headline="Sign in to your home.">
    <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">Resident access</p>
    <h2 class="mt-1 text-2xl font-bold tracking-[-0.03em]">Welcome back</h2>
    <p class="mt-1.5 text-sm text-ink-2">Apartment 4B · Marsh Lane 12, managed by {{ org.name }}.</p>

    <form class="mt-6 flex flex-col gap-3" @submit.prevent="signIn">
      <Field v-model="email" label="Email" type="email" autocomplete="email" placeholder="you@example.com" :error="error" />
      <Field v-model="password" label="Password" type="password" autocomplete="current-password" placeholder="••••••••" />
      <Btn type="submit" block class="mt-1" :disabled="loading === 'resident'">Sign in</Btn>
    </form>

    <div class="mt-4 flex items-center justify-between text-xs">
      <RouterLink to="/support" class="font-semibold text-navy-600 hover:underline">Forgot password?</RouterLink>
      <RouterLink to="/properties" class="font-semibold text-navy-600 hover:underline">Browse properties</RouterLink>
    </div>

    <div class="mt-6 rounded-card border border-rule bg-surface p-3.5 shadow-e1">
      <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Demo credentials</p>
      <p class="mt-1 font-mono text-[11.5px] text-ink-2">{{ accounts.resident.email }} · demo1234</p>
    </div>

    <div class="my-6 flex items-center gap-3">
      <span class="h-px flex-1 bg-rule"></span>
      <span class="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-3">Portfolio access</span>
      <span class="h-px flex-1 bg-rule"></span>
    </div>

    <div class="grid gap-2 sm:grid-cols-2">
      <button
        type="button"
        class="flex items-center gap-3 rounded-btn border border-rule-2 bg-surface px-3.5 py-3 text-left transition hover:border-navy-300 hover:bg-navy-50"
        @click="enter('owner')"
      >
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-navy-100 bg-navy-50 text-navy-800">
          <Icon name="key" :size="16" />
        </span>
        <span class="min-w-0">
          <b class="block text-[12.5px] font-semibold">Owner</b>
          <span class="block text-[10.5px] text-ink-3">Full portfolio, no admin tools</span>
        </span>
      </button>
      <button
        type="button"
        class="flex items-center gap-3 rounded-btn border border-rule-2 bg-surface px-3.5 py-3 text-left transition hover:border-navy-300 hover:bg-navy-50"
        @click="enter('admin')"
      >
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-progress-bd bg-progress-bg text-progress">
          <Icon name="shield" :size="16" />
        </span>
        <span class="min-w-0">
          <b class="block text-[12.5px] font-semibold">Admin</b>
          <span class="block text-[10.5px] text-ink-3">Adds users, audit &amp; analytics</span>
        </span>
      </button>
    </div>

    <div class="mt-5 flex flex-wrap justify-center gap-1.5">
      <Chip tone="neutral">Owner: {{ accounts.owner.email }}</Chip>
      <Chip tone="neutral">Admin: {{ accounts.admin.email }}</Chip>
    </div>

    <p class="mt-6 text-center text-[11px] leading-relaxed text-ink-3">
      Managed by {{ org.name }}<br />
      Need help? Call {{ org.phone }} or <RouterLink to="/support" class="font-semibold text-navy-600 hover:underline">contact support</RouterLink>
    </p>
  </AuthShell>
</template>
