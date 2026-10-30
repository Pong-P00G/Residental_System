<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  leaseById,
  leaseStatusTone,
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
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const route = useRoute()
const store = useAppStore()
const { loading } = usePageLoading()

const lease = computed(() => leaseById(route.params.id))
const unit = computed(() => (lease.value ? unitById(lease.value.unitId) : null))
const property = computed(() => (unit.value ? propertyById(unit.value.propertyId) : null))
const resident = computed(() => (lease.value?.residentId ? residentById(lease.value.residentId) : null))
const tenantName = computed(() => resident.value?.name || lease.value?.tenantName || '—')
const leasePayments = computed(() => payments.filter((payment) => resident.value && payment.residentId === resident.value.id))
const residentRequests = computed(() => requests.filter((request) => resident.value && request.residentId === resident.value.id))
const cleared = computed(() => leasePayments.value.filter((payment) => payment.status === 'Cleared').reduce((total, payment) => total + payment.amount, 0))

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'reference', label: 'Reference' },
  { key: 'type', label: 'Type' },
  { key: 'amount', label: 'Amount', align: 'right' },
  { key: 'status', label: 'Status' },
]
</script>

<template>
  <PageSkeleton v-if="loading" variant="detail" />
  <div v-else-if="lease">
    <PageHeader
      :eyebrow="`Lease · ${lease.id}`"
      :title="tenantName"
      :description="`${unit.name}, ${property.name} · ${lease.start} – ${lease.end} · ${lease.term} term`"
      back="/d/leases"
    >
      <template #actions>
        <Chip :tone="leaseStatusTone(lease.status)">{{ lease.status }}</Chip>
        <Btn variant="ghost" size="sm" @click="store.toast('Tenancy agreement downloaded')">
          <Icon name="download" :size="15" />
          Agreement
        </Btn>
        <Btn
          size="sm"
          @click="store.toast(lease.status === 'Pending signature' ? 'Lease sent for signature' : 'Renewal draft created')"
        >
          {{ lease.status === 'Pending signature' ? 'Send for signature' : 'Start renewal' }}
        </Btn>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Monthly rent" :value="money(lease.rent, 0)" :sub="`${money(lease.rent * 12, 0)} per year`" />
      <MetricCard label="Deposit held" :value="money(lease.deposit, 0)" :sub="lease.depositScheme.split('·')[0]" />
      <MetricCard label="Tenant" :value="tenantName.split(' ')[0]" :sub="unit.name" />
      <MetricCard
        label="Collected"
        :value="money(cleared, 0)"
        sub="Cleared payments on this tenancy"
        :tone="lease.status === 'In arrears' ? 'crit' : lease.status === 'Expiring' ? 'warn' : 'ok'"
      />
    </div>

    <div class="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <div class="flex flex-col gap-5">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Terms</h2>
            <span class="font-mono text-[10px] text-ink-3">{{ lease.id }}</span>
          </div>
          <dl class="mt-3 grid gap-x-6 gap-y-3 text-[12px] sm:grid-cols-3">
            <div><dt class="text-ink-3">Start</dt><dd class="mt-0.5 font-medium">{{ lease.start }}</dd></div>
            <div><dt class="text-ink-3">End</dt><dd class="mt-0.5 font-medium">{{ lease.end }}</dd></div>
            <div><dt class="text-ink-3">Term</dt><dd class="mt-0.5 font-medium">{{ lease.term }}</dd></div>
            <div><dt class="text-ink-3">Rent</dt><dd class="mt-0.5 font-mono font-medium">{{ money(lease.rent) }}</dd></div>
            <div><dt class="text-ink-3">Deposit</dt><dd class="mt-0.5 font-mono font-medium">{{ money(lease.deposit) }}</dd></div>
            <div><dt class="text-ink-3">Signed</dt><dd class="mt-0.5 font-medium">{{ lease.signed || 'Not signed' }}</dd></div>
            <div class="sm:col-span-2"><dt class="text-ink-3">Deposit scheme</dt><dd class="mt-0.5 font-medium">{{ lease.depositScheme }}</dd></div>
            <div><dt class="text-ink-3">Renewal</dt><dd class="mt-0.5 font-medium">{{ lease.renewal }}</dd></div>
          </dl>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Documents</h2>
            <Chip tone="neutral">{{ lease.documents.length }}</Chip>
          </div>
          <ul class="mt-2 divide-y divide-rule">
            <li v-for="document in lease.documents" :key="document" class="flex items-center gap-3 py-2.5">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-rule-2 bg-alt text-ink-2"><Icon name="file" :size="15" /></span>
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[12px] font-semibold">{{ document }}</b>
                <span class="block text-[10px] text-ink-3">PDF · {{ lease.id }}</span>
              </div>
              <button type="button" class="inline-flex h-8 items-center gap-1.5 rounded-btn border border-rule-2 px-2.5 text-[11px] font-semibold text-ink-2 transition hover:bg-navy-50" @click="store.toast(`${document} downloaded`)">
                <Icon name="download" :size="13" /> Download
              </button>
            </li>
          </ul>
        </section>

        <section>
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Payment history</h2>
            <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">{{ leasePayments.length }} records</span>
          </div>
          <DataTable :columns="columns" :rows="leasePayments" min-width="620px" empty="No payments on this tenancy yet.">
            <template #cell-reference="{ row }"><span class="font-mono text-[11px]">{{ row.reference }}</span></template>
            <template #cell-amount="{ row }"><span class="font-mono font-semibold">{{ money(row.amount) }}</span></template>
            <template #cell-status="{ row }"><Chip :tone="paymentStatusTone(row.status)">{{ row.status }}</Chip></template>
          </DataTable>
        </section>

        <section v-if="residentRequests.length">
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Requests on this tenancy</h2>
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
              <b class="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{{ request.title }}</b>
              <Chip :tone="requestStatusTone(request.status)">{{ request.status }}</Chip>
            </RouterLink>
          </div>
        </section>
      </div>

      <aside class="flex flex-col gap-4">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">The unit</h2>
          <RouterLink :to="`/d/units/${unit.id}`" class="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 hover:underline">
            {{ unit.name }} <Icon name="chevron" :size="13" />
          </RouterLink>
          <p class="text-[11.5px] text-ink-2">{{ property.name }}</p>
          <dl class="mt-3 space-y-1.5 border-t border-dashed border-rule pt-3 text-[12px]">
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Layout</dt><dd class="font-medium">{{ unit.beds }} bed · {{ unit.baths }} bath</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Floor area</dt><dd class="font-mono">{{ unit.areaM2 }} m²</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Service fee</dt><dd class="font-mono">{{ money(unit.serviceFee) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Status</dt><dd><Chip :tone="leaseStatusTone(lease.status)">{{ unit.status }}</Chip></dd></div>
          </dl>
        </section>

        <section v-if="resident" class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Resident</h2>
          <RouterLink :to="`/d/residents/${resident.id}`" class="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-navy-600 hover:underline">
            {{ resident.name }} <Icon name="chevron" :size="13" />
          </RouterLink>
          <p class="text-[11.5px] text-ink-2">{{ resident.email }}</p>
          <p class="text-[11.5px] text-ink-2">{{ resident.phone }}</p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <Chip :tone="resident.balance ? 'crit' : 'ok'">{{ resident.balance ? `${money(resident.balance, 0)} due` : 'Balance clear' }}</Chip>
            <Chip tone="neutral">{{ resident.onTime }} on time</Chip>
          </div>
          <Btn :to="`/d/residents/${resident.id}`" variant="ghost" size="sm" block class="mt-3">Open resident</Btn>
        </section>

        <section class="rounded-card border border-navy-100 bg-navy-50 p-5">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-navy-600">Renewal</h2>
          <p class="mt-1.5 text-[13px] font-semibold text-navy-900">{{ lease.renewal }}</p>
          <p class="mt-1 text-[12px] leading-relaxed text-navy-800/80">
            Renewal terms are issued three months before {{ lease.end }}. The resident can accept, renegotiate or give notice — nothing happens silently.
          </p>
          <Btn size="sm" class="mt-3" @click="store.toast('Renewal terms drafted for review')">Draft renewal terms</Btn>
        </section>

        <section class="flex items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[11.5px] leading-relaxed text-ink-2 shadow-e1">
          <Icon name="shield" :size="15" class="mt-0.5 shrink-0 text-settled" />
          <p>Deposits are protected within 30 days of receipt. The certificate is on this record, not in a filing cabinet.</p>
        </section>
      </aside>
    </div>
  </div>

  <div v-else class="mx-auto max-w-lg rounded-card border border-rule bg-surface p-6 shadow-e1">
    <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Lease not found</p>
    <p class="mt-2 text-[13px] text-ink-2">That lease reference is not in the portfolio.</p>
    <Btn to="/d/leases" class="mt-4">Back to leases</Btn>
  </div>
</template>
