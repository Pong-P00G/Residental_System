<script setup>
import { computed, ref } from 'vue'
import { ledger, money } from '@/data/app'
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
const filters = ['All', ...new Set(ledger.map((entry) => entry.category))]

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'reference', label: 'Reference' },
  { key: 'category', label: 'Category' },
  { key: 'debit', label: 'Out', align: 'right' },
  { key: 'credit', label: 'In', align: 'right' },
  { key: 'balance', label: 'Balance', align: 'right' },
]

const withRunning = computed(() => {
  let balance = 0
  return [...ledger]
    .reverse()
    .map((entry) => {
      balance += entry.credit - entry.debit
      return { ...entry, running: balance }
    })
    .reverse()
})

const rows = computed(() => withRunning.value.filter((entry) => filter.value === 'All' || entry.category === filter.value))
const totalIn = computed(() => ledger.reduce((total, entry) => total + entry.credit, 0))
const totalOut = computed(() => ledger.reduce((total, entry) => total + entry.debit, 0))
</script>

<template>
  <PageSkeleton v-if="loading" variant="table" :rows="8" />
  <div v-else>
    <PageHeader
      eyebrow="Operations"
      title="Financial ledger"
      description="Every movement in one running account — rent in, costs out, deposits and service charges kept separate."
    >
      <template #actions>
        <Btn variant="ghost" size="sm" @click="store.toast('Ledger exported as CSV')">
          <Icon name="download" :size="15" />
          Export
        </Btn>
        <Btn size="sm" @click="store.toast('Reconciliation started')">
          <Icon name="scale" :size="15" />
          Reconcile
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Money in</p>
        <p class="mt-1 font-mono text-2xl font-semibold text-settled">{{ money(totalIn, 0) }}</p>
        <p class="text-[11px] text-ink-3">Rent, fees and late notices</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Money out</p>
        <p class="mt-1 font-mono text-2xl font-semibold text-signal">{{ money(totalOut, 0) }}</p>
        <p class="text-[11px] text-ink-3">Vendors, fees and grounds</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Net movement</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ money(totalIn - totalOut, 0) }}</p>
        <p class="text-[11px] text-ink-3">For the October–November period</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Entries</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ ledger.length }}</p>
        <p class="text-[11px] text-ink-3">All reconciled</p>
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
      <span class="ml-auto font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ rows.length }} entries</span>
      <template #action>
        <Btn size="sm" block @click="store.toast('Reconciliation started')">
          <Icon name="scale" :size="15" />
          Reconcile
        </Btn>
      </template>
    </FilterBar>

    <DataTable :columns="columns" :rows="rows" min-width="960px" empty="No ledger entries in this category.">
      <template #cell-date="{ row }"><span class="text-[11.5px]">{{ row.date }}</span></template>
      <template #cell-description="{ row }">
        <b class="block text-[12px] font-medium text-ink">{{ row.description }}</b>
        <span class="block text-[10px] text-ink-3">{{ row.id }}</span>
      </template>
      <template #cell-reference="{ row }"><span class="font-mono text-[11px]">{{ row.reference }}</span></template>
      <template #cell-category="{ row }"><Chip tone="neutral">{{ row.category }}</Chip></template>
      <template #cell-debit="{ row }">
        <span v-if="row.debit" class="font-mono text-[12px] font-medium text-signal">−{{ money(row.debit) }}</span>
        <span v-else class="text-[11px] text-ink-3">—</span>
      </template>
      <template #cell-credit="{ row }">
        <span v-if="row.credit" class="font-mono text-[12px] font-medium text-settled">+{{ money(row.credit) }}</span>
        <span v-else class="text-[11px] text-ink-3">—</span>
      </template>
      <template #cell-balance="{ row }">
        <span class="font-mono text-[12px] font-semibold">{{ money(row.running) }}</span>
      </template>
    </DataTable>

    <div class="mt-5 flex flex-wrap gap-3">
      <div class="flex flex-1 items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
        <Icon name="info" :size="15" class="mt-0.5 shrink-0 text-progress" />
        <p><b class="font-semibold text-ink">Balance is running, not closing.</b> The right-hand column accumulates from the oldest entry so every row can be checked on its own.</p>
      </div>
      <div class="flex flex-1 items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
        <Icon name="check" :size="15" class="mt-0.5 shrink-0 text-settled" />
        <p><b class="font-semibold text-ink">Deposits never mix with rent.</b> Deposit movements sit in their own category and are reported separately.</p>
      </div>
    </div>
  </div>
</template>
