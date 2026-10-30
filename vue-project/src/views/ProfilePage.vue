<script setup>
import { computed, ref } from 'vue'
import { leaseById, money, org, resident, unitById } from '@/data/app'
import { authErrorMessage } from '@/lib/firebase'
import { preferences, setPreference } from '@/lib/preferences'
import { t } from '@/lib/i18n'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/PageHeader.vue'
import Sheet from '@/components/Sheet.vue'
import Field from '@/components/Field.vue'
import Btn from '@/components/Btn.vue'
import Chip from '@/components/Chip.vue'
import Icon from '@/components/Icon.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const store = useAppStore()
const auth = useAuthStore()
const { loading } = usePageLoading()

const sections = [
  { id: 'details', label: 'Your details' },
  { id: 'contact', label: 'Contact preferences' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'security', label: 'Sign-in & security' },
  { id: 'methods', label: 'Connected methods' },
]

const themeOptions = [
  { id: 'light', label: 'preferences.light' },
  { id: 'dark', label: 'preferences.dark' },
  { id: 'system', label: 'preferences.system' },
]
const notificationOptions = [
  { id: 'push', label: 'preferences.push' },
  { id: 'muted', label: 'preferences.muted' },
]
const languageOptions = [
  { id: 'en', label: 'preferences.english' },
  { id: 'km', label: 'preferences.khmer' },
]
const unit = unitById('u-4b')
const lease = leaseById('L-1004')

const name = ref(store.profile.name)
const email = ref(store.profile.email)
const phone = ref(store.profile.phone)
const prefs = ref({ ...store.contactPrefs })

const preferenceList = [
  { key: 'email', title: 'Email', meta: 'Statements, documents and written updates' },
  { key: 'sms', title: 'SMS', meta: 'Vendor arrival windows and anything urgent' },
  { key: 'post', title: 'Post', meta: 'Formal notices that must be served on paper' },
  { key: 'buildingNotices', title: 'Building notices', meta: 'Water shut-offs, inspections, works' },
]

function saveDetails() {
  store.updateProfile({ name: name.value, email: email.value, phone: phone.value })
}

function savePrefs() {
  store.contactPrefs = { ...prefs.value }
  store.toast('Contact preferences saved')
}

const linking = ref('')
const linkError = ref('')

const providerRows = computed(() => [
  {
    id: 'password',
    label: 'Email & password',
    detail: auth.user?.email || 'Sign in with the email on your tenancy record',
  },
  { id: 'google.com', label: 'Google', detail: 'Use your Google account to sign in' },
  { id: 'facebook.com', label: 'Facebook', detail: 'Use your Facebook account to sign in' },
])

const isLinked = (providerId) => Boolean(auth.providers.includes(providerId))
const canUnlink = (providerId) => providerId !== 'password' && auth.providers.length > 1

const reauthOpen = ref(false)
const reauthPassword = ref('')
const reauthError = ref('')
const reauthBusy = ref(false)
const pendingChange = ref(null)

const pendingLabel = computed(() => {
  const change = pendingChange.value
  if (!change) return 'change connected accounts'
  const label =
    change.value === 'facebook' || change.value === 'facebook.com'
      ? 'Facebook'
      : change.value === 'google' || change.value === 'google.com'
        ? 'Google'
        : 'this method'
  return change.type === 'link' ? `connect ${label}` : `disconnect ${label}`
})

const providerOptions = computed(() => {
  const options = []
  if (isLinked('google.com')) options.push({ id: 'google', label: 'Google' })
  if (isLinked('facebook.com')) options.push({ id: 'facebook', label: 'Facebook' })
  return options
})

async function connectProvider(name) {
  linking.value = name
  linkError.value = ''
  try {
    await auth.linkProvider(name)
  } catch (err) {
    if (err?.code === 'auth/requires-recent-login') askToReauthenticate({ type: 'link', value: name })
    else linkError.value = authErrorMessage(err)
  } finally {
    linking.value = ''
  }
}

