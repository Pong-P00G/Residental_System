<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  leaseOfResident,
  money,
  propertyById,
  requestResidentName,
  requestStatusTone,
  residentById,
  unitById,
  vendorById,
  vendors,
} from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Sheet from '@/components/Sheet.vue'
import SlaBar from '@/components/SlaBar.vue'
import Timeline from '@/components/Timeline.vue'
import Icon from '@/components/Icon.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const route = useRoute()
const store = useAppStore()
const { loading } = usePageLoading()

const request = computed(() => store.requestList.find((item) => item.id === route.params.id) || null)
const vendor = computed(() => (request.value?.vendorId ? vendorById(request.value.vendorId) : null))
const unit = computed(() => (request.value?.unitId ? unitById(request.value.unitId) : null))
const property = computed(() => {
  const propertyId = request.value?.propertyId || unit.value?.propertyId
  return propertyId ? propertyById(propertyId) : null
})
const resident = computed(() => (request.value?.residentId ? residentById(request.value.residentId) : null))
const lease = computed(() => (resident.value ? leaseOfResident(resident.value.id) : null))
const isOpen = computed(() => request.value && !['Resolved', 'Closed'].includes(request.value.status))

const assignOpen = ref(false)
const selectedVendor = ref('v-northline')

function openAssign() {
  selectedVendor.value = request.value?.vendorId || 'v-northline'
  assignOpen.value = true
}

function assign() {
  if (!request.value) return
  store.assignVendor(request.value.id, selectedVendor.value)
  assignOpen.value = false
}

function resolve() {
  if (!request.value) return
  store.resolveRequest(request.value.id)
}
</script>

