<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  documents,
  money,
  properties,
  propertyById,
  propertyRequests,
  propertyUnits,
  residentById,
  unitStatusTone,
} from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import MasterDetail from '@/components/MasterDetail.vue'
import PlateDrawing from '@/components/PlateDrawing.vue'
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

const property = computed(() => propertyById(route.params.id))
const masterItems = computed(() =>
  properties.map((item) => ({
    to: `/d/properties/${item.id}`,
    label: item.name,
    meta: `${item.ref} · ${item.area}`,
    active: item.id === property.value?.id,
  })),
)
const unitList = computed(() => (property.value ? propertyUnits(property.value.id) : []))
const occupied = computed(() => unitList.value.filter((unit) => ['Occupied', 'Notice'].includes(unit.status)).length)
const rentRoll = computed(() => unitList.value.reduce((total, unit) => total + unit.rent, 0))
const openRequests = computed(() => propertyRequests(property.value?.id).filter((request) => !['Resolved', 'Closed'].includes(request.status)))
const propertyDocs = computed(() => (property.value ? documents.filter((document) => document.target === property.value.id) : []))

const columns = [
  { key: 'unit', label: 'Unit' },
  { key: 'layout', label: 'Layout' },
  { key: 'tenant', label: 'Resident' },
  { key: 'rent', label: 'Rent', align: 'right' },
  { key: 'lease', label: 'Lease ends' },
  { key: 'status', label: 'Status' },
  { key: 'open', label: '', align: 'right' },
]

const rows = computed(() =>
  unitList.value.map((unit) => ({
    ...unit,
    tenant: residentById(unit.residentId)?.name || '—',
    lease: unit.leaseId || '—',
  })),
)

const propertyChecks = computed(() => [
  { title: 'Fire risk assessment', meta: 'Scheduled 22 Nov 2026 · every unit needs access', tone: 'warn' },
  { title: 'Building insurance', meta: 'Renews 1 Apr 2027 · schedule current', tone: '' },
  { title: 'EPC', meta: `Class ${property.value?.epc} · valid to 2030`, tone: '' },
])
</script>

