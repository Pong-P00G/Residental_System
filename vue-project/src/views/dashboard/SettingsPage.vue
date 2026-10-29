<script setup>
import { reactive, ref } from 'vue'
import { money, org, staff } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Field from '@/components/Field.vue'
import Btn from '@/components/Btn.vue'
import Chip from '@/components/Chip.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
const tab = ref('organisation')
const tabs = [
  { id: 'organisation', label: 'Organisation' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'team', label: 'Team & roles' },
  { id: 'billing', label: 'Billing' },
]

const organisation = reactive({
  name: org.name,
  email: org.email,
  phone: org.phone,
  address: org.address,
  timezone: 'Europe/London',
  currency: 'GBP — Pound sterling',
})

const notifications = reactive({
  arrears: true,
  sla: true,
  compliance: true,
  payments: true,
  residentRequests: false,
  weeklyDigest: true,
})

const workflow = reactive({
  autoAssign: false,
  remindVendors: true,
  chaseArrears: true,
  depositCheck: false,
})

const notificationRows = [
  { key: 'arrears', title: 'Arrears alerts', meta: 'When a balance passes 7 days' },
  { key: 'sla', title: 'SLA breaches', meta: 'When a request passes 85% of its window' },
  { key: 'compliance', title: 'Compliance deadlines', meta: '14 days before a statutory date' },
  { key: 'payments', title: 'Payment failures', meta: 'Failed card or direct debit' },
  { key: 'residentRequests', title: 'New resident requests', meta: 'Every submission, not just urgent ones' },
  { key: 'weeklyDigest', title: 'Weekly digest', meta: 'Monday morning portfolio summary' },
]

const workflowRows = [
  { key: 'autoAssign', title: 'Auto-assign routine work', meta: 'Route routine categories to the preferred vendor' },
  { key: 'remindVendors', title: 'Remind vendors before the visit', meta: 'Send a confirmation 24 hours ahead' },
  { key: 'chaseArrears', title: 'Chase arrears automatically', meta: 'Day 2 and day 7 reminders, then a formal notice' },
  { key: 'depositCheck', title: 'Block letting without a protected deposit', meta: 'Prevents a unit being marked occupied' },
]

