<script setup>
import { computed, ref } from 'vue'
import { requestResidentName, requestStatusTone, unitShort, vendorById } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import Chip from '@/components/Chip.vue'
import SlaBar from '@/components/SlaBar.vue'
import Icon from '@/components/Icon.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const store = useAppStore()
const { loading } = usePageLoading()
const filter = ref('All')
const filters = ['All', 'Needs action', 'Triaged', 'In progress', 'Scheduled', 'Resolved', 'Past SLA']

const stages = [
  { id: 'Needs action', dot: 'bg-signal' },
  { id: 'Triaged', dot: 'bg-attention' },
  { id: 'In progress', dot: 'bg-progress' },
  { id: 'Scheduled', dot: 'bg-navy-300' },
  { id: 'Resolved', dot: 'bg-settled' },
]

const queue = computed(() => store.requestList)

const rows = computed(() => {
  if (filter.value === 'All') return queue.value
  if (filter.value === 'Past SLA') return queue.value.filter((request) => request.sla >= 85 && !['Resolved', 'Closed'].includes(request.status))
  return queue.value.filter((request) => request.status === filter.value)
})

const visibleStages = computed(() =>
  filter.value === 'All' || filter.value === 'Past SLA' ? stages : stages.filter((stage) => stage.id === filter.value),
)

const pastSla = computed(() => queue.value.filter((request) => request.sla >= 85 && !['Resolved', 'Closed'].includes(request.status)).length)
const unassigned = computed(() => queue.value.filter((request) => !request.vendorId && !['Resolved', 'Closed'].includes(request.status)).length)
const openCount = computed(() => queue.value.filter((request) => !['Resolved', 'Closed'].includes(request.status)).length)

const countFor = (option) => {
  if (option === 'All') return queue.value.length
  if (option === 'Past SLA') return pastSla.value
  return queue.value.filter((request) => request.status === option).length
}

const inColumn = (status) => rows.value.filter((request) => request.status === status)
</script>

<template>
  <PageSkeleton v-if="loading" variant="board" />
  <div v-else>
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

    <!-- board summary -->
    <div class="mb-5 grid gap-3 sm:grid-cols-4">
      <div class="rounded-card border border-rule bg-surface px-4 py-3 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Open</p>
        <p class="mt-0.5 font-mono text-xl font-semibold">{{ openCount }}</p>
      </div>
      <div class="rounded-card border border-t-[3px] border-rule border-t-signal bg-surface px-4 py-3 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Past SLA</p>
        <p class="mt-0.5 font-mono text-xl font-semibold text-signal">{{ pastSla }}</p>
      </div>
      <div class="rounded-card border border-rule bg-surface px-4 py-3 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Unassigned</p>
        <p class="mt-0.5 font-mono text-xl font-semibold">{{ unassigned }}</p>
      </div>
      <div class="rounded-card border border-rule bg-surface px-4 py-3 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Resolved</p>
        <p class="mt-0.5 font-mono text-xl font-semibold">{{ countFor('Resolved') }}</p>
      </div>
    </div>

    <FilterBar variant="plain">
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
      <template #action>
        <a
          href="mailto:hello@halden.example"
          class="inline-flex h-9 w-full items-center justify-center gap-2 rounded-btn border border-rule-2 bg-surface px-3.5 text-xs font-semibold text-ink transition hover:bg-navy-50"
        >
          <Icon name="message" :size="14" /> Message a resident
        </a>
      </template>
    </FilterBar>

    <!-- kanban board -->
    <div class="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
      <div class="flex min-h-[420px] w-max gap-3">
        <section
          v-for="stage in visibleStages"
          :key="stage.id"
          class="w-[272px] shrink-0 rounded-card border border-rule bg-alt/70 p-2.5"
        >
          <header class="flex items-center justify-between gap-2 px-1 pb-2.5">
            <span class="flex items-center gap-2">
              <span class="h-2 w-2 rounded-full" :class="stage.dot" aria-hidden="true" />
              <b class="text-[12px] font-semibold">{{ stage.id }}</b>
            </span>
            <span class="font-mono text-[10px] text-ink-3">{{ inColumn(stage.id).length }}</span>
          </header>

          <div class="flex flex-col gap-2">
            <RouterLink
              v-for="request in inColumn(stage.id)"
              :key="request.id"
              :to="`/d/requests/${request.id}`"
              class="group block rounded-btn border border-rule bg-surface p-3 shadow-e1 transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-e2"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-3">{{ request.id }}</span>
                <Chip v-if="request.priority === 'Safety'" tone="crit">Safety</Chip>
                <Chip v-else-if="request.sla >= 85 && !['Resolved', 'Closed'].includes(request.status)" tone="warn">SLA</Chip>
              </div>
              <b class="mt-1 block text-[12.5px] font-semibold leading-snug">{{ request.title }}</b>
              <p class="mt-1 text-[11px] text-ink-2">{{ unitShort(request.unitId) }} · {{ requestResidentName(request) }}</p>
              <p class="mt-1 text-[10.5px] text-ink-3">{{ vendorById(request.vendorId)?.name || 'No vendor yet' }}</p>
              <SlaBar v-if="!['Resolved', 'Closed'].includes(request.status)" class="mt-2.5" :value="request.sla" />
              <div class="mt-2 flex items-center justify-between gap-2 border-t border-dashed border-rule pt-2">
                <span class="font-mono text-[9.5px] text-ink-3">{{ request.target }}</span>
                <Chip :tone="requestStatusTone(request.status)">{{ request.status }}</Chip>
              </div>
            </RouterLink>

            <p
              v-if="!inColumn(stage.id).length"
              class="rounded-btn border border-dashed border-rule-2 px-3 py-6 text-center text-[11px] text-ink-3"
            >
              Nothing at this stage
            </p>
          </div>
        </section>
      </div>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-2">
      <div class="flex items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
        <Icon name="clock" :size="15" class="mt-0.5 shrink-0 text-progress" />
        <p><b class="font-semibold text-ink">Sorting is by urgency.</b> A safety request with six hours left outranks a routine job from yesterday, whichever column it sits in.</p>
      </div>
      <div class="flex items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
        <Icon name="wrench" :size="15" class="mt-0.5 shrink-0 text-settled" />
        <p><b class="font-semibold text-ink">Drag-free workflow.</b> Open a card to triage, assign a vendor or resolve it — the board reflects the status on the record.</p>
      </div>
    </div>
  </div>
</template>
