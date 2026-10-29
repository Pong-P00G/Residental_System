<script setup>
import { computed, ref } from 'vue'
import { leaseOfResident, money, residents, unitById } from '@/data/app'
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
const statuses = ['All', 'Current', 'Notice given', 'Arrears']

const residentTone = (value) => ({ Current: 'ok', 'Notice given': 'warn', Arrears: 'crit' })[value] || 'neutral'

const columns = [
  { key: 'name', label: 'Resident' },
  { key: 'unit', label: 'Unit' },
  { key: 'since', label: 'Tenant since' },
  { key: 'onTime', label: 'On time', align: 'right' },
  { key: 'balance', label: 'Balance', align: 'right' },
  { key: 'lease', label: 'Lease ends' },
  { key: 'status', label: 'Status' },
  { key: 'open', label: '', align: 'right' },
]

const rows = computed(() => {
  const term = query.value.trim().toLowerCase()
  return residents
    .filter((resident) => {
      if (status.value !== 'All' && resident.status !== status.value) return false
      if (!term) return true
      const unit = unitById(resident.unitId)
      return [resident.name, resident.email, resident.phone, unit?.name || '', unit?.label || '']
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
    .map((resident) => {
      const unit = unitById(resident.unitId)
      const lease = leaseOfResident(resident.id)
      return {
        ...resident,
        unitLabel: unit ? unit.label : '—',
        unitName: unit ? unit.name : '—',
        leaseEnd: lease ? lease.end : '—',
        leaseId: lease ? lease.id : '—',
      }
    })
})

const arrearsTotal = computed(() => residents.filter((resident) => resident.balance > 0).reduce((total, resident) => total + resident.balance, 0))
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Portfolio"
      title="Residents"
      :description="`${residents.length} residents · ${money(arrearsTotal, 0)} outstanding across ${residents.filter((resident) => resident.balance > 0).length} accounts.`"
    >
      <template #actions>
        <Btn size="sm" @click="store.toast('Invite resident form opened')">
          <Icon name="plus" :size="15" />
          Invite resident
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 flex flex-col gap-3 rounded-card border border-rule bg-surface p-4 shadow-e1 lg:flex-row lg:items-center">
      <div class="lg:w-80">
        <Field v-model="query" search placeholder="Name, email or unit" />
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

    <DataTable :columns="columns" :rows="rows" min-width="960px" empty="No residents match these filters.">
      <template #cell-name="{ row }">
        <RouterLink :to="`/d/residents/${row.id}`" class="group inline-flex items-center gap-2.5">
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-100 font-mono text-[10px] font-semibold text-navy-800">{{ row.initials }}</span>
          <span>
            <b class="block text-[12.5px] font-semibold text-ink group-hover:text-navy-800">{{ row.name }}</b>
            <span class="block text-[10.5px] text-ink-3">{{ row.email }}</span>
          </span>
        </RouterLink>
      </template>
      <template #cell-unit="{ row }">
        <RouterLink :to="`/d/units/${row.unitId}`" class="text-[11.5px] font-medium text-ink-2 hover:text-navy-800">{{ row.unitName }}</RouterLink>
        <span class="block text-[10px] text-ink-3">{{ row.unitLabel }}</span>
      </template>
      <template #cell-onTime="{ row }">
        <span class="font-mono text-[12px] font-medium">{{ row.onTime }}</span>
        <span v-if="row.latePayments" class="block text-[9.5px] text-signal">{{ row.latePayments }} late</span>
      </template>
      <template #cell-balance="{ row }">
        <span class="font-mono text-[12px] font-semibold" :class="row.balance ? 'text-signal' : 'text-settled'">
          {{ row.balance ? money(row.balance, 0) : 'Clear' }}
        </span>
      </template>
      <template #cell-lease="{ row }">
        <RouterLink :to="`/d/leases/${row.leaseId}`" class="font-mono text-[11px] text-ink-2 hover:text-navy-800">{{ row.leaseEnd }}</RouterLink>
      </template>
      <template #cell-status="{ row }">
        <Chip :tone="residentTone(row.status)">{{ row.status }}</Chip>
      </template>
      <template #cell-open="{ row }">
        <RouterLink :to="`/d/residents/${row.id}`" class="text-[11px] font-semibold text-navy-600 hover:underline">Open</RouterLink>
      </template>
    </DataTable>

    <div class="mt-5 flex flex-wrap items-start gap-3">
      <div class="flex flex-1 items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
        <Icon name="info" :size="15" class="mt-0.5 shrink-0 text-progress" />
        <p><b class="font-semibold text-ink">Arrears is not a status you set.</b> It is calculated from the ledger — clearing the balance clears the flag.</p>
      </div>
      <div class="flex flex-1 items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
        <Icon name="shield" :size="15" class="mt-0.5 shrink-0 text-settled" />
        <p><b class="font-semibold text-ink">Resident records are need-to-know.</b> Contact details are hidden from vendors and other residents.</p>
      </div>
    </div>
  </div>
</template>
