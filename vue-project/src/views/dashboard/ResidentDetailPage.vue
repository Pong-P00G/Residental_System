<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  leaseOfResident,
  money,
  payments,
  paymentStatusTone,
  propertyById,
  requestStatusTone,
  requests,
  residentById,
  unitById,
} from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import MetricCard from '@/components/MetricCard.vue'
import DataTable from '@/components/DataTable.vue'
import Icon from '@/components/Icon.vue'

const route = useRoute()
const store = useAppStore()

const resident = computed(() => residentById(route.params.id))
const unit = computed(() => (resident.value ? unitById(resident.value.unitId) : null))
const property = computed(() => (unit.value ? propertyById(unit.value.propertyId) : null))
const lease = computed(() => (resident.value ? leaseOfResident(resident.value.id) : null))
const residentRequests = computed(() => requests.filter((request) => request.residentId === resident.value?.id))
const residentPayments = computed(() => payments.filter((payment) => payment.residentId === resident.value?.id))
const paidTotal = computed(() => residentPayments.value.filter((payment) => payment.status === 'Cleared').reduce((total, payment) => total + payment.amount, 0))

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'reference', label: 'Reference' },
  { key: 'type', label: 'Type' },
  { key: 'method', label: 'Method' },
  { key: 'amount', label: 'Amount', align: 'right' },
  { key: 'status', label: 'Status' },
]
</script>

