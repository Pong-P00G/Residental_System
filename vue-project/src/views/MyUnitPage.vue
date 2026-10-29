<script setup>
import { computed } from 'vue'
import { documents, leaseById, money, requestStatusTone, unitById, unitName } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import PlateDrawing from '@/components/PlateDrawing.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
const unit = computed(() => unitById('u-4b'))
const lease = computed(() => leaseById('L-1004'))
const openRequests = computed(() => store.myRequests.filter((request) => !['Resolved', 'Closed'].includes(request.status)))
const unitDocuments = computed(() => documents.filter((document) => document.scope === 'Lease' && document.target === 'L-1004'))
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Your tenancy"
      :title="unit.name"
      :description="`${unitName(unit.id)} · ${unit.beds} bedrooms · ${unit.areaM2} m² · ${unit.floor}`"
    >
      <template #actions>
        <Btn to="/new-request" variant="ghost" size="sm">
          <Icon name="wrench" :size="15" />
          Report an issue
        </Btn>
        <Btn to="/my-lease" size="sm">Open lease</Btn>
      </template>
    </PageHeader>

    <div class="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
      <div class="flex flex-col gap-5">
        <div class="overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
          <PlateDrawing type="plan" :tint="unit.tint" :label="unit.plateLabel" />
          <div class="grid grid-cols-2 divide-x divide-rule border-t border-rule sm:grid-cols-4">
            <div v-for="fact in [
              { value: unit.beds, label: 'Bedrooms' },
              { value: unit.baths, label: 'Bathroom' },
              { value: unit.areaM2, label: 'm² usable' },
              { value: unit.floor, label: 'Level' },
            ]" :key="fact.label" class="px-3 py-3 text-center">
              <b class="block font-mono text-[15px] font-semibold tracking-[-0.02em]">{{ fact.value }}</b>
              <span class="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.04em] text-ink-3">{{ fact.label }}</span>
            </div>
          </div>
        </div>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Rooms</h2>
            <Chip tone="neutral">{{ unit.rooms.length }} spaces</Chip>
          </div>
          <dl class="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            <div v-for="room in unit.rooms" :key="room.name" class="flex items-baseline justify-between gap-3 border-b border-dashed border-rule py-1.5 text-[12.5px] last:border-0">
              <dt class="text-ink-2">{{ room.name }}</dt>
              <dd class="shrink-0 font-mono text-[11.5px] font-medium">{{ room.size }}</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Included</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <Chip v-for="feature in unit.features" :key="feature">{{ feature }}</Chip>
          </div>
          <p class="mt-4 text-[13px] leading-relaxed text-ink-2">{{ unit.condition }}</p>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Open requests</h2>
            <Chip :tone="openRequests.length ? 'warn' : 'ok'">{{ openRequests.length }} open</Chip>
          </div>
          <div v-if="openRequests.length" class="mt-3 divide-y divide-rule">
            <RouterLink
              v-for="request in openRequests"
              :key="request.id"
              :to="`/requests/${request.id}`"
              class="flex items-center gap-3 py-3 transition first:pt-1 hover:text-navy-800"
            >
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[12.5px] font-semibold">{{ request.title }}</b>
                <span class="block text-[11px] text-ink-3">{{ request.id }} · {{ request.submitted }} · {{ request.target }}</span>
              </div>
              <Chip :tone="requestStatusTone(request.status)">{{ request.status }}</Chip>
              <Icon name="chevron" :size="15" class="shrink-0 text-ink-3" />
            </RouterLink>
          </div>
          <p v-else class="mt-2 text-[12.5px] text-ink-2">Nothing open. Anything you report will show here until it is resolved.</p>
        </section>
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Your home</p>
            <Chip tone="ok">Active</Chip>
          </div>
          <dl class="mt-3 space-y-2.5 text-[12.5px]">
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Rent</dt><dd class="font-mono font-semibold">{{ money(unit.rent) }}/mo</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Service fee</dt><dd class="font-mono">{{ money(unit.serviceFee) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Tenancy ends</dt><dd class="font-medium">{{ lease.end }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Deposit</dt><dd class="font-mono">{{ money(unit.deposit) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Reference</dt><dd class="font-mono">{{ lease.id }}</dd></div>
          </dl>
          <div class="mt-4 flex flex-col gap-2">
            <Btn to="/my-lease" variant="ghost" size="sm" block>Lease & documents</Btn>
            <Btn to="/my-payments" variant="ghost" size="sm" block>Payments</Btn>
          </div>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-2">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Unit documents</p>
            <Chip tone="neutral">{{ unitDocuments.length }}</Chip>
          </div>
          <ul class="mt-2 divide-y divide-rule">
            <li v-for="document in unitDocuments" :key="document.id" class="flex items-center gap-2.5 py-2.5">
              <Icon name="file" :size="15" class="shrink-0 text-ink-3" />
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[11.5px] font-medium">{{ document.name }}</b>
                <span class="block text-[10px] text-ink-3">{{ document.size }} · updated {{ document.updated }}</span>
              </div>
              <button type="button" class="text-ink-3 transition hover:text-navy-800" aria-label="Download" @click="store.toast(`${document.name} downloaded`)">
                <Icon name="download" :size="15" />
              </button>
            </li>
          </ul>
        </section>

        <section class="rounded-card border border-rule bg-surface p-4 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Meter readings</p>
          <dl class="mt-2 space-y-1.5 text-[12px]">
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Water</dt><dd class="font-mono">{{ money(45) }} this month</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-3">Last reading</dt><dd class="font-mono">28 Oct 2026</dd></div>
          </dl>
        </section>
      </aside>
    </div>
  </div>
</template>