<template>
  <PageSkeleton v-if="loading" variant="detail" />
  <div v-else-if="property">
    <PageHeader
      :eyebrow="`${property.ref} · Portfolio`"
      :title="property.name"
      :description="`${property.address} · ${property.kind.toLowerCase()} · managed by ${property.manager}`"
      back="/d/properties"
    >
      <template #actions>
        <Btn variant="ghost" size="sm" :to="`/properties/${property.id}`">
          <Icon name="external" :size="15" />
          Public page
        </Btn>
        <Btn size="sm" @click="store.toast('Property editor opened')">
          <Icon name="grid" :size="15" />
          Edit property
        </Btn>
      </template>
    </PageHeader>

    <MasterDetail label="Properties" :items="masterItems">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Units" :value="String(unitList.length)" sub="Across all floors" />
      <MetricCard label="Occupancy" :value="`${Math.round((occupied / unitList.length) * 100)}%`" :sub="`${occupied} of ${unitList.length} let`" />
      <MetricCard label="Rent roll" :value="money(rentRoll, 0)" sub="Contracted, before fees" />
      <MetricCard label="Open requests" :value="String(openRequests.length)" :sub="openRequests.length ? 'In the works queue' : 'Nothing open'" :tone="openRequests.length ? 'warn' : ''" />
    </div>

    <div class="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <div class="flex flex-col gap-5">
        <div class="overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
          <PlateDrawing
            type="elevation"
            :variant="property.variant"
            :tint="property.tint"
            :label="property.plateLabel"
            :width-label="property.plateWidth"
          />
          <div class="grid grid-cols-2 divide-x divide-rule border-t border-rule sm:grid-cols-4">
            <div v-for="fact in [
              { value: property.built, label: 'Built' },
              { value: property.floors, label: 'Floors' },
              { value: `EPC ${property.epc}`, label: 'Rating' },
              { value: money(property.serviceFee, 0), label: 'Service fee' },
            ]" :key="fact.label" class="px-3 py-3 text-center">
              <b class="block font-mono text-[14px] font-semibold">{{ fact.value }}</b>
              <span class="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.04em] text-ink-3">{{ fact.label }}</span>
            </div>
          </div>
        </div>

        <section>
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Units</h2>
            <div class="flex items-center gap-2">
              <Chip tone="neutral">{{ unitList.length }}</Chip>
              <Btn variant="ghost" size="xs" @click="store.toast('Add unit form opened')">
                <Icon name="plus" :size="12" /> Add unit
              </Btn>
            </div>
          </div>

          <DataTable :columns="columns" :rows="rows" min-width="860px" empty="No units in this property yet.">
            <template #cell-unit="{ row }">
              <RouterLink :to="`/d/units/${row.id}`" class="inline-flex items-center gap-2 group">
                <span class="grid h-7 w-7 place-items-center rounded-md border border-navy-100 bg-navy-50 font-mono text-[10px] font-semibold text-navy-800">
                  {{ row.label }}
                </span>
                <b class="text-[12px] font-semibold text-ink group-hover:text-navy-800">{{ row.name }}</b>
              </RouterLink>
            </template>
            <template #cell-layout="{ row }">
              <span class="text-[12px]">{{ row.beds }} bed · {{ row.baths }} bath · {{ row.areaM2 }} m²</span>
            </template>
            <template #cell-tenant="{ row }">
              <RouterLink v-if="row.residentId" :to="`/d/residents/${row.residentId}`" class="text-[12px] font-medium text-navy-600 hover:underline">
                {{ row.tenant }}
              </RouterLink>
              <span v-else class="text-[11px] text-ink-3">Vacant</span>
            </template>
            <template #cell-rent="{ row }">
              <span class="font-mono text-[12px] font-medium">{{ money(row.rent, 0) }}</span>
            </template>
            <template #cell-lease="{ row }">
              <span class="font-mono text-[11px] text-ink-2">{{ row.lease }}</span>
            </template>
            <template #cell-status="{ row }">
              <Chip :tone="unitStatusTone(row.status)">{{ row.status }}</Chip>
            </template>
            <template #cell-open="{ row }">
              <RouterLink :to="`/d/units/${row.id}`" class="text-[11px] font-semibold text-navy-600 hover:underline">Open</RouterLink>
            </template>
          </DataTable>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Condition & amenities</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <Chip v-for="amenity in property.amenities" :key="amenity">{{ amenity }}</Chip>
          </div>
          <p class="mt-3 text-[12.5px] leading-relaxed text-ink-2">{{ property.condition }}</p>
        </section>
      </div>

      <aside class="flex flex-col gap-4">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Manager</h2>
          <p class="mt-1.5 text-[13px] font-semibold">{{ property.manager }}</p>
          <p class="text-[11.5px] text-ink-2">Halden Property Group</p>
          <div class="mt-3 flex flex-col gap-1.5 border-t border-dashed border-rule pt-3 text-[11.5px]">
            <a href="tel:0800118440" class="flex items-center gap-2 font-medium text-ink-2 hover:text-navy-800"><Icon name="phone" :size="13" /> 0800 118 440</a>
            <a href="mailto:hello@halden.example" class="flex items-center gap-2 font-medium text-ink-2 hover:text-navy-800"><Icon name="message" :size="13" /> hello@halden.example</a>
          </div>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Compliance</h2>
            <Chip tone="warn">2 due</Chip>
          </div>
          <ul class="mt-2 divide-y divide-rule">
            <li v-for="check in propertyChecks" :key="check.title" class="py-2.5">
              <b class="block text-[12px] font-semibold">{{ check.title }}</b>
              <span class="block text-[10.5px] text-ink-3">{{ check.meta }}</span>
            </li>
          </ul>
          <Btn to="/d/compliance" variant="ghost" size="sm" block class="mt-2">Compliance calendar</Btn>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Documents</h2>
            <Chip tone="neutral">{{ propertyDocs.length }}</Chip>
          </div>
          <ul class="mt-2 divide-y divide-rule">
            <li v-for="document in propertyDocs" :key="document.id" class="flex items-center gap-2 py-2.5">
              <Icon name="file" :size="14" class="shrink-0 text-ink-3" />
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[11px] font-medium">{{ document.name }}</b>
                <span class="block text-[9.5px] text-ink-3">{{ document.size }} · {{ document.updated }}</span>
              </div>
              <Chip :tone="document.status === 'Expiring' ? 'warn' : 'ok'">{{ document.status }}</Chip>
            </li>
          </ul>
          <Btn to="/d/documents" variant="ghost" size="sm" block class="mt-2">All documents</Btn>
        </section>

        <section v-if="openRequests.length" class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Open requests here</h2>
          <ul class="mt-2 divide-y divide-rule">
            <li v-for="request in openRequests" :key="request.id">
              <RouterLink :to="`/d/requests/${request.id}`" class="flex items-center gap-2 py-2.5">
                <div class="min-w-0 flex-1">
                  <b class="block truncate text-[11.5px] font-medium">{{ request.title }}</b>
                  <span class="block text-[10px] text-ink-3">{{ request.id }} · {{ request.target }}</span>
                </div>
                <Icon name="chevron" :size="14" class="shrink-0 text-ink-3" />
              </RouterLink>
            </li>
          </ul>
        </section>
      </aside>
      </div>
    </MasterDetail>
  </div>

  <div v-else class="mx-auto max-w-lg rounded-card border border-rule bg-surface p-6 shadow-e1">
    <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Property not found</p>
    <p class="mt-2 text-[13px] text-ink-2">That reference is not in the portfolio.</p>
    <Btn to="/d/properties" class="mt-4">Back to properties</Btn>
  </div>
</template>