async function disconnectProvider(providerId) {
  linking.value = providerId
  linkError.value = ''
  try {
    await auth.unlinkProvider(providerId)
  } catch (err) {
    if (err?.code === 'auth/requires-recent-login') askToReauthenticate({ type: 'unlink', value: providerId })
    else linkError.value = authErrorMessage(err)
  } finally {
    linking.value = ''
  }
}

function askToReauthenticate(change) {
  pendingChange.value = change
  reauthPassword.value = ''
  reauthError.value = ''
  reauthOpen.value = true
}

function closeReauth() {
  reauthOpen.value = false
  reauthPassword.value = ''
  reauthError.value = ''
  pendingChange.value = null
}

async function runPendingChange() {
  const change = pendingChange.value
  if (!change) return
  try {
    if (change.type === 'link') await auth.linkProvider(change.value)
    else await auth.unlinkProvider(change.value)
  } catch (err) {
    linkError.value = authErrorMessage(err)
  }
}

async function finishReauth(confirm) {
  reauthBusy.value = true
  reauthError.value = ''
  try {
    await confirm()
    await runPendingChange()
    closeReauth()
  } catch (err) {
    reauthError.value = authErrorMessage(err)
  } finally {
    reauthBusy.value = false
  }
}

function confirmWithPassword() {
  if (!reauthPassword.value) {
    reauthError.value = 'Enter your account password.'
    return
  }
  return finishReauth(() => auth.reauthenticateWithPassword(reauthPassword.value))
}

function confirmWithProvider(name) {
  return finishReauth(() => auth.reauthenticateWithProvider(name))
}
</script>

