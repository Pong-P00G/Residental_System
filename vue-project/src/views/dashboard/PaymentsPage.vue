<script setup>
import { computed, ref } from 'vue'
import { money, payments, paymentStatusTone, propertyById, residentById, unitById } from '@/data/app'
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

const totalValue = computed(() => payments.reduce((total, payment) => total + payment.amount, 0))
const buckets = computed(() =>
  [
    { label: 'Cleared', statuses: ['Cleared'], bar: 'bg-settled' },
    { label: 'Pending', statuses: ['Pending'], bar: 'bg-attention' },
    { label: 'Failed / overdue', statuses: ['Failed', 'Overdue'], bar: 'bg-signal' },
  ].map((bucket) => {
    const list = payments.filter((payment) => bucket.statuses.includes(payment.status))
    const value = list.reduce((total, payment) => total + payment.amount, 0)
    return {
      ...bucket,
      count: list.length,
      value,
      pct: totalValue.value ? Math.max(2, Math.round((value / totalValue.value) * 100)) : 0,
    }
  }),
)
const chased = computed(() => payments.filter((payment) => ['Failed', 'Overdue'].includes(payment.status)))
</script>

<template>
  <PageSkeleton v-if="loading" variant="table" :rows="6" />
  <div v-else>
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

    <!-- Z-pattern report band: wide summary, split detail, full-width transaction table -->
    <div class="mb-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Settlement mix</h2>
            <p class="mt-1 text-[12px] text-ink-2">{{ payments.length }} transactions in the November statement.</p>
          </div>
          <Chip tone="ok">{{ money(collected, 0) }} cleared</Chip>
        </div>
        <div class="mt-4 space-y-3">
          <div v-for="bucket in buckets" :key="bucket.label">
            <div class="flex items-baseline justify-between gap-3 text-[11.5px]">
              <span class="text-ink-2">
                {{ bucket.label }}
                <span class="font-mono text-[10px] text-ink-3">· {{ bucket.count }}</span>
              </span>
              <span class="font-mono font-semibold">{{ money(bucket.value, 0) }}</span>
            </div>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-fyi-bg">
              <span class="block h-full rounded-full" :class="bucket.bar" :style="{ width: bucket.pct + '%' }" />
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
        <div class="flex items-center justify-between gap-2">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Needs chasing</h2>
          <Chip :tone="chased.length ? 'crit' : 'ok'">{{ chased.length }}</Chip>
        </div>
        <ul v-if="chased.length" class="mt-2 divide-y divide-rule">
          <li v-for="payment in chased" :key="payment.reference" class="flex items-center gap-2 py-2.5">
            <div class="min-w-0 flex-1">
              <b class="block truncate text-[11.5px] font-medium">{{ residentById(payment.residentId)?.name || '—' }}</b>
              <span class="block font-mono text-[10px] text-ink-3">{{ payment.reference }} · {{ payment.date }}</span>
            </div>
            <span class="font-mono text-[11.5px] font-semibold">{{ money(payment.amount) }}</span>
            <Chip :tone="paymentStatusTone(payment.status)">{{ payment.status }}</Chip>
          </li>
        </ul>
        <p v-else class="mt-2 text-[12px] text-ink-3">Nothing failed or overdue this period.</p>
        <Btn variant="ghost" size="sm" block class="mt-3" to="/d/ledger">Open the ledger</Btn>
      </section>
    </div>

    <FilterBar variant="plain">
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
      <template #action>
        <Btn size="sm" block @click="store.toast('Record payment form opened')">
          <Icon name="plus" :size="15" />
          Record payment
        </Btn>
      </template>
    </FilterBar>

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