<template>
  <PageSkeleton v-if="loading" variant="detail" />
  <div v-else-if="request">
    <PageHeader
      :eyebrow="`Request · ${request.id}`"
      :title="request.title"
      :description="`${unit ? unit.name : property?.name || 'Building-wide'} · ${requestResidentName(request)} · reported ${request.submitted}`"
      back="/d/requests"
    >
      <template #actions>
        <Chip :tone="requestStatusTone(request.status)">{{ request.status }}</Chip>
        <Btn v-if="isOpen" variant="ghost" size="sm" @click="openAssign">
          <Icon name="wrench" :size="15" />
          {{ vendor ? 'Change vendor' : 'Assign vendor' }}
        </Btn>
        <Btn v-if="isOpen" size="sm" @click="resolve">
          <Icon name="check" :size="15" />
          Mark resolved
        </Btn>
      </template>
    </PageHeader>

    <div class="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div class="flex flex-col gap-4">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">History</h2>
            <div class="flex items-center gap-1.5">
              <Chip tone="neutral">{{ request.priority }}</Chip>
              <Chip tone="neutral">{{ request.category }}</Chip>
            </div>
          </div>
          <Timeline class="mt-4" :steps="request.steps" />
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Reported</h2>
          <p class="mt-2 text-[13px] leading-relaxed text-ink-2">{{ request.description }}</p>
          <div v-if="request.photos" class="mt-3 inline-flex items-center gap-1.5 rounded-chip border border-fyi-bd bg-fyi-bg px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] text-fyi">
            <Icon name="camera" :size="12" /> {{ request.photos }} photo{{ request.photos > 1 ? 's' : '' }} attached
          </div>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Updates</h2>
            <Chip tone="neutral">{{ request.updates?.length || 0 }}</Chip>
          </div>
          <div class="mt-3 space-y-3">
            <div v-for="(update, index) in request.updates" :key="index" class="rounded-btn border border-rule bg-alt p-3.5">
              <div class="flex items-center justify-between gap-3">
                <b class="text-[12.5px] font-semibold">{{ update.from }}</b>
                <span class="font-mono text-[10px] text-ink-3">{{ update.at }}</span>
              </div>
              <p class="mt-1 text-[12.5px] leading-relaxed text-ink-2">{{ update.body }}</p>
            </div>
          </div>
        </section>

        <section>
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Parties</h2>
            <Chip tone="neutral">{{ resident ? 2 : 1 }}</Chip>
          </div>
          <div class="divide-y divide-rule overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
            <div v-if="resident" class="flex items-center gap-3 px-4 py-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-100 font-mono text-[10.5px] font-semibold text-navy-800">{{ resident.initials }}</span>
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[12.5px] font-semibold">{{ resident.name }}</b>
                <span class="block truncate text-[11px] text-ink-3">Resident · {{ resident.email }} · {{ resident.phone }}</span>
              </div>
              <RouterLink :to="`/d/residents/${resident.id}`" class="inline-flex h-8 items-center gap-1.5 rounded-btn border border-rule-2 px-2.5 text-[11px] font-semibold text-ink transition hover:bg-navy-50">
                <Icon name="user" :size="13" /> Record
              </RouterLink>
            </div>
            <div v-if="vendor" class="flex items-center gap-3 px-4 py-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-progress-bg font-mono text-[10.5px] font-semibold text-progress">V</span>
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[12.5px] font-semibold">{{ vendor.name }}</b>
                <span class="block truncate text-[11px] text-ink-3">Vendor · {{ vendor.trade }} · {{ vendor.contact }}</span>
              </div>
              <RouterLink to="/d/vendors" class="inline-flex h-8 items-center gap-1.5 rounded-btn border border-rule-2 px-2.5 text-[11px] font-semibold text-ink transition hover:bg-navy-50">
                <Icon name="phone" :size="13" /> Vendor
              </RouterLink>
            </div>
            <div v-if="!resident" class="flex items-center gap-3 px-4 py-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-fyi-bg font-mono text-[10.5px] font-semibold text-fyi">B</span>
              <div class="min-w-0 flex-1">
                <b class="block text-[12.5px] font-semibold">Building report</b>
                <span class="block text-[11px] text-ink-3">{{ request.reporterName }} · no resident attached</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-2">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">{{ isOpen ? 'Response clock' : 'Closed' }}</p>
            <Chip :tone="requestStatusTone(request.status)">{{ request.status }}</Chip>
          </div>
          <p class="mt-1 font-mono text-2xl font-semibold tracking-[-0.03em]" :class="{ 'text-signal': isOpen && request.sla >= 85 }">{{ request.target }}</p>
          <SlaBar v-if="isOpen" class="mt-3" :value="request.sla" />
          <p class="mt-2 font-mono text-[10px] uppercase tracking-[0.09em] text-ink-3">{{ isOpen ? `${request.sla}% used` : 'SLA closed' }}</p>
          <p class="mt-3 border-t border-dashed border-rule pt-3 text-[12px] leading-relaxed text-ink-2">
            {{ property ? `${property.name} · ${property.manager}` : 'Portfolio-wide' }}
          </p>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-2">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Vendor</p>
            <Chip :tone="vendor ? 'ok' : 'crit'">{{ vendor ? 'Assigned' : 'Unassigned' }}</Chip>
          </div>
          <template v-if="vendor">
            <h3 class="mt-2 text-base font-semibold tracking-[-0.02em]">{{ vendor.name }}</h3>
            <p class="text-[11.5px] text-ink-2">{{ vendor.trade }} · {{ vendor.rating }}★ across {{ vendor.jobs }} jobs</p>
            <p class="mt-2 text-[12px] leading-relaxed text-ink-2">{{ vendor.note }}</p>
            <div class="mt-3 flex flex-col gap-2">
              <Btn v-if="isOpen" variant="ghost" size="sm" block @click="openAssign">Change vendor</Btn>
              <Btn to="/d/vendors" variant="quiet" size="sm" block>Open vendors</Btn>
            </div>
          </template>
          <template v-else>
            <p class="mt-2 text-[12.5px] leading-relaxed text-ink-2">No vendor assigned. The response clock keeps running until one is booked.</p>
            <Btn v-if="isOpen" size="sm" block class="mt-3" @click="openAssign">Assign a vendor</Btn>
          </template>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Tenancy</p>
          <template v-if="resident">
            <dl class="mt-2.5 space-y-2 text-[12px]">
              <div class="flex justify-between gap-3"><dt class="text-ink-3">Unit</dt><dd class="font-medium">{{ unit?.name || '—' }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-ink-3">Lease</dt><dd class="font-mono font-medium">{{ lease?.id || '—' }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-ink-3">Balance</dt><dd class="font-mono font-medium" :class="resident.balance ? 'text-signal' : ''">{{ resident.balance ? money(resident.balance) : 'Clear' }}</dd></div>
            </dl>
            <div class="mt-3 flex gap-2">
              <Btn v-if="lease" :to="`/d/leases/${lease.id}`" variant="ghost" size="xs">Lease</Btn>
              <Btn to="/d/payments" variant="ghost" size="xs">Payments</Btn>
            </div>
          </template>
          <p v-else class="mt-2 text-[12px] text-ink-2">No resident attached to this report.</p>
        </section>
      </aside>
    </div>

    <Sheet
      v-if="assignOpen && request"
      eyebrow="Assign vendor"
      :title="request.title"
      subtitle="The resident is told the vendor name and arrival window immediately."
      @close="assignOpen = false"
    >
      <div class="flex flex-col gap-2">
        <button
          v-for="option in vendors"
          :key="option.id"
          type="button"
          class="flex items-center gap-3 rounded-btn border px-3.5 py-3 text-left transition"
          :class="selectedVendor === option.id ? 'border-navy-800 ring-2 ring-navy-800/10' : 'border-rule-2 hover:border-navy-300'"
          @click="selectedVendor = option.id"
        >
          <span class="h-4 w-4 shrink-0 rounded-full border-2" :class="selectedVendor === option.id ? 'border-[5px] border-navy-800' : 'border-rule-2'"></span>
          <span class="min-w-0 flex-1">
            <b class="block text-[13px] font-semibold">{{ option.name }}</b>
            <span class="block text-[11.5px] text-ink-2">{{ option.trade }} · {{ option.rating }}★ · {{ option.sla }}</span>
          </span>
          <Chip v-if="option.status === 'Preferred'" tone="ok">Preferred</Chip>
        </button>
      </div>
      <Btn block class="mt-4" @click="assign">Assign and notify</Btn>
      <p class="mt-3 text-center text-[11px] text-ink-3">The resident gets the vendor name and arrival window by SMS.</p>
    </Sheet>
  </div>

  <div v-else class="mx-auto max-w-lg rounded-card border border-rule bg-surface p-6 shadow-e1">
    <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Request not found</p>
    <p class="mt-2 text-[13px] text-ink-2">This reference is not in the portfolio queue.</p>
    <Btn to="/d/requests" class="mt-4">Back to requests</Btn>
  </div>
</template>