<template>
  <PageSkeleton v-if="loading" variant="settings" />
  <div v-else>
    <PageHeader
      eyebrow="Account"
      title="Profile"
      description="Who we contact, how we contact them, and the security on your account."
    >
      <template #actions>
        <Chip tone="ok">Verified resident</Chip>
      </template>
    </PageHeader>

    <div class="grid gap-6 xl:grid-cols-[180px_minmax(0,1.45fr)_1fr]">
      <nav class="hidden xl:sticky xl:top-28 xl:block xl:self-start" aria-label="Profile sections">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">On this page</p>
        <div class="mt-2 flex flex-col gap-0.5 border-l border-rule pl-3">
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            class="py-1.5 text-[12.5px] font-medium text-ink-2 transition hover:text-navy-800"
          >
            {{ section.label }}
          </a>
        </div>
      </nav>

      <div class="flex flex-col gap-5">
        <section id="details" class="rounded-card border border-rule bg-surface p-5 shadow-e1 scroll-mt-28">
          <div class="flex items-center gap-3">
            <span class="grid h-12 w-12 place-items-center rounded-full bg-navy-100 font-mono text-[14px] font-semibold text-navy-800">
              {{ store.profile.initials }}
            </span>
            <div>
              <h2 class="text-base font-semibold tracking-[-0.02em]">{{ store.profile.name }}</h2>
              <p class="text-[11.5px] text-ink-2">{{ unit.name }} · resident since {{ resident.since }}</p>
            </div>
          </div>

          <form class="mt-5 grid gap-3 sm:grid-cols-2" @submit.prevent="saveDetails">
            <Field v-model="name" label="Full name" autocomplete="name" />
            <Field v-model="phone" label="Mobile" type="tel" autocomplete="tel" />
            <div class="sm:col-span-2">
              <Field v-model="email" label="Email" type="email" autocomplete="email" />
            </div>
            <div class="flex items-center gap-2 sm:col-span-2">
              <Btn type="submit" size="sm">Save details</Btn>
              <span class="text-[11px] text-ink-3">Your tenancy reference stays the same.</span>
            </div>
          </form>
        </section>

        <section id="contact" class="rounded-card border border-rule bg-surface p-5 shadow-e1 scroll-mt-28">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">How we contact you</h2>
            <Chip tone="neutral">{{ Object.values(prefs).filter(Boolean).length }} on</Chip>
          </div>
          <div class="mt-2 divide-y divide-rule">
            <div v-for="preference in preferenceList" :key="preference.key" class="flex items-center gap-3 py-3">
              <div class="min-w-0 flex-1">
                <b class="block text-[12.5px] font-semibold">{{ preference.title }}</b>
                <span class="block text-[11px] text-ink-3">{{ preference.meta }}</span>
              </div>
              <button
                type="button"
                class="relative h-6 w-11 shrink-0 rounded-full border transition"
                :class="prefs[preference.key] ? 'border-navy-800 bg-navy-800' : 'border-rule-2 bg-fyi-bg'"
                role="switch"
                :aria-checked="prefs[preference.key]"
                :aria-label="preference.title"
                @click="prefs[preference.key] = !prefs[preference.key]"
              >
                <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" :class="prefs[preference.key] ? 'left-[22px]' : 'left-0.5'"></span>
              </button>
            </div>
          </div>
          <Btn size="sm" class="mt-3" @click="savePrefs">Save preferences</Btn>
        </section>

        <section id="preferences" class="rounded-card border border-rule bg-surface p-5 shadow-e1 scroll-mt-28">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">{{ t('preferences.title') }}</h2>
            <Chip tone="neutral">{{ preferences.theme }} · {{ preferences.language === 'km' ? 'ខ្មែរ' : 'EN' }}</Chip>
          </div>
          <p class="mt-1.5 text-[11.5px] leading-relaxed text-ink-2">{{ t('preferences.subtitle') }}</p>

          <div class="mt-4 flex flex-col gap-4">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div class="min-w-0">
                <b class="block text-[12.5px] font-semibold">{{ t('preferences.theme') }}</b>
                <span class="block text-[11px] leading-relaxed text-ink-3">{{ t('preferences.themeHint') }}</span>
              </div>
              <div class="flex shrink-0 self-start rounded-btn border border-rule-2 bg-alt p-0.5" role="group" :aria-label="t('preferences.theme')">
                <button
                  v-for="option in themeOptions"
                  :key="option.id"
                  type="button"
                  class="rounded-[7px] px-3 py-1.5 text-[11.5px] font-semibold transition"
                  :class="preferences.theme === option.id ? 'bg-surface text-ink shadow-e1' : 'text-ink-3 hover:text-ink'"
                  :aria-pressed="preferences.theme === option.id"
                  @click="setPreference('theme', option.id)"
                >
                  {{ t(option.label) }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-2 border-t border-rule pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div class="min-w-0">
                <b class="block text-[12.5px] font-semibold">{{ t('preferences.notifications') }}</b>
                <span class="block text-[11px] leading-relaxed text-ink-3">{{ t('preferences.notificationsHint') }}</span>
              </div>
              <div class="flex shrink-0 self-start rounded-btn border border-rule-2 bg-alt p-0.5" role="group" :aria-label="t('preferences.notifications')">
                <button
                  v-for="option in notificationOptions"
                  :key="option.id"
                  type="button"
                  class="rounded-[7px] px-3 py-1.5 text-[11.5px] font-semibold transition"
                  :class="preferences.notifications === option.id ? 'bg-surface text-ink shadow-e1' : 'text-ink-3 hover:text-ink'"
                  :aria-pressed="preferences.notifications === option.id"
                  @click="setPreference('notifications', option.id)"
                >
                  {{ t(option.label) }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-2 border-t border-rule pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div class="min-w-0">
                <b class="block text-[12.5px] font-semibold">{{ t('preferences.language') }}</b>
                <span class="block text-[11px] leading-relaxed text-ink-3">{{ t('preferences.languageHint') }}</span>
              </div>
              <div class="flex shrink-0 self-start rounded-btn border border-rule-2 bg-alt p-0.5" role="group" :aria-label="t('preferences.language')">
                <button
                  v-for="option in languageOptions"
                  :key="option.id"
                  type="button"
                  class="rounded-[7px] px-3 py-1.5 text-[11.5px] font-semibold transition"
                  :class="preferences.language === option.id ? 'bg-surface text-ink shadow-e1' : 'text-ink-3 hover:text-ink'"
                  :aria-pressed="preferences.language === option.id"
                  @click="setPreference('language', option.id)"
                >
                  {{ t(option.label) }}
                </button>
              </div>
            </div>
          </div>

          <p class="mt-4 flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-3">
            <Icon name="info" :size="13" class="mt-px shrink-0" />
            {{ t('preferences.note') }}
          </p>
        </section>

        <section id="security" class="rounded-card border border-rule bg-surface p-5 shadow-e1 scroll-mt-28">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Sign-in & security</h2>
          <div class="mt-2 divide-y divide-rule">
            <div class="flex items-center gap-3 py-3">
              <Icon name="key" :size="17" class="shrink-0 text-ink-3" />
              <div class="min-w-0 flex-1">
                <b class="block text-[12.5px] font-semibold">Password</b>
                <span class="block text-[11px] text-ink-3">Last changed 4 months ago</span>
              </div>
              <Btn variant="ghost" size="xs" @click="store.toast('Password reset link sent to your email')">Change</Btn>
            </div>
            <div class="flex items-center gap-3 py-3">
              <Icon name="shield" :size="17" class="shrink-0 text-ink-3" />
              <div class="min-w-0 flex-1">
                <b class="block text-[12.5px] font-semibold">Two-step verification</b>
                <span class="block text-[11px] text-ink-3">Off · we recommend turning this on</span>
              </div>
              <Btn variant="ghost" size="xs" @click="store.toast('Two-step verification setup started')">Set up</Btn>
            </div>
            <div class="flex items-center gap-3 py-3">
              <Icon name="phone" :size="17" class="shrink-0 text-ink-3" />
              <div class="min-w-0 flex-1">
                <b class="block text-[12.5px] font-semibold">Signed-in devices</b>
                <span class="block text-[11px] text-ink-3">This browser · London · active now</span>
              </div>
              <Btn variant="ghost" size="xs" @click="store.toast('Other sessions signed out')">Sign out others</Btn>
            </div>
          </div>
        </section>

        <section id="methods" class="rounded-card border border-rule bg-surface p-5 shadow-e1 scroll-mt-28">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Connected sign-in methods</h2>
            <Chip v-if="auth.user" tone="neutral">{{ auth.providers.length }} active</Chip>
          </div>
          <p class="mt-1.5 text-[11.5px] leading-relaxed text-ink-2">
            Connect Google or Facebook to sign in without typing your password. Every method opens the same tenancy
            account.
          </p>

          <div v-if="!auth.user" class="mt-3 rounded-btn border border-dashed border-rule-2 bg-alt p-3">
            <p class="text-[11.5px] leading-relaxed text-ink-2">
              This is a demo session, so there is no real account to link.
              <RouterLink to="/login" class="font-semibold text-navy-600 hover:underline">Sign in with a real account</RouterLink>
              to manage connected providers.
            </p>
          </div>

          <template v-else>
            <div class="mt-2 divide-y divide-rule">
              <div v-for="provider in providerRows" :key="provider.id" class="flex items-center gap-3 py-3">
                <span
                  class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-rule font-mono text-[12px] font-bold"
                  :class="provider.id === 'google.com' ? 'text-[#4285F4]' : provider.id === 'facebook.com' ? 'text-[#1877F2]' : 'text-ink-2'"
                >
                  {{ provider.id === 'google.com' ? 'G' : provider.id === 'facebook.com' ? 'f' : '@' }}
                </span>
                <div class="min-w-0 flex-1">
                  <b class="block text-[12.5px] font-semibold">{{ provider.label }}</b>
                  <span class="block truncate text-[11px] text-ink-3">{{ provider.detail }}</span>
                </div>
                <Chip :tone="isLinked(provider.id) ? 'ok' : 'neutral'">
                  {{ isLinked(provider.id) ? 'Connected' : 'Not connected' }}
                </Chip>
                <Btn
                  v-if="provider.id !== 'password' && !isLinked(provider.id)"
                  variant="ghost"
                  size="xs"
                  :disabled="Boolean(linking)"
                  @click="connectProvider(provider.id === 'google.com' ? 'google' : 'facebook')"
                >
                  {{ linking === (provider.id === 'google.com' ? 'google' : 'facebook') ? 'Opening…' : 'Connect' }}
                </Btn>
                <Btn
                  v-else-if="canUnlink(provider.id)"
                  variant="ghost"
                  size="xs"
                  :disabled="Boolean(linking)"
                  @click="disconnectProvider(provider.id)"
                >
                  {{ linking === provider.id ? 'Removing…' : 'Disconnect' }}
                </Btn>
                <RouterLink
                  v-else-if="provider.id === 'password' && !isLinked(provider.id)"
                  to="/forgot-password"
                  class="text-[11px] font-semibold text-navy-600 hover:underline"
                >
                  Set a password
                </RouterLink>
              </div>
            </div>

            <p v-if="linkError" class="mt-1 text-[11.5px] text-signal">{{ linkError }}</p>
            <p class="mt-2 text-[10.5px] leading-relaxed text-ink-3">
              Keep at least one method connected. Unlinking the last one is blocked to protect your account.
            </p>
          </template>
        </section>
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Tenancy</h2>
          <dl class="mt-3 space-y-2.5 text-[12.5px]">
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Unit</dt><dd class="font-medium">{{ unit.name }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Lease</dt><dd class="font-mono font-medium">{{ lease.id }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Rent</dt><dd class="font-mono font-medium">{{ money(lease.rent) }}/mo</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Ends</dt><dd class="font-medium">{{ lease.end }}</dd></div>
          </dl>
          <div class="mt-4 flex flex-col gap-2">
            <Btn to="/my-lease" variant="ghost" size="sm" block>Open my lease</Btn>
            <Btn to="/my-unit" variant="ghost" size="sm" block>Open my unit</Btn>
          </div>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Your manager</h2>
          <p class="mt-1.5 text-[13px] font-semibold">{{ org.name }}</p>
          <a :href="org.phoneHref" class="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-ink-2 hover:text-navy-800">
            <Icon name="phone" :size="13" /> {{ org.phone }}
          </a>
          <a :href="`mailto:${org.email}`" class="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-ink-2 hover:text-navy-800">
            <Icon name="message" :size="13" /> {{ org.email }}
          </a>
          <p class="mt-2 text-[10.5px] text-ink-3">{{ org.hours }}</p>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Leaving?</h2>
          <p class="mt-1.5 text-[12px] leading-relaxed text-ink-2">
            Notice must be in writing. Your deposit is returned within 10 working days of the joint checkout.
          </p>
          <Btn to="/support" variant="quiet" size="sm" block class="mt-3">Ask about moving out</Btn>
        </section>
      </aside>
    </div>

    <Sheet
      v-if="reauthOpen"
      eyebrow="Security check"
      title="Confirm it's you"
      :subtitle="`For your security, sign in again to ${pendingLabel}.`"
      @close="closeReauth"
    >
      <form v-if="isLinked('password')" class="flex flex-col gap-3" @submit.prevent="confirmWithPassword">
        <Field
          v-model="reauthPassword"
          label="Account password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          :error="reauthError"
        />
        <Btn type="submit" block :disabled="reauthBusy">
          {{ reauthBusy ? 'Confirming…' : 'Confirm and continue' }}
        </Btn>
      </form>

      <p v-else-if="reauthError" class="text-[11.5px] text-signal">{{ reauthError }}</p>

      <div v-if="providerOptions.length" class="mt-3 flex flex-col gap-2">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
          {{ isLinked('password') ? 'or confirm with' : 'Confirm with a connected account' }}
        </p>
        <Btn
          v-for="option in providerOptions"
          :key="option.id"
          variant="ghost"
          block
          :disabled="reauthBusy"
          @click="confirmWithProvider(option.id)"
        >
          Continue with {{ option.label }}
        </Btn>
      </div>

      <p class="mt-3 text-[10.5px] leading-relaxed text-ink-3">
        This refreshes your session without signing you out. Your pending change applies as soon as it succeeds.
      </p>
    </Sheet>
  </div>
</template>
