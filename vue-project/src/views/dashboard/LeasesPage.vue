<script setup>
import { computed, ref } from 'vue'
import { leaseStatusTone, leases, money, propertyById, residentById, unitById } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import DataTable from '@/components/DataTable.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
const { loading } = usePageLoading()
const filter = ref('All')
const filters = ['All', 'Active', 'Expiring', 'Pending signature', 'In arrears']

const columns = [
  { key: 'id', label: 'Lease' },
  { key: 'unit', label: 'Unit' },
  { key: 'resident', label: 'Resident' },
  { key: 'term', label: 'Term' },
  { key: 'rent', label: 'Rent', align: 'right' },
  { key: 'end', label: 'Ends' },
  { key: 'status', label: 'Status' },
  { key: 'renewal', label: 'Renewal' },
  { key: 'open', label: '', align: 'right' },
]

const rows = computed(() =>
  leases
    .filter((lease) => filter.value === 'All' || lease.status === filter.value)
    .map((lease) => {
      const unit = unitById(lease.unitId)
      const property = propertyById(unit.propertyId)
      return {
        ...lease,
        unitLabel: unit.name,
        propertyName: property.name,
        residentName: residentById(lease.residentId)?.name || lease.tenantName || '—',
        termLabel: lease.term,
        endLabel: lease.end,
      }
    }),
)

const activeCount = computed(() => leases.filter((lease) => lease.status === 'Active').length)
const expiringCount = computed(() => leases.filter((lease) => lease.status === 'Expiring').length)
const pendingCount = computed(() => leases.filter((lease) => lease.status === 'Pending signature').length)
const contractValue = computed(() => leases.filter((lease) => lease.status !== 'Pending signature').reduce((total, lease) => total + lease.rent, 0))
</script>

<template>
  <PageSkeleton v-if="loading" variant="table" :rows="6" />
  <div v-else>
    <PageHeader
      eyebrow="Portfolio"
      title="Leases"
      :description="`${leases.length} leases · ${activeCount} active · ${expiringCount} expiring within 90 days · ${pendingCount} awaiting signature.`"
    >
      <template #actions>
        <Btn size="sm" @click="store.toast('New lease form opened')">
          <Icon name="plus" :size="15" />
          New lease
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Active</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ activeCount }}</p>
        <p class="text-[11px] text-ink-3">Signed and running</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Expiring</p>
        <p class="mt-1 font-mono text-2xl font-semibold text-attention">{{ expiringCount }}</p>
        <p class="text-[11px] text-ink-3">Apartment 6D · notice given</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Pending signature</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ pendingCount }}</p>
        <p class="text-[11px] text-ink-3">House 9 Elm Row</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Contracted rent</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ money(contractValue, 0) }}</p>
        <p class="text-[11px] text-ink-3">Monthly, signed leases</p>
      </div>
    </div>

    <FilterBar variant="plain">
      <button
        v-for="option in filters"
        :key="option"
        type="button"
        class="rounded-chip border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.07em] transition"
        :class="filter === option ? 'border-navy-800 bg-navy-800 text-white' : 'border-fyi-bd bg-fyi-bg text-fyi hover:border-navy-300'"
        @click="filter = option"
      >
        {{ option }}
      </button>
      <span class="ml-auto font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ rows.length }} shown</span>
      <template #action>
        <Btn size="sm" block @click="store.toast('New lease form opened')">
          <Icon name="plus" :size="15" />
          New lease
        </Btn>
      </template>
    </FilterBar>

    <DataTable :columns="columns" :rows="rows" min-width="1040px" empty="No leases match this filter.">
      <template #cell-id="{ row }">
        <RouterLink :to="`/d/leases/${row.id}`" class="font-mono text-[11.5px] font-semibold text-navy-600 hover:underline">{{ row.id }}</RouterLink>
      </template>
      <template #cell-unit="{ row }">
        <span class="block text-[12px] font-medium">{{ row.unitLabel }}</span>
        <span class="block text-[10px] text-ink-3">{{ row.propertyName }}</span>
      </template>
      <template #cell-resident="{ row }">
        <RouterLink v-if="row.residentId" :to="`/d/residents/${row.residentId}`" class="text-[12px] font-medium text-ink-2 hover:text-navy-800">{{ row.residentName }}</RouterLink>
        <span v-else class="text-[12px] text-ink-2">{{ row.residentName }}</span>
      </template>
      <template #cell-term="{ row }">
        <span class="text-[11.5px]">{{ row.start }} – {{ row.end }}</span>
        <span class="block text-[10px] text-ink-3">{{ row.term }}</span>
      </template>
      <template #cell-rent="{ row }">
        <span class="font-mono text-[12px] font-medium">{{ money(row.rent, 0) }}</span>
      </template>
      <template #cell-status="{ row }">
        <Chip :tone="leaseStatusTone(row.status)">{{ row.status }}</Chip>
      </template>
      <template #cell-renewal="{ row }">
        <span class="text-[11px] text-ink-2">{{ row.renewal }}</span>
      </template>
      <template #cell-open="{ row }">
        <RouterLink :to="`/d/leases/${row.id}`" class="text-[11px] font-semibold text-navy-600 hover:underline">Open</RouterLink>
      </template>
    </DataTable>

    <p class="mt-3 text-[11px] text-ink-3">Nothing renews automatically. A lease moves to Expiring 90 days before its end date so renewal terms can be issued in time.</p>
  </div>
</template>
