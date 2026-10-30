<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  documents,
  ledger,
  leaseById,
  money,
  propertyById,
  requestResidentName,
  requestStatusTone,
  requests,
  residentById,
  unitById,
  unitStatusTone,
} from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import PlateDrawing from '@/components/PlateDrawing.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import MetricCard from '@/components/MetricCard.vue'
import Icon from '@/components/Icon.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const route = useRoute()
const store = useAppStore()
const { loading } = usePageLoading()

const unit = computed(() => unitById(route.params.id))
const property = computed(() => (unit.value ? propertyById(unit.value.propertyId) : null))
const tenant = computed(() => (unit.value?.residentId ? residentById(unit.value.residentId) : null))
const lease = computed(() => (unit.value?.leaseId ? leaseById(unit.value.leaseId) : null))
const unitRequests = computed(() => requests.filter((request) => request.unitId === unit.value?.id))
const unitPayments = computed(() => ledger.filter((entry) => entry.unitId === unit.value?.id).slice(0, 5))
const unitDocuments = computed(() => documents.filter((document) => document.target === unit.value?.id))
const credit = computed(() => unitPayments.value.reduce((total, entry) => total + entry.credit, 0))
const debit = computed(() => unitPayments.value.reduce((total, entry) => total + entry.debit, 0))
</script>

