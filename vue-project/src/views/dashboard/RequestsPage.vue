<script setup>
import { computed, ref } from 'vue'
import { requestResidentName, requestStatusTone, unitShort, vendorById } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import SeverityRow from '@/components/SeverityRow.vue'
import SlaBar from '@/components/SlaBar.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
const filter = ref('All')
const filters = ['All', 'Needs action', 'Triaged', 'In progress', 'Scheduled', 'Resolved', 'Past SLA']

const queue = computed(() => store.requestList)

const rows = computed(() => {
  if (filter.value === 'All') return queue.value
  if (filter.value === 'Past SLA') return queue.value.filter((request) => request.sla >= 85 && !['Resolved', 'Closed'].includes(request.status))
  return queue.value.filter((request) => request.status === filter.value)
})

const pastSla = computed(() => queue.value.filter((request) => request.sla >= 85 && !['Resolved', 'Closed'].includes(request.status)).length)
const unassigned = computed(() => queue.value.filter((request) => !request.vendorId && !['Resolved', 'Closed'].includes(request.status)).length)

const countFor = (option) => {
  if (option === 'All') return queue.value.length
  if (option === 'Past SLA') return pastSla.value
  return queue.value.filter((request) => request.status === option).length
}
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Operations"
      title="Requests"
      :description="`${queue.length} requests in the works queue · ${pastSla} past SLA · ${unassigned} still unassigned.`"
    >
      <template #actions>
        <a href="mailto:hello@halden.example" class="inline-flex h-9 items-center gap-2 rounded-btn border border-rule-2 bg-surface px-3.5 text-xs font-semibold text-ink transition hover:bg-navy-50">
          <Icon name="message" :size="14" />
          Message a resident
        </a>
      </template>
    </PageHeader>

    <div class="mb-5 flex flex-wrap items-center gap-2">
      <button
        v-for="option in filters"
        :key="option"
        type="button"
        class="rounded-chip border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.07em] transition"
        :class="
          filter === option
            ? option === 'Past SLA'
              ? 'border-signal bg-signal text-white'
              : 'border-navy-800 bg-navy-800 text-white'
            : option === 'Past SLA'
              ? 'border-signal-bd bg-signal-bg text-signal hover:border-signal'
              : 'border-fyi-bd bg-fyi-bg text-fyi hover:border-navy-300'
        "
        @click="filter = option"
      >
        {{ option }} · {{ countFor(option) }}
      </button>
      <span class="ml-auto font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ rows.length }} shown</span>
    </div>

    <div class="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div class="flex flex-col gap-2.5">
        <SeverityRow
          v-for="request in rows"
          :key="request.id"
          :title="`${request.title} — ${request.unitId ? unitShort(request.unitId) : 'Building'}`"
          :meta="`${request.id} · ${requestResidentName(request)} · ${request.submitted} · ${request.priority}`"
          :tone="request.sla >= 85 && !['Resolved', 'Closed'].includes(request.status) ? 'crit' : request.status === 'Triaged' ? 'warn' : ''"
          :to="`/d/requests/${request.id}`"
          tall
        >
          <SlaBar v-if="!['Resolved', 'Closed'].includes(request.status)" class="mt-2.5" :value="request.sla" />
          <span v-else class="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-settled">
            <Icon name="check" :size="13" /> {{ request.target }}
          </span>
          <template #right>
            <div class="flex flex-col items-end gap-1.5">
              <Chip :tone="requestStatusTone(request.status)">{{ request.status }}</Chip>
              <span class="font-mono text-[9.5px] text-ink-3">{{ request.target }}</span>
            </div>
          </template>
        </SeverityRow>

        <div v-if="!rows.length" class="rounded-card border border-rule bg-surface p-6 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Queue clear</p>
          <p class="mt-1 text-[13px] text-ink-2">No requests at this stage. Everything is either resolved or waiting on a resident.</p>
        </div>
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Where the clock sits</p>
          <dl class="mt-3 space-y-2.5 text-[12.5px]">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-2">Open requests</dt>
              <dd class="font-mono font-semibold">{{ queue.filter((request) => !['Resolved', 'Closed'].includes(request.status)).length }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-2">Past SLA</dt>
              <dd class="font-mono font-semibold text-signal">{{ pastSla }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-2">Awaiting vendor</dt>
              <dd class="font-mono font-semibold">{{ unassigned }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-2">Resolved this month</dt>
              <dd class="font-mono font-semibold">{{ queue.filter((request) => request.status === 'Resolved').length }}</dd>
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-dashed border-rule pt-2.5">
              <dt class="text-ink-2">Safety category</dt>
              <dd><Chip tone="crit">{{ queue.filter((request) => request.priority === 'Safety').length }}</Chip></dd>
            </div>
          </dl>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Past SLA</p>
          <div v-if="rows.filter((request) => request.sla >= 85 && !['Resolved', 'Closed'].includes(request.status)).length" class="mt-2 divide-y divide-rule">
            <RouterLink
              v-for="request in queue.filter((item) => item.sla >= 85 && !['Resolved', 'Closed'].includes(item.status))"
              :key="request.id"
              :to="`/d/requests/${request.id}`"
              class="flex items-center gap-2 py-2.5"
            >
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[11.5px] font-medium">{{ request.title }}</b>
                <span class="block text-[10px] text-ink-3">{{ request.id }} · {{ request.sla }}% used</span>
              </div>
              <Icon name="chevron" :size="14" class="shrink-0 text-ink-3" />
            </RouterLink>
          </div>
          <p v-else class="mt-2 text-[12px] text-ink-3">Nothing past SLA. The queue is inside its promises.</p>
        </section>

        <p class="px-1 text-[11px] leading-relaxed text-ink-3">
          Sorting is by urgency, not recency: a safety request with six hours left outranks a routine job from yesterday.
        </p>
      </aside>
    </div>
  </div>
</template>
