<script setup>
import { ref } from 'vue'
import { leaseById, money, org, resident, unitById } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Field from '@/components/Field.vue'
import Btn from '@/components/Btn.vue'
import Chip from '@/components/Chip.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
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
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Account"
      title="Profile"
      description="Who we contact, how we contact them, and the security on your account."
    >
      <template #actions>
        <Chip tone="ok">Verified resident</Chip>
      </template>
    </PageHeader>

    <div class="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
      <div class="flex flex-col gap-5">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
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

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
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

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
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
  </div>
</template>
