<script setup>
import { computed } from 'vue'
import { money, properties, propertyRequests, propertyUnits } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'
import DataTable from '@/components/DataTable.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const store = useAppStore()
const { loading } = usePageLoading()

const columns = [
  { key: 'name', label: 'Property' },
  { key: 'kind', label: 'Type' },
  { key: 'units', label: 'Units', align: 'right' },
  { key: 'occupancy', label: 'Occupancy', align: 'right' },
  { key: 'rent', label: 'Rent roll', align: 'right' },
  { key: 'requests', label: 'Open', align: 'right' },
  { key: 'manager', label: 'Manager' },
  { key: 'open', label: '', align: 'right' },
]

const rows = computed(() =>
  properties.map((property) => {
    const list = propertyUnits(property.id)
    const occupied = list.filter((unit) => ['Occupied', 'Notice'].includes(unit.status)).length
    return {
      ...property,
      unitsCount: list.length,
      occupied,
      pct: Math.round((occupied / list.length) * 100),
      rentRoll: list.reduce((total, unit) => total + unit.rent, 0),
      openRequests: propertyRequests(property.id).filter((request) => !['Resolved', 'Closed'].includes(request.status)).length,
    }
  }),
)
</script>

<template>
  <PageSkeleton v-if="loading" variant="table" :rows="5" />
  <div v-else>
    <PageHeader
      eyebrow="Portfolio"
      title="Properties"
      description="Every building and house in the portfolio, with the rent roll and occupancy live from the tenancy record."
    >
      <template #actions>
        <Btn variant="ghost" size="sm" to="/d/units">All units</Btn>
        <Btn size="sm" @click="store.toast('Add property form opened')">
          <Icon name="plus" :size="15" />
          Add property
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Properties</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ properties.length }}</p>
        <p class="text-[11px] text-ink-3">Blocks and houses managed directly</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Total units</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ rows.reduce((total, row) => total + row.unitsCount, 0) }}</p>
        <p class="text-[11px] text-ink-3">2 vacant · 1 in maintenance</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Monthly rent roll</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ money(rows.reduce((total, row) => total + row.rentRoll, 0), 0) }}</p>
        <p class="text-[11px] text-ink-3">Contracted rent, before fees</p>
      </div>
    </div>

    <DataTable :columns="columns" :rows="rows" min-width="960px" empty="No properties yet.">
      <template #cell-name="{ row }">
        <RouterLink :to="`/d/properties/${row.id}`" class="group inline-flex items-center gap-2.5">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-navy-100 bg-navy-50 font-mono text-[10px] font-semibold text-navy-800">
            {{ row.ref.replace('P-', '') }}
          </span>
          <span>
            <b class="block text-[12.5px] font-semibold text-ink group-hover:text-navy-800">{{ row.name }}</b>
            <span class="block text-[10.5px] text-ink-3">{{ row.area }} · built {{ row.built }}</span>
          </span>
        </RouterLink>
      </template>
      <template #cell-kind="{ row }">
        <span class="text-[12px] text-ink-2">{{ row.kind }}</span>
      </template>
      <template #cell-occupancy="{ row }">
        <span class="font-mono text-[12px] font-medium">{{ row.occupied }}/{{ row.unitsCount }}</span>
        <span class="ml-1 text-[10px] text-ink-3">({{ row.pct }}%)</span>
      </template>
      <template #cell-rent="{ row }">
        <span class="font-mono text-[12px] font-medium">{{ money(row.rentRoll, 0) }}</span>
      </template>
      <template #cell-requests="{ row }">
        <Chip v-if="row.openRequests" :tone="row.openRequests > 2 ? 'warn' : 'neutral'">{{ row.openRequests }}</Chip>
        <span v-else class="text-[11px] text-ink-3">0</span>
      </template>
      <template #cell-manager="{ row }">
        <span class="text-[12px] text-ink-2">{{ row.manager }}</span>
      </template>
      <template #cell-open="{ row }">
        <RouterLink :to="`/d/properties/${row.id}`" class="inline-flex items-center gap-1 text-[11px] font-semibold text-navy-600 hover:underline">
          Open <Icon name="chevron" :size="12" />
        </RouterLink>
      </template>
    </DataTable>

    <p class="mt-3 text-[11px] text-ink-3">Occupancy counts a unit with notice given as still let until the tenancy ends.</p>
  </div>
</template>
