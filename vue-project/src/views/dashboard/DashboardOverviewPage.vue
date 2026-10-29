<script setup>
import { computed } from 'vue'
import {
  activity,
  collectionSeries,
  compactMoney,
  exceptions,
  money,
  properties,
  propertyUnits,
  requestResidentName,
  requestStatusTone,
  residents,
  unitShort,
  units,
} from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import MetricCard from '@/components/MetricCard.vue'
import BarChart from '@/components/BarChart.vue'
import SeverityRow from '@/components/SeverityRow.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()

const current = computed(() => collectionSeries[collectionSeries.length - 1])
const collectedPct = computed(() => Math.round((current.value.collected / current.value.invoiced) * 100))
const arrearsTotal = computed(() => residents.filter((resident) => resident.balance > 0).reduce((total, resident) => total + resident.balance, 0))
const arrearsCount = computed(() => residents.filter((resident) => resident.balance > 0).length)
const occupiedCount = computed(() => units.filter((unit) => ['Occupied', 'Notice'].includes(unit.status)).length)
const occupancyPct = computed(() => Math.round((occupiedCount.value / units.length) * 100))
const needsAction = computed(() => store.requestList.filter((request) => request.status === 'Needs action'))
const chartSeries = computed(() => collectionSeries.map((month) => ({ ...month })))

const requestsByStatus = computed(() =>
  ['Needs action', 'Triaged', 'In progress', 'Scheduled', 'Resolved'].map((status) => ({
    status,
    count: store.requestList.filter((request) => request.status === status).length,
  })),
)

const occupancyRows = computed(() =>
  properties.map((property) => {
    const list = propertyUnits(property.id)
    const occupied = list.filter((unit) => ['Occupied', 'Notice'].includes(unit.status)).length
    return { id: property.id, name: property.name, occupied, total: list.length, pct: Math.round((occupied / list.length) * 100) }
  }),
)

