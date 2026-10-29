<script setup>
import { computed, ref } from 'vue'
import { money, payments, paymentStatusTone, propertyById, residentById, unitById } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import DataTable from '@/components/DataTable.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
const filter = ref('All')
const filters = ['All', 'Cleared', 'Pending', 'Failed', 'Overdue']

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'reference', label: 'Reference' },
  { key: 'resident', label: 'Resident' },
  { key: 'unit', label: 'Unit' },
  { key: 'type', label: 'Type' },
  { key: 'amount', label: 'Amount', align: 'right' },
  { key: 'status', label: 'Status' },
  { key: 'receipt', label: '', align: 'right' },
]

const rows = computed(() =>
  payments
    .filter((payment) => filter.value === 'All' || payment.status === filter.value)
    .map((payment) => {
      const unit = unitById(payment.unitId)
      return {
        ...payment,
        residentName: residentById(payment.residentId)?.name || '—',
        unitLabel: unit ? `${unit.label} · ${propertyById(unit.propertyId).name}` : '—',
      }
    }),
)

const sumBy = (status) => payments.filter((payment) => payment.status === status).reduce((total, payment) => total + payment.amount, 0)
const collected = computed(() => sumBy('Cleared'))
const pending = computed(() => sumBy('Pending'))
const exception = computed(() => sumBy('Failed') + sumBy('Overdue'))
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Operations"
      title="Payments"
      :description="`${payments.length} transactions this period · ${money(collected, 0)} cleared · ${money(exception, 0)} needs chasing.`"
    >
      <template #actions>
        <Btn variant="ghost" size="sm" @click="store.toast('Payments exported as CSV')">
          <Icon name="download" :size="15" />
          Export
        </Btn>
        <Btn size="sm" @click="store.toast('Record payment form opened')">
          <Icon name="plus" :size="15" />
          Record payment
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-card border border-t-[3px] border-rule border-t-settled bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Cleared</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ money(collected, 0) }}</p>
        <p class="text-[11px] text-ink-3">{{ payments.filter((payment) => payment.status === 'Cleared').length }} payments</p>
      </div>
      <div class="rounded-card border border-t-[3px] border-rule border-t-attention bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Pending</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ money(pending, 0) }}</p>
        <p class="text-[11px] text-ink-3">{{ payments.filter((payment) => payment.status === 'Pending').length }} awaiting settlement</p>
      </div>
      <div class="rounded-card border border-t-[3px] border-rule border-t-signal bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Failed &amp; overdue</p>
        <p class="mt-1 font-mono text-2xl font-semibold text-signal">{{ money(exception, 0) }}</p>
        <p class="text-[11px] text-ink-3">{{ payments.filter((payment) => ['Failed', 'Overdue'].includes(payment.status)).length }} need follow-up</p>
      </div>
      <div class="rounded-card border border-t-[3px] border-rule border-t-rule-2 bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Transactions</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ payments.length }}</p>
        <p class="text-[11px] text-ink-3">November statements</p>
      </div>
    </div>

    <div class="mb-3 flex flex-wrap items-center gap-2">
      <button
        v-for="option in filters"
        :key="option"
        type="button"
        class="rounded-chip border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.07em] transition"
        :class="
          filter === option
            ? option === 'Failed' || option === 'Overdue'
              ? 'border-signal bg-signal text-white'
              : 'border-navy-800 bg-navy-800 text-white'
            : option === 'Failed' || option === 'Overdue'
              ? 'border-signal-bd bg-signal-bg text-signal hover:border-signal'
              : 'border-fyi-bd bg-fyi-bg text-fyi hover:border-navy-300'
        "
        @click="filter = option"
      >
        {{ option }}
      </button>
      <span class="ml-auto font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ rows.length }} shown</span>
    </div>

    <DataTable :columns="columns" :rows="rows" min-width="1000px" empty="No payments match this filter.">
      <template #cell-date="{ row }"><span class="text-[11.5px]">{{ row.date }}</span></template>
      <template #cell-reference="{ row }"><span class="font-mono text-[11px]">{{ row.reference }}</span></template>
      <template #cell-resident="{ row }">
        <RouterLink :to="`/d/residents/${row.residentId}`" class="text-[12px] font-medium text-ink-2 hover:text-navy-800">{{ row.residentName }}</RouterLink>
      </template>
      <template #cell-unit="{ row }"><span class="text-[11.5px] text-ink-2">{{ row.unitLabel }}</span></template>
      <template #cell-amount="{ row }">
        <span class="font-mono text-[12px] font-semibold" :class="{ 'text-signal': ['Failed', 'Overdue'].includes(row.status) }">{{ money(row.amount) }}</span>
      </template>
      <template #cell-status="{ row }"><Chip :tone="paymentStatusTone(row.status)">{{ row.status }}</Chip></template>
      <template #cell-receipt="{ row }">
        <button
          type="button"
          class="inline-flex h-8 items-center gap-1.5 rounded-btn border border-rule-2 px-2.5 text-[11px] font-semibold text-ink-2 transition hover:bg-navy-50 hover:text-ink"
          @click="store.toast(`Receipt ${row.reference} downloaded`)"
        >
          <Icon name="download" :size="13" /> Receipt
        </button>
      </template>
    </DataTable>

    <div class="mt-5 flex flex-wrap gap-3">
      <div class="flex flex-1 items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
        <Icon name="info" :size="15" class="mt-0.5 shrink-0 text-progress" />
        <p><b class="font-semibold text-ink">A failed payment is not arrears.</b> Retry the direct debit before a late notice is applied; the ledger records both events separately.</p>
      </div>
      <div class="flex flex-1 items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
        <Icon name="wallet" :size="15" class="mt-0.5 shrink-0 text-settled" />
        <p><b class="font-semibold text-ink">Every payment lands on a unit.</b> Unallocated money sits in a holding line until it is matched, never on a resident's balance.</p>
      </div>
    </div>
  </div>
</template>
