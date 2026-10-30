<script setup>
import { computed, ref } from 'vue'
import { requestStatusTone, unitShort } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import SeverityRow from '@/components/SeverityRow.vue'
import SlaBar from '@/components/SlaBar.vue'
import Icon from '@/components/Icon.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const store = useAppStore()
const { loading } = usePageLoading()
const filter = ref('All')
const filters = ['All', 'Open', 'Resolved']

const rows = computed(() => {
  const all = store.myRequests
  if (filter.value === 'Open') {
    return all.filter((request) => !['Resolved', 'Closed'].includes(request.status))
  }
  if (filter.value === 'Resolved') {
    return all.filter((request) => ['Resolved', 'Closed'].includes(request.status))
  }
  return all
})

const openCount = computed(() => store.myRequests.filter((request) => !['Resolved', 'Closed'].includes(request.status)).length)
const resolvedCount = computed(() => store.myRequests.filter((request) => ['Resolved', 'Closed'].includes(request.status)).length)
const withVendor = computed(() => store.myRequests.filter((request) => request.vendorId).length)
</script>

<template>
  <PageSkeleton v-if="loading" variant="list" :rows="4" />
  <div v-else>
    <PageHeader
      eyebrow="Your tenancy"
      title="My requests"
      description="Every repair you have reported, with the response clock and the vendor attached to it."
    >
      <template #actions>
        <Btn to="/new-request" size="sm">
          <Icon name="plus" :size="15" />
          New request
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Open</p>
        <p class="mt-1 font-mono text-2xl font-semibold tracking-[-0.02em]">{{ openCount }}</p>
        <p class="mt-0.5 text-[11px] text-ink-3">Being handled right now</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">With a vendor</p>
        <p class="mt-1 font-mono text-2xl font-semibold tracking-[-0.02em]">{{ withVendor }}</p>
        <p class="mt-0.5 text-[11px] text-ink-3">Booked or attended</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Resolved</p>
        <p class="mt-1 font-mono text-2xl font-semibold tracking-[-0.02em]">{{ resolvedCount }}</p>
        <p class="mt-0.5 text-[11px] text-ink-3">Closed in the last 12 months</p>
      </div>
    </div>

    <div class="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
      <div>
        <div class="mb-3 flex flex-wrap items-center gap-2">
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
          <span class="ml-auto font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ rows.length }} shown</span>
        </div>

        <div v-if="rows.length" class="flex flex-col gap-2.5">
          <SeverityRow
            v-for="request in rows"
            :key="request.id"
            :title="request.title"
            :meta="`${request.id} · ${unitShort(request.unitId)} · reported ${request.submitted}`"
            :tone="request.status === 'Needs action' ? 'crit' : request.status === 'In progress' || request.status === 'Scheduled' ? 'warn' : ''"
            :to="`/requests/${request.id}`"
            tall
          >
            <p class="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink-2">{{ request.description }}</p>
            <SlaBar v-if="!['Resolved', 'Closed'].includes(request.status)" class="mt-2.5" :value="request.sla" />
            <span v-else class="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-settled">
              <Icon name="check" :size="13" /> {{ request.target }}
            </span>
            <template #right>
              <Chip :tone="requestStatusTone(request.status)">{{ request.status }}</Chip>
            </template>
          </SeverityRow>
        </div>

        <div v-else class="rounded-card border border-rule bg-surface p-8 text-center shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Nothing here</p>
          <p class="mt-1.5 text-sm text-ink-2">No requests match this filter. Report an issue and it will appear here straight away.</p>
          <Btn to="/new-request" size="sm" class="mt-4">Report an issue</Btn>
        </div>
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Response targets</p>
          <dl class="mt-3 space-y-2.5 text-[12.5px]">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-2">Safety</dt>
              <dd class="font-mono font-semibold text-signal">8 hours</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-2">Urgent heating</dt>
              <dd class="font-mono font-semibold">24 hours</dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-2">Routine repairs</dt>
              <dd class="font-mono font-semibold">3 working days</dd>
            </div>
          </dl>
          <p class="mt-3 border-t border-dashed border-rule pt-3 text-[11.5px] leading-relaxed text-ink-3">
            The bar on each request shows how much of that window has been used. Anything past 85% is escalated to the manager.
          </p>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Something urgent?</p>
          <p class="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">
            Gas, flooding or fire damage cannot wait for a form. Call the emergency line — it is answered 24 hours a day.
          </p>
          <a href="tel:0800118999" class="mt-3 inline-flex h-10 items-center gap-2 rounded-btn bg-signal px-4 text-[12.5px] font-semibold text-white transition hover:bg-signal/90">
            <Icon name="phone" :size="15" /> 0800 118 999
          </a>
        </section>
      </aside>
    </div>
  </div>
</template>