const recentRequests = computed(() => store.requestList.slice(0, 4))
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Halden Property Group"
      title="Dashboard"
      :description="`${units.length} units across ${properties.length} properties · ${store.openRequestCount} requests open · ${needsAction.length} need action today.`"
    >
      <template #actions>
        <Btn to="/d/requests" variant="ghost" size="sm">
          <Icon name="wrench" :size="15" />
          Open requests
        </Btn>
        <Btn to="/d/payments" size="sm">
          <Icon name="wallet" :size="15" />
          Record payment
        </Btn>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Collected this month" :value="`${collectedPct}%`" :sub="`${compactMoney(current.collected)} of ${compactMoney(current.invoiced)} invoiced`" />
      <MetricCard label="Arrears" :value="money(arrearsTotal, 0)" :sub="`${arrearsCount} residents · 2 reminders sent`" tone="crit" />
      <MetricCard label="Open requests" :value="String(store.openRequestCount)" :sub="`${needsAction.length} past SLA · oldest 2 days`" tone="warn" />
      <MetricCard label="Occupancy" :value="`${occupancyPct}%`" :sub="`${occupiedCount} of ${units.length} units let`" />
    </div>

    <div class="mt-6 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
      <div class="flex flex-col gap-5">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Collection</p>
              <p class="mt-1 font-mono text-2xl font-semibold tracking-[-0.03em]">{{ money(current.collected, 0) }}</p>
              <p class="mt-0.5 text-[11.5px] text-ink-3">collected against {{ money(current.invoiced, 0) }} invoiced in November</p>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="h-2 w-2 rounded-sm bg-navy-800"></span>
              <span class="font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink-3">Collected</span>
              <span class="ml-2 h-2 w-2 rounded-sm bg-navy-100"></span>
              <span class="font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink-3">Invoiced</span>
            </div>
          </div>

          <BarChart class="mt-5" :series="chartSeries" :height="150" show-secondary />

          <div class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-rule pt-3">
            <p class="text-[11.5px] text-ink-2">{{ money(current.invoiced - current.collected, 0) }} outstanding across the portfolio.</p>
            <RouterLink to="/d/ledger" class="inline-flex items-center gap-1 text-[11.5px] font-semibold text-navy-600 hover:underline">
              Open the ledger <Icon name="chevron" :size="13" />
            </RouterLink>
          </div>
        </section>

        <section>
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Needs you today</h2>
            <Chip tone="neutral">{{ exceptions.length }} items</Chip>
          </div>
          <div class="flex flex-col gap-2.5">
            <SeverityRow v-for="item in exceptions" :key="item.title" :title="item.title" :meta="item.meta" :tone="item.tone" :to="item.to" />
          </div>
        </section>

        <section>
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Latest requests</h2>
            <RouterLink to="/d/requests" class="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-navy-600 hover:underline">All requests</RouterLink>
          </div>
          <div class="divide-y divide-rule overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
            <RouterLink
              v-for="request in recentRequests"
              :key="request.id"
              :to="`/d/requests/${request.id}`"
              class="flex items-center gap-3 px-4 py-3 transition hover:bg-alt"
            >
              <span class="w-16 shrink-0 font-mono text-[10.5px] text-ink-3">{{ request.id }}</span>
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[12.5px] font-semibold">{{ request.title }}</b>
                <span class="block truncate text-[11px] text-ink-3">{{ unitShort(request.unitId) }} · {{ requestResidentName(request) }}</span>
              </div>
              <Chip :tone="requestStatusTone(request.status)">{{ request.status }}</Chip>
              <Icon name="chevron" :size="14" class="shrink-0 text-ink-3" />
            </RouterLink>
          </div>
        </section>
      </div>

      <aside class="flex flex-col gap-4">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Occupancy</h2>
            <Chip tone="neutral">{{ occupancyPct }}%</Chip>
          </div>
          <div class="mt-4 space-y-3">
            <RouterLink v-for="row in occupancyRows" :key="row.id" :to="`/d/properties/${row.id}`" class="block group">
              <div class="flex items-baseline justify-between gap-3 text-[12px]">
                <span class="font-medium text-ink-2 transition group-hover:text-navy-800">{{ row.name }}</span>
                <span class="font-mono text-[10.5px] text-ink-3">{{ row.occupied }}/{{ row.total }}</span>
              </div>
              <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-fyi-bg">
                <span class="block h-full rounded-full bg-navy-800" :style="{ width: row.pct + '%' }"></span>
              </div>
            </RouterLink>
          </div>
          <Btn to="/d/properties" variant="ghost" size="sm" block class="mt-4">All properties</Btn>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Requests by stage</h2>
            <RouterLink to="/d/requests" class="font-mono text-[10px] font-semibold text-navy-600 hover:underline">Open</RouterLink>
          </div>
          <dl class="mt-3 space-y-2 text-[12.5px]">
            <div v-for="row in requestsByStatus" :key="row.status" class="flex items-center justify-between gap-3 border-b border-dashed border-rule pb-2 last:border-0 last:pb-0">
              <dt class="text-ink-2">{{ row.status }}</dt>
              <dd class="font-mono font-semibold" :class="{ 'text-signal': row.status === 'Needs action' && row.count }">{{ row.count }}</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Activity</h2>
          <ul class="mt-3 space-y-3">
            <li v-for="item in activity.slice(0, 5)" :key="item.at + item.action" class="flex gap-2.5">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-300"></span>
              <div class="min-w-0 flex-1">
                <p class="text-[11.5px] leading-relaxed text-ink-2">
                  <b class="font-semibold text-ink">{{ item.actor }}</b> {{ item.action }}
                </p>
                <RouterLink :to="item.to" class="font-mono text-[9.5px] uppercase tracking-[0.06em] text-ink-3 hover:text-navy-800">{{ item.at }}</RouterLink>
              </div>
            </li>
          </ul>
          <RouterLink v-if="store.isAdmin" to="/d/audit-logs" class="mt-3 inline-flex items-center gap-1 text-[11.5px] font-semibold text-navy-600 hover:underline">
            Full audit trail <Icon name="chevron" :size="13" />
          </RouterLink>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Portfolio rent roll</h2>
          <p class="mt-1 font-mono text-xl font-semibold tracking-[-0.02em]">
            {{ money(properties.reduce((total, property) => total + propertyUnits(property.id).reduce((sum, unit) => sum + unit.rent, 0), 0), 0) }}
          </p>
          <p class="mt-0.5 text-[11px] text-ink-3">per month across {{ units.length }} units</p>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <Chip v-for="property in properties" :key="property.id">{{ property.name }}</Chip>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>
