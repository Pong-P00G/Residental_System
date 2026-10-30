<script setup>
import { computed } from 'vue'
import {
  arrearsAging,
  collectionSeries,
  leases,
  money,
  properties,
  propertyUnits,
  requestMix,
  residents,
  units,
} from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import BarChart from '@/components/BarChart.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'
import DataTable from '@/components/DataTable.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const store = useAppStore()
const { loading } = usePageLoading()

const current = collectionSeries[collectionSeries.length - 1]
const chartSeries = computed(() =>
  collectionSeries.map((month) => ({ label: month.label, value: month.collected, secondary: month.invoiced })),
)
const collectionRate = Math.round((current.collected / current.invoiced) * 100)
const occupied = units.filter((unit) => ['Occupied', 'Notice'].includes(unit.status)).length
const occupancyRate = Math.round((occupied / units.length) * 100)
const arrearsTotal = residents.filter((resident) => resident.balance > 0).reduce((total, resident) => total + resident.balance, 0)
const arrearsRate = Math.round((arrearsTotal / current.invoiced) * 1000) / 10

const propertyRows = computed(() =>
  properties.map((property) => {
    const list = propertyUnits(property.id)
    const letUnits = list.filter((unit) => ['Occupied', 'Notice'].includes(unit.status)).length
    const propertyArrears = residents
      .filter((resident) => list.some((unit) => unit.id === resident.unitId))
      .reduce((total, resident) => total + resident.balance, 0)
    return {
      id: property.id,
      name: property.name,
      units: `${letUnits}/${list.length}`,
      occupancy: Math.round((letUnits / list.length) * 100),
      rent: list.reduce((total, unit) => total + unit.rent, 0),
      arrears: propertyArrears,
      requests: store.requestList.filter((request) => {
        if (request.propertyId) return request.propertyId === property.id
        return list.some((unit) => unit.id === request.unitId)
      }).length,
    }
  }),
)

const columns = [
  { key: 'name', label: 'Property' },
  { key: 'units', label: 'Let', align: 'right' },
  { key: 'occupancy', label: 'Occupancy', align: 'right' },
  { key: 'rent', label: 'Rent roll', align: 'right' },
  { key: 'arrears', label: 'Arrears', align: 'right' },
  { key: 'requests', label: 'Requests', align: 'right' },
]

const mix = computed(() => {
  const total = requestMix.reduce((sum, item) => sum + item.value, 0)
  return requestMix.map((item) => ({ ...item, pct: Math.round((item.value / total) * 100) }))
})
</script>

