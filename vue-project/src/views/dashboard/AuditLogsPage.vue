<script setup>
import { computed, ref } from 'vue'
import { auditLogs } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Field from '@/components/Field.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import DataTable from '@/components/DataTable.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
const query = ref('')
const result = ref('All')
const results = ['All', 'Success', 'Blocked']

const columns = [
  { key: 'at', label: 'When' },
  { key: 'actor', label: 'Actor' },
  { key: 'action', label: 'Action' },
  { key: 'target', label: 'Target' },
  { key: 'ip', label: 'IP' },
  { key: 'result', label: 'Result' },
]

const rows = computed(() => {
  const term = query.value.trim().toLowerCase()
  return auditLogs
    .filter((entry) => result.value === 'All' || entry.result === result.value)
    .filter((entry) => !term || `${entry.actor} ${entry.action} ${entry.target} ${entry.ip}`.toLowerCase().includes(term))
})

const changes = computed(() => auditLogs.filter((entry) => entry.result === 'Success').length)
const blocked = computed(() => auditLogs.filter((entry) => entry.result === 'Blocked').length)
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Administration"
      title="Audit logs"
      description="Who did what, from where, and what the system refused. Append-only, Admin-only."
    >
      <template #actions>
        <Chip tone="progress">Admin only</Chip>
        <Btn variant="ghost" size="sm" @click="store.toast('Audit log exported as CSV')">
          <Icon name="download" :size="15" />
          Export
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Recorded events</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ auditLogs.length }}</p>
        <p class="text-[11px] text-ink-3">Last 4 days</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Successful changes</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ changes }}</p>
        <p class="text-[11px] text-ink-3">Applied to the record</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Blocked</p>
        <p class="mt-1 font-mono text-2xl font-semibold text-signal">{{ blocked }}</p>
        <p class="text-[11px] text-ink-3">Sign-in attempt from a new network</p>
      </div>
    </div>

    <div class="mb-3 flex flex-col gap-3 rounded-card border border-rule bg-surface p-4 shadow-e1 lg:flex-row lg:items-center">
      <div class="lg:w-80">
        <Field v-model="query" search placeholder="Actor, action, target or IP" />
      </div>
      <div class="flex flex-1 flex-wrap gap-1.5">
        <button
          v-for="option in results"
          :key="option"
          type="button"
          class="h-7 rounded-chip border px-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] transition"
          :class="
            result === option
              ? option === 'Blocked'
                ? 'border-signal bg-signal text-white'
                : 'border-navy-800 bg-navy-800 text-white'
              : option === 'Blocked'
                ? 'border-signal-bd bg-signal-bg text-signal hover:border-signal'
                : 'border-fyi-bd bg-fyi-bg text-fyi hover:border-navy-300'
          "
          @click="result = option"
        >
          {{ option }}
        </button>
      </div>
      <span class="font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ rows.length }} shown</span>
    </div>

    <DataTable :columns="columns" :rows="rows" min-width="900px" empty="No audit entries match this filter.">
      <template #cell-at="{ row }"><span class="whitespace-nowrap text-[11.5px]">{{ row.at }}</span></template>
      <template #cell-actor="{ row }"><span class="text-[12px] font-medium text-ink">{{ row.actor }}</span></template>
      <template #cell-action="{ row }"><span class="text-[11.5px]">{{ row.action }}</span></template>
      <template #cell-target="{ row }"><span class="text-[11.5px] text-ink-2">{{ row.target }}</span></template>
      <template #cell-ip="{ row }"><span class="font-mono text-[10.5px]">{{ row.ip }}</span></template>
      <template #cell-result="{ row }"><Chip :tone="row.result === 'Blocked' ? 'crit' : 'ok'">{{ row.result }}</Chip></template>
    </DataTable>

    <div class="mt-5 flex items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
      <Icon name="shield" :size="15" class="mt-0.5 shrink-0 text-settled" />
      <p>
        <b class="font-semibold text-ink">Logs cannot be edited.</b> Entries are retained for two years and include the actor, IP address and the before/after value for every financial change.
      </p>
    </div>
  </div>
</template>
