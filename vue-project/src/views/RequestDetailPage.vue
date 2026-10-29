<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { org, requestStatusTone, unitById, unitName, vendorById } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Timeline from '@/components/Timeline.vue'
import SlaBar from '@/components/SlaBar.vue'
import Icon from '@/components/Icon.vue'

const route = useRoute()
const store = useAppStore()

const request = computed(() => store.requestList.find((item) => item.id === route.params.id) || null)
const vendor = computed(() => (request.value?.vendorId ? vendorById(request.value.vendorId) : null))
const unit = computed(() => (request.value?.unitId ? unitById(request.value.unitId) : null))
const isOpen = computed(() => request.value && !['Resolved', 'Closed'].includes(request.value.status))
</script>

<template>
  <div v-if="request">
    <PageHeader
      :eyebrow="`Request · ${request.id}`"
      :title="request.title"
      :description="`${unit ? unitName(unit.id) : 'Building-wide'} · reported ${request.submitted} · ${request.priority.toLowerCase()} priority`"
      back="/my-requests"
    >
      <template #actions>
        <Chip :tone="requestStatusTone(request.status)">{{ request.status }}</Chip>
        <Btn v-if="isOpen" to="/support" size="sm">
          <Icon name="message" :size="15" />
          Message the team
        </Btn>
      </template>
    </PageHeader>

    <div class="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div class="flex flex-col gap-4">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Progress</h2>
            <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">{{ request.category }}</span>
          </div>
          <Timeline class="mt-4" :steps="request.steps" />
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">What you reported</h2>
          <p class="mt-2.5 text-[13.5px] leading-relaxed text-ink-2">{{ request.description }}</p>
          <div v-if="request.photos" class="mt-3 inline-flex items-center gap-1.5 rounded-chip border border-fyi-bd bg-fyi-bg px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] text-fyi">
            <Icon name="camera" :size="12" /> {{ request.photos }} photo{{ request.photos > 1 ? 's' : '' }} attached
          </div>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Updates</h2>
            <Chip tone="neutral">{{ request.updates?.length || 0 }} messages</Chip>
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
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-2">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
              {{ isOpen ? 'Response clock' : 'Closed' }}
            </p>
            <Chip :tone="requestStatusTone(request.status)">{{ request.status }}</Chip>
          </div>
          <p v-if="isOpen" class="mt-1 font-mono text-2xl font-semibold tracking-[-0.03em]" :class="{ 'text-signal': request.sla >= 85 }">
            {{ request.target }}
          </p>
          <SlaBar v-if="isOpen" class="mt-3" :value="request.sla" />
          <p class="mt-2 font-mono text-[10px] uppercase tracking-[0.09em] text-ink-3">
            {{ isOpen ? `${request.sla}% of the window used` : request.target }}
          </p>
          <p v-if="request.residentId === 'r-ines'" class="mt-3 border-t border-dashed border-rule pt-3 text-[12px] leading-relaxed text-ink-2">
            You are notified by SMS the moment the visit window changes.
          </p>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-2">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Vendor</p>
            <Chip :tone="vendor ? 'ok' : 'neutral'">{{ vendor ? 'Assigned' : 'Not yet' }}</Chip>
          </div>
          <template v-if="vendor">
            <h3 class="mt-2 text-base font-semibold tracking-[-0.02em]">{{ vendor.name }}</h3>
            <p class="mt-0.5 text-[11.5px] text-ink-2">{{ vendor.trade }} · {{ vendor.rating }}★ across {{ vendor.jobs }} jobs</p>
            <p class="mt-2 text-[12px] leading-relaxed text-ink-2">{{ vendor.note }}</p>
            <a :href="org.phoneHref" class="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-navy-600 hover:underline">
              <Icon name="phone" :size="13" /> Call the tenancy desk
            </a>
          </template>
          <p v-else class="mt-2 text-[12.5px] leading-relaxed text-ink-2">
            No vendor assigned yet. The team assigns one before the target window closes.
          </p>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Your tenancy</p>
          <dl class="mt-2.5 space-y-2 text-[12.5px]">
            <div class="flex justify-between gap-3">
              <dt class="text-ink-3">Unit</dt>
              <dd class="font-medium">{{ unit ? unit.name : 'Communal area' }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-ink-3">Reference</dt>
              <dd class="font-mono font-medium">{{ request.id }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-ink-3">Reported</dt>
              <dd class="font-medium">{{ request.submitted }}</dd>
            </div>
          </dl>
          <div class="mt-4 flex flex-col gap-2">
            <Btn to="/my-unit" variant="ghost" size="sm" block>Open my unit</Btn>
            <Btn to="/new-request" variant="quiet" size="sm" block>Report another issue</Btn>
          </div>
        </section>
      </aside>
    </div>
  </div>

  <div v-else class="mx-auto max-w-lg rounded-card border border-rule bg-surface p-6 shadow-e1">
    <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Request not found</p>
    <p class="mt-2 text-[13px] text-ink-2">That reference is not on your record. Your own requests are listed on My Requests.</p>
    <Btn to="/my-requests" class="mt-4">Back to my requests</Btn>
  </div>
</template>
