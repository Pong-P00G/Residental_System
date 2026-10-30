<script setup>
import { computed } from 'vue'
import { money, requests, vendors } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const store = useAppStore()
const { loading } = usePageLoading()

const totalSpend = computed(() => vendors.reduce((total, vendor) => total + vendor.spendYtd, 0))
const avgRating = computed(() => (vendors.reduce((total, vendor) => total + vendor.rating, 0) / vendors.length).toFixed(1))
const openByVendor = (vendorId) => requests.filter((request) => request.vendorId === vendorId && !['Resolved', 'Closed'].includes(request.status)).length

const statusTone = (status) => ({ Preferred: 'ok', Active: 'neutral', 'Under review': 'warn' })[status] || 'neutral'
</script>

<template>
  <PageSkeleton v-if="loading" variant="cards" :cards="6" />
  <div v-else>
    <PageHeader
      eyebrow="Operations"
      title="Vendors"
      :description="`${vendors.length} approved contractors · ${money(totalSpend, 0)} committed this year · ${avgRating}★ average rating.`"
    >
      <template #actions>
        <Btn size="sm" @click="store.toast('Add vendor form opened')">
          <Icon name="plus" :size="15" />
          Add vendor
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 grid gap-3 sm:grid-cols-3">
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Committed this year</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ money(totalSpend, 0) }}</p>
        <p class="text-[11px] text-ink-3">Invoiced and scheduled works</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Average rating</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ avgRating }}★</p>
        <p class="text-[11px] text-ink-3">From {{ vendors.reduce((total, vendor) => total + vendor.jobs, 0) }} completed jobs</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Preferred vendors</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ vendors.filter((vendor) => vendor.status === 'Preferred').length }}</p>
        <p class="text-[11px] text-ink-3">First call for urgent work</p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <section v-for="vendor in vendors" :key="vendor.id" class="flex flex-col rounded-card border border-rule bg-surface p-5 shadow-e1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-mono text-[9.5px] font-semibold uppercase tracking-widest text-ink-3">{{ vendor.trade }}</p>
            <h2 class="mt-0.5 text-[15px] font-semibold tracking-[-0.02em]">{{ vendor.name }}</h2>
            <p class="mt-0.5 text-[11px] text-ink-3">{{ vendor.contact }}</p>
          </div>
          <Chip :tone="statusTone(vendor.status)">{{ vendor.status }}</Chip>
        </div>

        <dl class="mt-4 grid grid-cols-3 gap-2 border-y border-dashed border-rule py-3 text-center">
          <div>
            <dt class="font-mono text-[9px] uppercase tracking-[0.06em] text-ink-3">Rating</dt>
            <dd class="mt-0.5 font-mono text-[13px] font-semibold">{{ vendor.rating }}★</dd>
          </div>
          <div>
            <dt class="font-mono text-[9px] uppercase tracking-[0.06em] text-ink-3">Jobs</dt>
            <dd class="mt-0.5 font-mono text-[13px] font-semibold">{{ vendor.jobs }}</dd>
          </div>
          <div>
            <dt class="font-mono text-[9px] uppercase tracking-[0.06em] text-ink-3">SLA</dt>
            <dd class="mt-0.5 font-mono text-[12px] font-semibold">{{ vendor.sla.split(' ')[0] }}</dd>
          </div>
        </dl>

        <p class="mt-3 flex-1 text-[11.5px] leading-relaxed text-ink-2">{{ vendor.note }}</p>

        <div class="mt-4 flex items-center justify-between gap-2">
          <div>
            <span class="block font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">Spend YTD</span>
            <span class="font-mono text-[13px] font-semibold">{{ money(vendor.spendYtd, 0) }}</span>
          </div>
          <Chip v-if="openByVendor(vendor.id)" tone="warn">{{ openByVendor(vendor.id) }} open</Chip>
          <Chip v-else tone="neutral">No open jobs</Chip>
        </div>

        <Btn
          variant="ghost"
          size="sm"
          block
          class="mt-3"
          @click="store.toast(`${vendor.name} is ready to be assigned from a request`)"
        >
          <Icon name="wrench" :size="14" /> Assign to a request
        </Btn>
      </section>
    </div>

    <p class="mt-5 text-[11px] leading-relaxed text-ink-3">
      Ratings are the average of resident feedback after each visit. A vendor drops out of preferred status below 4.0★ or after two missed response targets.
    </p>
  </div>
</template>
