<script setup>
import { computed } from 'vue'
import { money, paymentStatusTone, resident } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import DataTable from '@/components/DataTable.vue'
import Icon from '@/components/Icon.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const store = useAppStore()
const { loading } = usePageLoading()

const columns = [
  { key: 'reference', label: 'Reference' },
  { key: 'date', label: 'Paid' },
  { key: 'period', label: 'Statement' },
  { key: 'amount', label: 'Amount', align: 'right' },
  { key: 'method', label: 'Method' },
  { key: 'status', label: 'Status' },
  { key: 'receipt', label: '', align: 'right' },
]

const history = computed(() => store.myPayments)
const lateCharge = computed(() => store.statement.lines.find((line) => line.label === 'Late notice charge'))
</script>

<template>
  <PageSkeleton v-if="loading" variant="table" :rows="5" />
  <div v-else>
    <PageHeader
      eyebrow="Your tenancy"
      title="My payments"
      description="Your balance, the breakdown behind it, and every receipt you have ever been issued."
    >
      <template #actions>
        <Btn v-if="!store.paidOff" to="/pay" size="sm">Pay {{ money(store.balance) }}</Btn>
        <Chip v-else tone="ok">Balance clear</Chip>
      </template>
    </PageHeader>

    <div class="grid gap-5 lg:grid-cols-3">
      <section class="rounded-card border border-l-[3px] border-rule border-l-navy-800 bg-surface p-5 shadow-e1 lg:col-span-2">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <Chip tone="neutral">{{ store.statement.dueLabel }}</Chip>
          <Chip v-if="store.paidOff" tone="ok">Paid in full</Chip>
          <Chip v-else tone="warn">Auto-pay off</Chip>
        </div>
        <p class="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
          {{ store.paidOff ? 'Open balance' : 'Amount due' }}
        </p>
        <p class="mt-1 font-mono text-[42px] font-semibold leading-none tracking-[-0.04em]">{{ money(store.balance) }}</p>
        <p v-if="!store.paidOff && lateCharge" class="mt-2 text-[13px] text-ink-2">
          Includes a <b class="font-semibold text-ink">{{ money(lateCharge.amount) }} late notice charge</b> from October.
        </p>
        <p v-else class="mt-2 text-[13px] text-ink-2">The statement is settled. Receipts are saved below and in your documents.</p>

        <div class="mt-5 flex flex-wrap gap-2">
          <Btn v-if="!store.paidOff" to="/pay">Pay {{ money(store.balance) }}</Btn>
          <Btn v-else to="/my-payments" variant="ghost">View receipts</Btn>
          <Btn to="/support" variant="ghost">Something looks wrong</Btn>
        </div>

        <dl class="mt-5 grid grid-cols-2 gap-x-6 gap-y-1.5 border-t border-dashed border-rule pt-3 text-[12px] sm:grid-cols-4">
          <div v-for="line in store.statement.lines" :key="line.label" class="flex items-baseline justify-between gap-2 sm:flex-col sm:items-start">
            <dt class="truncate text-ink-3">{{ line.label }}</dt>
            <dd class="shrink-0 font-mono font-medium">{{ money(line.amount) }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
        <div class="flex items-center justify-between gap-2">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">On-time payments</p>
          <Chip tone="ok">{{ resident.onTime }} in a row</Chip>
        </div>
        <div class="mt-4 flex gap-1">
          <span v-for="n in 12" :key="n" class="h-2 flex-1 rounded-sm" :class="n <= resident.onTime ? 'bg-settled' : 'bg-fyi-bg'"></span>
        </div>
        <p class="mt-4 text-[12.5px] leading-relaxed text-ink-2">
          Eleven months paid on time. One late notice in October — the charge is itemised on this statement.
        </p>
        <div class="mt-4 space-y-2 border-t border-dashed border-rule pt-3 text-[12.5px]">
          <div class="flex items-center justify-between gap-2">
            <span class="text-ink-3">Next due</span>
            <span class="font-mono font-medium">{{ store.statement.dueDate }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-ink-3">Payment reference</span>
            <span class="font-mono font-medium">{{ store.statement.reference }}</span>
          </div>
        </div>
        <Btn to="/support" variant="ghost" size="sm" block class="mt-4">Set up a payment plan</Btn>
      </section>
    </div>

    <section class="mt-6">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Payment history</h2>
        <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">{{ history.length }} payments</span>
      </div>

      <DataTable :columns="columns" :rows="history" empty="No payments on this tenancy yet.">
        <template #cell-reference="{ row }">
          <span class="font-mono font-medium text-ink">{{ row.reference }}</span>
        </template>
        <template #cell-amount="{ row }">
          <span class="font-mono font-semibold text-ink">{{ money(row.amount) }}</span>
        </template>
        <template #cell-status="{ row }">
          <Chip :tone="paymentStatusTone(row.status)">{{ row.status }}</Chip>
        </template>
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
    </section>

    <div class="mt-5 flex flex-wrap gap-3">
      <div class="flex flex-1 items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
        <Icon name="shield" :size="16" class="mt-0.5 shrink-0 text-settled" />
        <p><b class="font-semibold text-ink">Rent is protected.</b> Payments go straight to the tenancy account and the deposit is held in a government-approved scheme.</p>
      </div>
      <div class="flex flex-1 items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
        <Icon name="info" :size="16" class="mt-0.5 shrink-0 text-progress" />
        <p><b class="font-semibold text-ink">Need the full statement?</b> Every line, the late-charge explanation and the payment reference are on this page — no PDF hunting.</p>
      </div>
    </div>
  </div>
</template>