<template>
  <div v-if="resident">
    <PageHeader
      :eyebrow="`Resident · ${unit ? unit.label : 'No unit'}`"
      :title="resident.name"
      :description="`${property ? property.name : ''} · tenant since ${resident.since} · ${resident.onTime} on-time payments`"
      back="/d/residents"
    >
      <template #actions>
        <a :href="`mailto:${resident.email}`" class="inline-flex h-9 items-center gap-2 rounded-btn border border-rule-2 bg-surface px-3.5 text-xs font-semibold text-ink transition hover:bg-navy-50">
          <Icon name="message" :size="14" /> Message
        </a>
        <Btn size="sm" @click="store.toast('Resident editor opened')">Edit record</Btn>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Outstanding" :value="resident.balance ? money(resident.balance, 0) : 'Clear'" sub="On the current statement" :tone="resident.balance ? 'crit' : 'ok'" />
      <MetricCard label="Monthly rent" :value="money(lease?.rent || 0, 0)" sub="Rent before fees" />
      <MetricCard label="Open requests" :value="String(residentRequests.filter((request) => !['Resolved', 'Closed'].includes(request.status)).length)" sub="On their unit" />
      <MetricCard label="Collected to date" :value="money(paidTotal, 0)" sub="Cleared payments on record" />
    </div>

    <div class="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <div class="flex flex-col gap-5">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <span class="grid h-12 w-12 place-items-center rounded-full bg-navy-100 font-mono text-[14px] font-semibold text-navy-800">{{ resident.initials }}</span>
              <div>
                <h2 class="text-base font-semibold tracking-[-0.02em]">{{ resident.name }}</h2>
                <p class="text-[11.5px] text-ink-2">{{ resident.email }}</p>
                <p class="text-[11.5px] text-ink-2">{{ resident.phone }}</p>
              </div>
            </div>
            <Chip :tone="resident.status === 'Current' ? 'ok' : resident.status === 'Arrears' ? 'crit' : 'warn'">{{ resident.status }}</Chip>
          </div>

          <dl class="mt-5 grid gap-x-6 gap-y-3 border-t border-dashed border-rule pt-4 text-[12px] sm:grid-cols-3">
            <div>
              <dt class="text-ink-3">Unit</dt>
              <dd class="mt-0.5">
                <RouterLink v-if="unit" :to="`/d/units/${unit.id}`" class="font-medium text-navy-600 hover:underline">{{ unit.name }}</RouterLink>
                <span v-else class="text-ink-3">—</span>
              </dd>
            </div>
            <div>
              <dt class="text-ink-3">Property</dt>
              <dd class="mt-0.5 font-medium">{{ property?.name || '—' }}</dd>
            </div>
            <div>
              <dt class="text-ink-3">Lease</dt>
              <dd class="mt-0.5">
                <RouterLink v-if="lease" :to="`/d/leases/${lease.id}`" class="font-mono font-medium text-navy-600 hover:underline">{{ lease.id }}</RouterLink>
                <span v-else class="text-ink-3">—</span>
              </dd>
            </div>
            <div>
              <dt class="text-ink-3">Tenant since</dt>
              <dd class="mt-0.5 font-medium">{{ resident.since }}</dd>
            </div>
            <div>
              <dt class="text-ink-3">Lease ends</dt>
              <dd class="mt-0.5 font-medium">{{ lease?.end || '—' }}</dd>
            </div>
            <div>
              <dt class="text-ink-3">Deposit</dt>
              <dd class="mt-0.5 font-mono font-medium">{{ money(lease?.deposit || 0) }}</dd>
            </div>
          </dl>

          <div class="mt-4 rounded-btn border border-rule bg-alt p-3.5">
            <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ink-3">Case note</p>
            <p class="mt-1 text-[12px] leading-relaxed text-ink-2">{{ resident.note }}</p>
          </div>
        </section>

        <section>
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Payment history</h2>
            <Chip tone="neutral">{{ residentPayments.length }} records</Chip>
          </div>
          <DataTable :columns="columns" :rows="residentPayments" min-width="700px" empty="No payments recorded.">
            <template #cell-reference="{ row }"><span class="font-mono text-[11px]">{{ row.reference }}</span></template>
            <template #cell-amount="{ row }"><span class="font-mono font-semibold">{{ money(row.amount) }}</span></template>
            <template #cell-status="{ row }"><Chip :tone="paymentStatusTone(row.status)">{{ row.status }}</Chip></template>
          </DataTable>
        </section>

        <section>
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Requests</h2>
            <Chip tone="neutral">{{ residentRequests.length }}</Chip>
          </div>
          <div class="divide-y divide-rule overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
            <RouterLink
              v-for="request in residentRequests"
              :key="request.id"
              :to="`/d/requests/${request.id}`"
              class="flex items-center gap-3 px-4 py-3 transition hover:bg-alt"
            >
              <span class="w-16 shrink-0 font-mono text-[10.5px] text-ink-3">{{ request.id }}</span>
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[12.5px] font-semibold">{{ request.title }}</b>
                <span class="block text-[10.5px] text-ink-3">{{ request.submitted }} · {{ request.category }} · {{ request.target }}</span>
              </div>
              <Chip :tone="requestStatusTone(request.status)">{{ request.status }}</Chip>
            </RouterLink>
            <div v-if="!residentRequests.length" class="px-4 py-6 text-center text-[12px] text-ink-3">No requests from this resident.</div>
          </div>
        </section>
      </div>

      <aside class="flex flex-col gap-4">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Account position</h2>
          <p class="mt-2 font-mono text-2xl font-semibold tracking-[-0.02em]" :class="resident.balance ? 'text-signal' : 'text-settled'">
            {{ resident.balance ? money(resident.balance) : '0.00' }}
          </p>
          <p class="text-[11.5px] text-ink-3">{{ resident.balance ? 'Outstanding on the current statement' : 'Nothing outstanding' }}</p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <Chip :tone="resident.latePayments ? 'warn' : 'ok'">{{ resident.latePayments }} late</Chip>
            <Chip tone="neutral">{{ resident.onTime }} on time</Chip>
          </div>
          <div class="mt-3 flex flex-col gap-2 border-t border-dashed border-rule pt-3">
            <Btn to="/d/payments" variant="ghost" size="sm" block>Record a payment</Btn>
            <Btn to="/d/ledger" variant="ghost" size="sm" block>Open the ledger</Btn>
          </div>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Lease</h2>
          <p v-if="lease" class="mt-1.5 font-mono text-[12.5px] font-semibold">{{ lease.id }}</p>
          <p class="text-[11.5px] text-ink-2">{{ lease ? `${lease.start} – ${lease.end}` : 'No active lease' }}</p>
          <dl class="mt-3 space-y-1.5 border-t border-dashed border-rule pt-3 text-[12px]">
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Rent</dt><dd class="font-mono">{{ money(lease?.rent || 0) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Deposit</dt><dd class="font-mono">{{ money(lease?.deposit || 0) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Renewal</dt><dd class="font-medium">{{ lease?.renewal || '—' }}</dd></div>
          </dl>
          <Btn v-if="lease" :to="`/d/leases/${lease.id}`" variant="ghost" size="sm" block class="mt-3">Open lease</Btn>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Contact</h2>
          <div class="mt-2 space-y-1.5 text-[12px]">
            <a :href="`mailto:${resident.email}`" class="flex items-center gap-2 font-medium text-ink-2 hover:text-navy-800"><Icon name="message" :size="14" /> {{ resident.email }}</a>
            <a :href="`tel:${resident.phone.replace(/\\s/g, '')}`" class="flex items-center gap-2 font-medium text-ink-2 hover:text-navy-800"><Icon name="phone" :size="14" /> {{ resident.phone }}</a>
          </div>
          <p class="mt-3 border-t border-dashed border-rule pt-3 text-[10.5px] leading-relaxed text-ink-3">
            Contact details are shown to staff only and are never shared with vendors.
          </p>
        </section>
      </aside>
    </div>
  </div>

  <div v-else class="mx-auto max-w-lg rounded-card border border-rule bg-surface p-6 shadow-e1">
    <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Resident not found</p>
    <p class="mt-2 text-[13px] text-ink-2">That record is not in the portfolio.</p>
    <Btn to="/d/residents" class="mt-4">Back to residents</Btn>
  </div>
</template>
