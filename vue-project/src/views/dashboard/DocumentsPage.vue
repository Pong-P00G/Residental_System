<script setup>
import { computed, ref } from 'vue'
import { documents, leaseById, propertyById, unitById } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import DataTable from '@/components/DataTable.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
const scope = ref('All')
const scopes = ['All', 'Portfolio', 'Property', 'Unit', 'Lease']

const columns = [
  { key: 'name', label: 'Document' },
  { key: 'scope', label: 'Scope' },
  { key: 'target', label: 'Attached to' },
  { key: 'updated', label: 'Updated' },
  { key: 'size', label: 'Size', align: 'right' },
  { key: 'status', label: 'Status' },
  { key: 'open', label: '', align: 'right' },
]

const targetLabel = (document) => {
  if (document.scope === 'Property') return propertyById(document.target)?.name || document.target
  if (document.scope === 'Unit') {
    const unit = unitById(document.target)
    return unit ? `${unit.name}, ${propertyById(unit.propertyId).name}` : document.target
  }
  if (document.scope === 'Lease') return `Lease ${document.target}`
  return 'Whole portfolio'
}

const rows = computed(() =>
  documents
    .filter((document) => scope.value === 'All' || document.scope === scope.value)
    .map((document) => ({ ...document, targetLabel: targetLabel(document) })),
)

const statusTone = (status) => ({ Current: 'ok', Expiring: 'warn', 'Action needed': 'crit', Draft: 'neutral' })[status] || 'neutral'
const expiring = computed(() => documents.filter((document) => ['Expiring', 'Action needed'].includes(document.status)).length)
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Governance"
      title="Documents"
      description="Certificates, agreements and surveys attached to the record they belong to — never to an inbox."
    >
      <template #actions>
        <Btn variant="ghost" size="sm" @click="store.toast('Document search opened')">
          <Icon name="search" :size="15" />
          Search
        </Btn>
        <Btn size="sm" @click="store.toast('Upload dialog opened')">
          <Icon name="plus" :size="15" />
          Upload
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Documents</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ documents.length }}</p>
        <p class="text-[11px] text-ink-3">Across the portfolio</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Needs attention</p>
        <p class="mt-1 font-mono text-2xl font-semibold text-attention">{{ expiring }}</p>
        <p class="text-[11px] text-ink-3">Expiring or action needed</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Retention</p>
        <p class="mt-1 font-mono text-2xl font-semibold">6 yrs</p>
        <p class="text-[11px] text-ink-3">Compliance certificates kept</p>
      </div>
    </div>

    <div class="mb-3 flex flex-wrap items-center gap-2">
      <button
        v-for="option in scopes"
        :key="option"
        type="button"
        class="rounded-chip border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.07em] transition"
        :class="scope === option ? 'border-navy-800 bg-navy-800 text-white' : 'border-fyi-bd bg-fyi-bg text-fyi hover:border-navy-300'"
        @click="scope = option"
      >
        {{ option }}
      </button>
      <span class="ml-auto font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ rows.length }} shown</span>
    </div>

    <DataTable :columns="columns" :rows="rows" min-width="980px" empty="No documents in this scope.">
      <template #cell-name="{ row }">
        <div class="flex items-center gap-2.5">
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-rule-2 bg-alt text-ink-2"><Icon name="file" :size="15" /></span>
          <b class="text-[12px] font-semibold text-ink">{{ row.name }}</b>
        </div>
      </template>
      <template #cell-scope="{ row }"><Chip tone="neutral">{{ row.scope }}</Chip></template>
      <template #cell-target="{ row }">
        <span class="text-[11.5px] text-ink-2">{{ row.targetLabel }}</span>
      </template>
      <template #cell-updated="{ row }"><span class="text-[11.5px]">{{ row.updated }}</span></template>
      <template #cell-status="{ row }"><Chip :tone="statusTone(row.status)">{{ row.status }}</Chip></template>
      <template #cell-open="{ row }">
        <button
          type="button"
          class="inline-flex h-8 items-center gap-1.5 rounded-btn border border-rule-2 px-2.5 text-[11px] font-semibold text-ink-2 transition hover:bg-navy-50 hover:text-ink"
          @click="store.toast(`${row.name} downloaded`)"
        >
          <Icon name="download" :size="13" /> Download
        </button>
      </template>
    </DataTable>

    <div class="mt-5 flex items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
      <Icon name="shield" :size="15" class="mt-0.5 shrink-0 text-settled" />
      <p>
        <b class="font-semibold text-ink">Retention is automatic.</b> Certificates stay attached to the property or lease after a tenancy ends, so the compliance history survives the resident.
      </p>
    </div>
  </div>
</template>
