<script setup>
import { computed, ref } from 'vue'
import { money, propertyById, residentById, unitStatusTone, units } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Field from '@/components/Field.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import DataTable from '@/components/DataTable.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
const query = ref('')
const status = ref('All')
const statuses = ['All', 'Occupied', 'Vacant', 'Notice', 'Maintenance']

const columns = [
  { key: 'unit', label: 'Unit' },
  { key: 'property', label: 'Property' },
  { key: 'layout', label: 'Layout' },
  { key: 'tenant', label: 'Resident' },
  { key: 'rent', label: 'Rent', align: 'right' },
  { key: 'status', label: 'Status' },
  { key: 'lease', label: 'Lease' },
  { key: 'open', label: '', align: 'right' },
]

const rows = computed(() => {
  const term = query.value.trim().toLowerCase()
  return units
    .filter((unit) => {
      if (status.value !== 'All' && unit.status !== status.value) return false
      if (!term) return true
      const tenant = residentById(unit.residentId)?.name || ''
      return [unit.name, unit.label, propertyById(unit.propertyId).name, unit.kind, tenant]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
    .map((unit) => ({
      ...unit,
      property: propertyById(unit.propertyId).name,
      tenant: residentById(unit.residentId)?.name || '—',
      lease: unit.leaseId || '—',
    }))
})

const counts = computed(() => ({
  occupied: units.filter((unit) => unit.status === 'Occupied').length,
  vacant: units.filter((unit) => unit.status === 'Vacant').length,
  notice: units.filter((unit) => unit.status === 'Notice').length,
  maintenance: units.filter((unit) => unit.status === 'Maintenance').length,
}))
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Portfolio"
      title="Units"
      :description="`${units.length} units · ${counts.occupied} let · ${counts.vacant} vacant · ${counts.maintenance} in maintenance.`"
    >
      <template #actions>
        <Btn size="sm" @click="store.toast('Add unit form opened')">
          <Icon name="plus" :size="15" />
          Add unit
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 flex flex-col gap-3 rounded-card border border-rule bg-surface p-4 shadow-e1 lg:flex-row lg:items-center">
      <div class="lg:w-80">
        <Field v-model="query" search placeholder="Unit, property, resident" />
      </div>
      <div class="flex flex-1 flex-wrap gap-1.5">
        <button
          v-for="option in statuses"
          :key="option"
          type="button"
          class="h-7 rounded-chip border px-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] transition"
          :class="status === option ? 'border-navy-800 bg-navy-800 text-white' : 'border-fyi-bd bg-fyi-bg text-fyi hover:border-navy-300'"
          @click="status = option"
        >
          {{ option }}
        </button>
      </div>
      <span class="font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ rows.length }} shown</span>
    </div>

    <DataTable :columns="columns" :rows="rows" min-width="960px" empty="No units match these filters.">
      <template #cell-unit="{ row }">
        <RouterLink :to="`/d/units/${row.id}`" class="group inline-flex items-center gap-2">
          <span class="grid h-7 w-7 place-items-center rounded-md border border-navy-100 bg-navy-50 font-mono text-[10px] font-semibold text-navy-800">
            {{ row.label }}
          </span>
          <b class="text-[12px] font-semibold text-ink group-hover:text-navy-800">{{ row.name }}</b>
        </RouterLink>
      </template>
      <template #cell-property="{ row }">
        <span class="text-[12px]">{{ row.property }}</span>
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
      <template #cell-status="{ row }">
        <Chip :tone="unitStatusTone(row.status)">{{ row.status }}</Chip>
      </template>
      <template #cell-lease="{ row }">
        <span class="font-mono text-[11px] text-ink-2">{{ row.lease }}</span>
      </template>
      <template #cell-open="{ row }">
        <RouterLink :to="`/d/units/${row.id}`" class="text-[11px] font-semibold text-navy-600 hover:underline">Open</RouterLink>
      </template>
    </DataTable>

    <p class="mt-3 text-[11px] text-ink-3">Unit status is set by the tenancy record — ending a tenancy moves the unit to Vacant automatically.</p>
  </div>
</template>