<template>
  <PageSkeleton v-if="loading" variant="dashboard" />
  <div v-else>
    <PageHeader
      eyebrow="Administration"
      title="Analytics"
      description="Portfolio performance across collection, occupancy, maintenance and arrears. Admin-only."
    >
      <template #actions>
        <Chip tone="progress">Admin only</Chip>
        <Btn variant="ghost" size="sm" @click="store.toast('Analytics exported as PDF')">
          <Icon name="download" :size="15" />
          Export report
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-card border border-t-[3px] border-rule border-t-settled bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Collection rate</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ collectionRate }}%</p>
        <p class="text-[11px] text-ink-3">{{ money(current.collected, 0) }} of {{ money(current.invoiced, 0) }}</p>
      </div>
      <div class="rounded-card border border-t-[3px] border-rule border-t-rule-2 bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Occupancy</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ occupancyRate }}%</p>
        <p class="text-[11px] text-ink-3">{{ occupied }} of {{ units.length }} units let</p>
      </div>
      <div class="rounded-card border border-t-[3px] border-rule border-t-signal bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Arrears rate</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ arrearsRate }}%</p>
        <p class="text-[11px] text-ink-3">{{ money(arrearsTotal, 0) }} outstanding</p>
      </div>
      <div class="rounded-card border border-t-[3px] border-rule border-t-attention bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Avg. resolution</p>
        <p class="mt-1 font-mono text-2xl font-semibold">2.4d</p>
        <p class="text-[11px] text-ink-3">Routine requests · target 3d</p>
      </div>
    </div>

    <div class="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <div class="flex flex-col gap-5">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Collection by month</h2>
              <p class="mt-1 text-[12.5px] text-ink-2">Invoiced against collected, rolling 12 months.</p>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-sm bg-navy-800"></span>
              <span class="font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink-3">Collected</span>
              <span class="ml-2 h-2 w-2 rounded-sm bg-navy-100"></span>
              <span class="font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink-3">Invoiced</span>
            </div>
          </div>
          <BarChart class="mt-5" :series="chartSeries" :height="190" show-secondary />
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Request mix</h2>
            <Chip tone="neutral">{{ store.requestList.length }} requests</Chip>
          </div>
          <div class="mt-4 space-y-3">
            <div v-for="item in mix" :key="item.label">
              <div class="flex items-baseline justify-between gap-3 text-[12px]">
                <span class="text-ink-2">{{ item.label }}</span>
                <span class="font-mono text-[10.5px] text-ink-3">{{ item.value }} · {{ item.pct }}%</span>
              </div>
              <div class="mt-1 h-2 overflow-hidden rounded-full bg-fyi-bg">
                <span class="block h-full rounded-full bg-navy-800" :style="{ width: item.pct + '%' }"></span>
              </div>
            </div>
          </div>
          <p class="mt-4 border-t border-dashed border-rule pt-3 text-[11px] text-ink-3">
            Plumbing and heating account for more than half of all requests — the two categories with the tightest SLA.
          </p>
        </section>

        <section>
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Property performance</h2>
            <RouterLink to="/d/properties" class="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-navy-600 hover:underline">All properties</RouterLink>
          </div>
          <DataTable :columns="columns" :rows="propertyRows" min-width="720px">
            <template #cell-name="{ row }">
              <RouterLink :to="`/d/properties/${row.id}`" class="text-[12px] font-semibold text-ink hover:text-navy-800">{{ row.name }}</RouterLink>
            </template>
            <template #cell-units="{ row }"><span class="font-mono text-[12px]">{{ row.units }}</span></template>
            <template #cell-occupancy="{ row }"><span class="font-mono text-[12px]">{{ row.occupancy }}%</span></template>
            <template #cell-rent="{ row }"><span class="font-mono text-[12px] font-medium">{{ money(row.rent, 0) }}</span></template>
            <template #cell-arrears="{ row }">
              <span class="font-mono text-[12px] font-medium" :class="row.arrears ? 'text-signal' : 'text-settled'">{{ row.arrears ? money(row.arrears, 0) : '—' }}</span>
            </template>
            <template #cell-requests="{ row }"><span class="font-mono text-[12px]">{{ row.requests }}</span></template>
          </DataTable>
        </section>
      </div>

      <aside class="flex flex-col gap-4">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Arrears aging</h2>
          <div class="mt-3 space-y-3">
            <div v-for="bucket in arrearsAging" :key="bucket.label" class="flex items-center gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-3">
                  <span class="text-[11.5px] text-ink-2">{{ bucket.label }}</span>
                  <span class="font-mono text-[10.5px] text-ink-3">{{ bucket.units }} unit{{ bucket.units === 1 ? '' : 's' }}</span>
                </div>
                <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-fyi-bg">
                  <span
                    class="block h-full rounded-full"
                    :class="bucket.value ? 'bg-signal' : 'bg-rule-2'"
                    :style="{ width: bucket.value ? Math.max((bucket.value / arrearsTotal) * 100, 8) + '%' : '0%' }"
                  ></span>
                </div>
              </div>
              <span class="w-14 shrink-0 text-right font-mono text-[11px] font-medium">{{ bucket.value ? money(bucket.value, 0) : '—' }}</span>
            </div>
          </div>
          <p class="mt-4 border-t border-dashed border-rule pt-3 text-[11px] leading-relaxed text-ink-3">
            Nothing is older than 30 days. Both accounts are on a payment plan and have been contacted twice.
          </p>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Maintenance health</h2>
          <dl class="mt-3 space-y-2.5 text-[12.5px]">
            <div class="flex items-center justify-between gap-3"><dt class="text-ink-2">Open requests</dt><dd class="font-mono font-semibold">{{ store.openRequestCount }}</dd></div>
            <div class="flex items-center justify-between gap-3"><dt class="text-ink-2">Past SLA</dt><dd class="font-mono font-semibold text-signal">{{ store.requestList.filter((request) => request.sla >= 85 && !['Resolved', 'Closed'].includes(request.status)).length }}</dd></div>
            <div class="flex items-center justify-between gap-3"><dt class="text-ink-2">Resolved this period</dt><dd class="font-mono font-semibold">{{ store.requestList.filter((request) => request.status === 'Resolved').length }}</dd></div>
            <div class="flex items-center justify-between gap-3"><dt class="text-ink-2">Unassigned</dt><dd class="font-mono font-semibold">{{ store.requestList.filter((request) => !request.vendorId && !['Resolved', 'Closed'].includes(request.status)).length }}</dd></div>
          </dl>
          <Btn to="/d/requests" variant="ghost" size="sm" block class="mt-3">Open requests</Btn>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Portfolio at a glance</h2>
          <dl class="mt-3 space-y-2.5 text-[12.5px]">
            <div class="flex items-center justify-between gap-3"><dt class="text-ink-2">Residents</dt><dd class="font-mono font-semibold">{{ residents.length }}</dd></div>
            <div class="flex items-center justify-between gap-3"><dt class="text-ink-2">Monthly rent roll</dt><dd class="font-mono font-semibold">{{ money(units.reduce((total, unit) => total + unit.rent, 0), 0) }}</dd></div>
            <div class="flex items-center justify-between gap-3"><dt class="text-ink-2">Deposits held</dt><dd class="font-mono font-semibold">{{ money(leases.reduce((total, lease) => total + lease.deposit, 0), 0) }}</dd></div>
          </dl>
          <p class="mt-3 border-t border-dashed border-rule pt-3 text-[11px] leading-relaxed text-ink-3">
            Occupancy counts units with notice given until the tenancy ends.
          </p>
        </section>
      </aside>
    </div>
  </div>
</template>