<template>
  <PageSkeleton v-if="loading" variant="detail" />
  <div v-else-if="unit && property">
    <PageHeader
      :eyebrow="`${property.name} · ${unit.label}`"
      :title="unit.name"
      :description="`${unit.beds} bedrooms · ${unit.baths} bathroom · ${unit.areaM2} m² · ${unit.floor}`"
      back="/d/units"
    >
      <template #actions>
        <Btn variant="ghost" size="sm" :to="`/properties/${property.id}/units/${unit.id}`">
          <Icon name="external" :size="15" />
          Public page
        </Btn>
        <Btn size="sm" @click="store.toast('Unit editor opened')">
          <Icon name="grid" :size="15" />
          Edit unit
        </Btn>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Monthly rent" :value="money(unit.rent, 0)" :sub="`Service fee ${money(unit.serviceFee, 0)}`" />
      <MetricCard label="Deposit held" :value="money(unit.deposit, 0)" :sub="lease ? lease.depositScheme.split('·')[0] : 'No tenancy'" />
      <MetricCard label="Status" :value="unit.status" :sub="unit.status === 'Vacant' ? `Available ${unit.availableFrom}` : tenant ? tenant.name : '—'" :tone="unit.status === 'Maintenance' ? 'crit' : unit.status === 'Notice' ? 'warn' : ''" />
      <MetricCard label="Open requests" :value="String(unitRequests.filter((request) => !['Resolved', 'Closed'].includes(request.status)).length)" sub="On this unit" />
    </div>

    <div class="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <div class="flex flex-col gap-5">
        <div class="overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
          <PlateDrawing type="plan" :tint="unit.tint" :label="unit.plateLabel" />
          <div class="grid grid-cols-2 divide-x divide-rule border-t border-rule sm:grid-cols-4">
            <div v-for="fact in [
              { value: unit.beds, label: 'Bedrooms' },
              { value: unit.baths, label: 'Bathroom' },
              { value: unit.areaM2, label: 'm² usable' },
              { value: unit.floor, label: 'Level' },
            ]" :key="fact.label" class="px-3 py-3 text-center">
              <b class="block font-mono text-[15px] font-semibold">{{ fact.value }}</b>
              <span class="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.04em] text-ink-3">{{ fact.label }}</span>
            </div>
          </div>
        </div>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Tenancy</h2>
            <Chip :tone="unitStatusTone(unit.status)">{{ unit.status }}</Chip>
          </div>

          <template v-if="tenant">
            <div class="mt-3 flex flex-wrap items-center gap-3">
              <span class="grid h-10 w-10 place-items-center rounded-full bg-navy-100 font-mono text-[11.5px] font-semibold text-navy-800">{{ tenant.initials }}</span>
              <div class="min-w-0 flex-1">
                <RouterLink :to="`/d/residents/${tenant.id}`" class="text-[13px] font-semibold hover:text-navy-800">{{ tenant.name }}</RouterLink>
                <p class="text-[11px] text-ink-3">{{ tenant.email }} · {{ tenant.phone }}</p>
              </div>
              <Chip :tone="tenant.balance ? 'crit' : 'ok'">{{ tenant.balance ? `${money(tenant.balance, 0)} due` : 'Balance clear' }}</Chip>
            </div>
            <dl class="mt-4 grid gap-x-6 gap-y-2.5 border-t border-dashed border-rule pt-3 text-[12px] sm:grid-cols-3">
              <div><dt class="text-ink-3">Tenant since</dt><dd class="mt-0.5 font-medium">{{ tenant.since }}</dd></div>
              <div><dt class="text-ink-3">On-time payments</dt><dd class="mt-0.5 font-mono font-medium">{{ tenant.onTime }}</dd></div>
              <div>
                <dt class="text-ink-3">Lease</dt>
                <dd class="mt-0.5">
                  <RouterLink v-if="lease" :to="`/d/leases/${lease.id}`" class="font-mono font-medium text-navy-600 hover:underline">{{ lease.id }}</RouterLink>
                  <span v-else class="text-ink-3">—</span>
                </dd>
              </div>
              <div v-if="lease"><dt class="text-ink-3">Lease ends</dt><dd class="mt-0.5 font-medium">{{ lease.end }}</dd></div>
              <div v-if="lease"><dt class="text-ink-3">Rent</dt><dd class="mt-0.5 font-mono font-medium">{{ money(lease.rent) }}/mo</dd></div>
              <div><dt class="text-ink-3">Preference</dt><dd class="mt-0.5 text-[11px]">{{ tenant.note }}</dd></div>
            </dl>
          </template>
          <div v-else class="mt-3 rounded-btn border border-dashed border-rule-2 p-4 text-[12px] text-ink-2">
            No tenancy on this unit.
            <span v-if="unit.status === 'Vacant'"> It is ready to let from {{ unit.availableFrom }}.</span>
            <span v-else-if="unit.status === 'Maintenance'"> It stays off the lettings list until the works close.</span>
            <RouterLink to="/d/leases" class="ml-1 font-semibold text-navy-600 hover:underline">Create a lease</RouterLink>
          </div>
        </section>

        <section>
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Requests on this unit</h2>
            <Chip tone="neutral">{{ unitRequests.length }}</Chip>
          </div>
          <div class="divide-y divide-rule overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
            <RouterLink
              v-for="request in unitRequests"
              :key="request.id"
              :to="`/d/requests/${request.id}`"
              class="flex items-center gap-3 px-4 py-3 transition hover:bg-alt"
            >
              <span class="w-16 shrink-0 font-mono text-[10.5px] text-ink-3">{{ request.id }}</span>
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[12.5px] font-semibold">{{ request.title }}</b>
                <span class="block text-[10.5px] text-ink-3">{{ request.submitted }} · {{ requestResidentName(request) }} · {{ request.target }}</span>
              </div>
              <Chip :tone="requestStatusTone(request.status)">{{ request.status }}</Chip>
            </RouterLink>
            <div v-if="!unitRequests.length" class="px-4 py-6 text-center text-[12px] text-ink-3">No requests recorded for this unit.</div>
          </div>
        </section>

        <section>
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Unit ledger</h2>
            <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">Last 5 entries</span>
          </div>
          <div class="divide-y divide-rule overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
            <div v-for="entry in unitPayments" :key="entry.id" class="flex items-center gap-3 px-4 py-3">
              <span class="w-20 shrink-0 font-mono text-[10px] text-ink-3">{{ entry.date }}</span>
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[12px] font-medium">{{ entry.description }}</b>
                <span class="block text-[10px] text-ink-3">{{ entry.category }} · {{ entry.reference }}</span>
              </div>
              <span class="font-mono text-[12px] font-semibold" :class="entry.credit ? 'text-settled' : 'text-signal'">
                {{ entry.credit ? `+${money(entry.credit)}` : `−${money(entry.debit)}` }}
              </span>
            </div>
            <div v-if="!unitPayments.length" class="px-4 py-6 text-center text-[12px] text-ink-3">No ledger entries for this unit yet.</div>
          </div>
        </section>
      </div>

      <aside class="flex flex-col gap-4">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Financial position</h2>
          <dl class="mt-3 space-y-2 text-[12.5px]">
            <div class="flex justify-between gap-3"><dt class="text-ink-2">Collected (5 entries)</dt><dd class="font-mono font-medium text-settled">{{ money(credit) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-2">Costs (5 entries)</dt><dd class="font-mono font-medium text-signal">{{ money(debit) }}</dd></div>
            <div class="flex justify-between gap-3 border-t border-rule-2 pt-2 text-sm font-bold"><dt>Net</dt><dd class="font-mono">{{ money(credit - debit) }}</dd></div>
          </dl>
          <Btn to="/d/ledger" variant="ghost" size="sm" block class="mt-3">Open the ledger</Btn>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Unit details</h2>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <Chip v-for="feature in unit.features" :key="feature">{{ feature }}</Chip>
          </div>
          <dl class="mt-3 space-y-2 border-t border-dashed border-rule pt-3 text-[12px]">
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Type</dt><dd class="font-medium">{{ unit.kind }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Property</dt><dd class="font-medium">{{ property.name }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Floor area</dt><dd class="font-mono">{{ unit.areaM2 }} m²</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Available from</dt><dd class="font-medium">{{ unit.availableFrom || 'Occupied' }}</dd></div>
          </dl>
          <p class="mt-3 border-t border-dashed border-rule pt-3 text-[11px] leading-relaxed text-ink-2">{{ unit.condition }}</p>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Documents</h2>
            <Chip tone="neutral">{{ unitDocuments.length }}</Chip>
          </div>
          <ul class="mt-2 divide-y divide-rule">
            <li v-for="document in unitDocuments" :key="document.id" class="flex items-center gap-2 py-2.5">
              <Icon name="file" :size="14" class="shrink-0 text-ink-3" />
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[11px] font-medium">{{ document.name }}</b>
                <span class="block text-[9.5px] text-ink-3">{{ document.size }} · {{ document.updated }}</span>
              </div>
              <Chip :tone="document.status === 'Action needed' ? 'crit' : 'ok'">{{ document.status }}</Chip>
            </li>
            <li v-if="!unitDocuments.length" class="py-4 text-center text-[11px] text-ink-3">No unit documents.</li>
          </ul>
          <Btn to="/d/documents" variant="ghost" size="sm" block class="mt-2">Upload a document</Btn>
        </section>

        <section v-if="unitRequests.some((request) => !['Resolved', 'Closed'].includes(request.status))" class="rounded-card border border-attention-bd bg-attention-bg p-4 text-[12px] leading-relaxed text-attention">
          <p class="font-semibold">An open request affects this unit</p>
          <p class="mt-1">Keep the unit off the lettings list until it closes, or add a note to the advert.</p>
        </section>
      </aside>
    </div>
  </div>

  <div v-else class="mx-auto max-w-lg rounded-card border border-rule bg-surface p-6 shadow-e1">
    <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Unit not found</p>
    <p class="mt-2 text-[13px] text-ink-2">That unit is not in the portfolio.</p>
    <Btn to="/d/units" class="mt-4">Back to units</Btn>
  </div>
</template>