const invoices = [
  { id: 'INV-2026-11', date: '1 Nov 2026', amount: 89, status: 'Paid' },
  { id: 'INV-2026-10', date: '1 Oct 2026', amount: 89, status: 'Paid' },
  { id: 'INV-2026-09', date: '1 Sep 2026', amount: 89, status: 'Paid' },
]
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Governance"
      title="Settings"
      description="The organisation, the alerting rules and the people who can act on them."
    >
      <template #actions>
        <Chip tone="ok">Workspace active</Chip>
      </template>
    </PageHeader>

    <div class="grid gap-6 xl:grid-cols-[1fr_280px]">
      <div>
        <div class="mb-4 flex flex-wrap gap-1.5">
          <button
            v-for="item in tabs"
            :key="item.id"
            type="button"
            class="rounded-chip border px-3.5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.07em] transition"
            :class="tab === item.id ? 'border-navy-800 bg-navy-800 text-white' : 'border-rule-2 bg-surface text-ink-2 hover:border-navy-300'"
            @click="tab = item.id"
          >
            {{ item.label }}
          </button>
        </div>

        <section v-if="tab === 'organisation'" class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Organisation profile</h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div class="sm:col-span-2"><Field v-model="organisation.name" label="Legal name" /></div>
            <Field v-model="organisation.email" label="Contact email" type="email" />
            <Field v-model="organisation.phone" label="Phone" type="tel" />
            <div class="sm:col-span-2"><Field v-model="organisation.address" label="Registered address" /></div>
            <Field v-model="organisation.timezone" label="Time zone" />
            <Field v-model="organisation.currency" label="Currency" />
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <Btn size="sm" @click="store.toast('Organisation profile saved')">Save changes</Btn>
            <span class="text-[11px] text-ink-3">Shown on resident statements and documents.</span>
          </div>
        </section>

        <section v-else-if="tab === 'notifications'" class="flex flex-col gap-4">
          <div class="rounded-card border border-rule bg-surface p-5 shadow-e1">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Alert me about</h2>
            <div class="mt-2 divide-y divide-rule">
              <div v-for="row in notificationRows" :key="row.key" class="flex items-center gap-3 py-3">
                <div class="min-w-0 flex-1">
                  <b class="block text-[12.5px] font-semibold">{{ row.title }}</b>
                  <span class="block text-[11px] text-ink-3">{{ row.meta }}</span>
                </div>
                <button
                  type="button"
                  class="relative h-6 w-11 shrink-0 rounded-full border transition"
                  :class="notifications[row.key] ? 'border-navy-800 bg-navy-800' : 'border-rule-2 bg-fyi-bg'"
                  role="switch"
                  :aria-checked="notifications[row.key]"
                  :aria-label="row.title"
                  @click="notifications[row.key] = !notifications[row.key]"
                >
                  <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" :class="notifications[row.key] ? 'left-[22px]' : 'left-0.5'"></span>
                </button>
              </div>
            </div>
            <Btn size="sm" class="mt-3" @click="store.toast('Notification settings saved')">Save alerts</Btn>
          </div>

          <div class="rounded-card border border-rule bg-surface p-5 shadow-e1">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Workflow rules</h2>
            <div class="mt-2 divide-y divide-rule">
              <div v-for="row in workflowRows" :key="row.key" class="flex items-center gap-3 py-3">
                <div class="min-w-0 flex-1">
                  <b class="block text-[12.5px] font-semibold">{{ row.title }}</b>
                  <span class="block text-[11px] text-ink-3">{{ row.meta }}</span>
                </div>
                <button
                  type="button"
                  class="relative h-6 w-11 shrink-0 rounded-full border transition"
                  :class="workflow[row.key] ? 'border-navy-800 bg-navy-800' : 'border-rule-2 bg-fyi-bg'"
                  role="switch"
                  :aria-checked="workflow[row.key]"
                  :aria-label="row.title"
                  @click="workflow[row.key] = !workflow[row.key]"
                >
                  <span class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all" :class="workflow[row.key] ? 'left-[22px]' : 'left-0.5'"></span>
                </button>
              </div>
            </div>
            <Btn size="sm" class="mt-3" @click="store.toast('Workflow rules saved')">Save rules</Btn>
          </div>
        </section>

        <section v-else-if="tab === 'team'" class="rounded-card border border-rule bg-surface shadow-e1">
          <div class="flex items-center justify-between gap-3 border-b border-rule p-5">
            <div>
              <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Team & roles</h2>
              <p class="mt-1 text-[11.5px] text-ink-3">Owners manage the portfolio. Admins additionally manage users, audit logs and analytics.</p>
            </div>
            <Btn size="sm" to="/d/users">Manage users</Btn>
          </div>
          <div class="divide-y divide-rule">
            <div v-for="person in staff.filter((member) => member.role !== 'Resident')" :key="person.id" class="flex items-center gap-3 px-5 py-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-100 font-mono text-[10.5px] font-semibold text-navy-800">{{ person.initials }}</span>
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[12.5px] font-semibold">{{ person.name }}</b>
                <span class="block truncate text-[11px] text-ink-3">{{ person.email }}</span>
              </div>
              <Chip :tone="person.role === 'Admin' ? 'progress' : 'neutral'">{{ person.role }}</Chip>
              <span class="hidden w-24 text-right text-[10.5px] text-ink-3 sm:block">{{ person.lastActive }}</span>
            </div>
          </div>
        </section>

        <section v-else class="flex flex-col gap-4">
          <div class="rounded-card border border-l-[3px] border-rule border-l-navy-800 bg-surface p-5 shadow-e1">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Current plan</p>
                <h2 class="mt-1 text-lg font-semibold tracking-[-0.02em]">Portfolio · {{ staff.filter((member) => member.role !== 'Resident').length }} staff seats</h2>
                <p class="mt-1 text-[12.5px] text-ink-2">Properties, units, leases, requests, payments, compliance and audit history.</p>
              </div>
              <div class="text-right">
                <p class="font-mono text-2xl font-semibold">{{ money(89, 0) }}<span class="text-xs font-normal text-ink-3">/mo</span></p>
                <Chip tone="ok">Active</Chip>
              </div>
            </div>
          </div>

          <div class="rounded-card border border-rule bg-surface p-5 shadow-e1">
            <div class="flex items-center justify-between gap-3">
              <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Invoices</h2>
              <Btn variant="ghost" size="xs" @click="store.toast('Billing portal opened')">Manage billing</Btn>
            </div>
            <ul class="mt-2 divide-y divide-rule">
              <li v-for="invoice in invoices" :key="invoice.id" class="flex items-center gap-3 py-2.5">
                <Icon name="file" :size="15" class="shrink-0 text-ink-3" />
                <div class="min-w-0 flex-1">
                  <b class="block font-mono text-[11.5px] font-medium">{{ invoice.id }}</b>
                  <span class="block text-[10px] text-ink-3">{{ invoice.date }}</span>
                </div>
                <span class="font-mono text-[12px] font-medium">{{ money(invoice.amount) }}</span>
                <Chip tone="ok">{{ invoice.status }}</Chip>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <aside class="flex flex-col gap-4">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Workspace</h2>
          <dl class="mt-3 space-y-2 text-[12px]">
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Properties</dt><dd class="font-mono font-medium">4</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Units</dt><dd class="font-mono font-medium">12</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Staff seats</dt><dd class="font-mono font-medium">4 of 6</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Plan</dt><dd class="font-medium">Portfolio</dd></div>
          </dl>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Admin-only areas</h2>
          <p class="mt-1.5 text-[11.5px] leading-relaxed text-ink-2">User management, audit logs and analytics are hidden from the Owner role.</p>
          <div class="mt-3 flex flex-col gap-1.5">
            <RouterLink to="/d/users" class="flex items-center gap-2 text-[12px] font-medium text-ink-2 hover:text-navy-800"><Icon name="user" :size="14" /> User management</RouterLink>
            <RouterLink to="/d/audit-logs" class="flex items-center gap-2 text-[12px] font-medium text-ink-2 hover:text-navy-800"><Icon name="list" :size="14" /> Audit logs</RouterLink>
            <RouterLink to="/d/analytics" class="flex items-center gap-2 text-[12px] font-medium text-ink-2 hover:text-navy-800"><Icon name="chart" :size="14" /> Analytics</RouterLink>
          </div>
        </section>

        <p class="px-1 text-[11px] leading-relaxed text-ink-3">
          Changes are recorded in the audit log with the actor, time and IP address. Billing details are never visible to residents.
        </p>
      </aside>
    </div>
  </div>
</template>
