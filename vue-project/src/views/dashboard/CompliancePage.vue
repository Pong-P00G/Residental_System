<script setup>
import { computed, ref } from 'vue'
import { compliance, complianceTone, documents, propertyById } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import SeverityRow from '@/components/SeverityRow.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
const filter = ref('All')
const filters = ['All', 'Overdue', 'Due', 'Scheduled', 'Blocked']

const rows = computed(() => compliance.filter((item) => filter.value === 'All' || item.status === filter.value))
const overdue = computed(() => compliance.filter((item) => item.status === 'Overdue'))
const dueSoon = computed(() => compliance.filter((item) => item.status === 'Due'))
const toneFor = (status) => (status === 'Overdue' || status === 'Blocked' ? 'crit' : status === 'Due' ? 'warn' : '')

const complianceDocs = computed(() => documents.filter((document) => ['Property', 'Portfolio'].includes(document.scope)))
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Governance"
      title="Compliance"
      description="Statutory dates, deposit rules and the notice windows that cannot be served early."
    >
      <template #actions>
        <Btn variant="ghost" size="sm" to="/d/documents">
          <Icon name="file" :size="15" />
          Certificates
        </Btn>
        <Btn size="sm" @click="store.toast('Compliance export started')">
          <Icon name="download" :size="15" />
          Export
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-card border border-t-[3px] border-rule border-t-signal bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Overdue</p>
        <p class="mt-1 font-mono text-2xl font-semibold text-signal">{{ overdue.length }}</p>
        <p class="text-[11px] text-ink-3">Gas certificate at Elm Row</p>
      </div>
      <div class="rounded-card border border-t-[3px] border-rule border-t-attention bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Due this month</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ dueSoon.length }}</p>
        <p class="text-[11px] text-ink-3">Deposit interest statement</p>
      </div>
      <div class="rounded-card border border-t-[3px] border-rule border-t-rule-2 bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Scheduled</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ compliance.filter((item) => item.status === 'Scheduled').length }}</p>
        <p class="text-[11px] text-ink-3">Booked with a named vendor</p>
      </div>
      <div class="rounded-card border border-t-[3px] border-rule border-t-signal bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Blocked</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ compliance.filter((item) => item.status === 'Blocked').length }}</p>
        <p class="text-[11px] text-ink-3">Statutory window not open</p>
      </div>
    </div>

    <div v-if="overdue.length" class="mb-5 flex flex-wrap items-start gap-3 rounded-card border border-signal-bd bg-signal-bg p-4">
      <Icon name="alert" :size="17" class="mt-0.5 shrink-0 text-signal" />
      <div class="min-w-0 flex-1">
        <b class="block text-[13px] font-semibold text-signal">{{ overdue[0].title }} — certificate expired</b>
        <p class="mt-0.5 text-[12px] leading-relaxed text-signal/85">{{ overdue[0].note }}</p>
      </div>
      <Btn size="sm" variant="danger" @click="store.toast('Access request sent to the Elm Row residents')">Chase access</Btn>
    </div>

    <div class="mb-3 flex flex-wrap items-center gap-2">
      <button
        v-for="option in filters"
        :key="option"
        type="button"
        class="rounded-chip border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.07em] transition"
        :class="
          filter === option
            ? option === 'Overdue' || option === 'Blocked'
              ? 'border-signal bg-signal text-white'
              : 'border-navy-800 bg-navy-800 text-white'
            : option === 'Overdue' || option === 'Blocked'
              ? 'border-signal-bd bg-signal-bg text-signal hover:border-signal'
              : 'border-fyi-bd bg-fyi-bg text-fyi hover:border-navy-300'
        "
        @click="filter = option"
      >
        {{ option }} · {{ option === 'All' ? compliance.length : compliance.filter((item) => item.status === option).length }}
      </button>
      <span class="ml-auto font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ rows.length }} shown</span>
    </div>

    <div class="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div class="flex flex-col gap-2.5">
        <SeverityRow
          v-for="item in rows"
          :key="item.id"
          :title="item.title"
          :meta="`${item.category} · due ${item.due} · ${item.dueIn} · owner ${item.owner}`"
          :tone="toneFor(item.status)"
          tall
          :chevron="false"
        >
          <p class="mt-1.5 text-[12px] leading-relaxed text-ink-2">{{ item.note }}</p>
          <p class="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">
            {{ item.propertyId ? propertyById(item.propertyId)?.name : 'Portfolio-wide' }}
          </p>
          <template #right>
            <div class="flex flex-col items-end gap-1.5">
              <Chip :tone="complianceTone(item.status)">{{ item.status }}</Chip>
              <button
                type="button"
                class="text-[10.5px] font-semibold text-navy-600 hover:underline"
                @click="store.toast(`${item.title} marked for follow-up`)"
              >
                Follow up
              </button>
            </div>
          </template>
        </SeverityRow>

        <div v-if="!rows.length" class="rounded-card border border-rule bg-surface p-6 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Nothing here</p>
          <p class="mt-1 text-[13px] text-ink-2">No obligations at this status.</p>
        </div>
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Next 90 days</p>
          <ul class="mt-3 space-y-2.5">
            <li v-for="item in compliance.filter((entry) => !['Overdue', 'Blocked'].includes(entry.status))" :key="item.id" class="flex items-baseline justify-between gap-2 border-b border-dashed border-rule pb-2 last:border-0">
              <span class="min-w-0 text-[11.5px] leading-snug text-ink-2">{{ item.title }}</span>
              <span class="shrink-0 font-mono text-[10px] font-semibold text-ink">{{ item.dueIn }}</span>
            </li>
          </ul>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-2">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Certificates on file</p>
            <Chip tone="neutral">{{ complianceDocs.length }}</Chip>
          </div>
          <ul class="mt-2 divide-y divide-rule">
            <li v-for="document in complianceDocs" :key="document.id" class="flex items-center gap-2 py-2.5">
              <Icon name="file" :size="14" class="shrink-0 text-ink-3" />
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[11px] font-medium">{{ document.name }}</b>
                <span class="block text-[9.5px] text-ink-3">{{ document.updated }}</span>
              </div>
              <Chip :tone="document.status === 'Expiring' ? 'warn' : 'ok'">{{ document.status }}</Chip>
            </li>
          </ul>
          <Btn to="/d/documents" variant="ghost" size="sm" block class="mt-2">Open documents</Btn>
        </section>

        <section class="rounded-card border border-rule bg-surface p-4 text-[11.5px] leading-relaxed text-ink-2 shadow-e1">
          <p class="font-semibold text-ink">Why the rent increase is blocked</p>
          <p class="mt-1">The statutory notice window for Apartment 2C opens on 15 November. Serving it earlier would invalidate the increase, so the system refuses to send it.</p>
        </section>
      </aside>
    </div>
  </div>
</template>
