<script setup>
import { computed } from 'vue'
import { leaseById, leaseStatusTone, money, org, resident, unitById, unitName } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
const lease = computed(() => leaseById('L-1004'))
const unit = computed(() => unitById(lease.value.unitId))

const clauses = [
  {
    title: 'Rent',
    body: 'Rent is payable monthly in advance on the 1st. The service fee covers the lift, cleaning, buildings insurance and the shared courtyard.',
  },
  {
    title: 'Deposit',
    body: 'The deposit is held by the Northbank Deposit Scheme and returned within 10 working days of the agreed checkout, less any damage beyond fair wear.',
  },
  {
    title: 'Repairs',
    body: 'Report repairs through Tenure. Safety issues are attended within 8 hours, urgent heating within 24 hours and routine work within 3 working days.',
  },
  {
    title: 'Ending the tenancy',
    body: 'Notice must be given in writing. The contractual notice period is two months and nothing renews automatically without a signed agreement.',
  },
]
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Your tenancy"
      :title="`Lease ${lease.id}`"
      :description="`${unitName(unit.id)} · ${lease.term} tenancy signed ${lease.signed}`"
    >
      <template #actions>
        <Chip :tone="leaseStatusTone(lease.status)">{{ lease.status }}</Chip>
        <Btn variant="ghost" size="sm" @click="store.toast('Tenancy agreement downloaded')">
          <Icon name="download" :size="15" />
          Download agreement
        </Btn>
      </template>
    </PageHeader>

    <div class="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
      <div class="flex flex-col gap-5">
        <section class="rounded-card border border-l-[3px] border-rule border-l-navy-800 bg-surface p-5 shadow-e1">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Monthly rent</p>
              <p class="mt-1 font-mono text-[34px] font-semibold leading-none tracking-[-0.04em]">
                {{ money(lease.rent, 0) }}<span class="text-xs font-normal text-ink-3">/month</span>
              </p>
              <p class="mt-1.5 text-[12.5px] text-ink-2">{{ unit.name }} · {{ resident.name }}</p>
            </div>
            <div class="text-right">
              <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Ends</p>
              <p class="mt-1 text-lg font-semibold tracking-[-0.02em]">{{ lease.end }}</p>
              <p class="text-[11px] text-ink-3">{{ lease.term }} from {{ lease.start }}</p>
            </div>
          </div>

          <dl class="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-dashed border-rule pt-4 text-[12px] sm:grid-cols-3">
            <div>
              <dt class="text-ink-3">Deposit held</dt>
              <dd class="mt-0.5 font-mono text-[13px] font-semibold">{{ money(lease.deposit) }}</dd>
            </div>
            <div>
              <dt class="text-ink-3">Service fee</dt>
              <dd class="mt-0.5 font-mono text-[13px] font-semibold">{{ money(unit.serviceFee) }}</dd>
            </div>
            <div>
              <dt class="text-ink-3">Deposit scheme</dt>
              <dd class="mt-0.5 text-[12.5px] font-medium">{{ lease.depositScheme.split('·')[0] }}</dd>
            </div>
            <div>
              <dt class="text-ink-3">Signed</dt>
              <dd class="mt-0.5 font-medium">{{ lease.signed }}</dd>
            </div>
            <div>
              <dt class="text-ink-3">Renewal</dt>
              <dd class="mt-0.5 font-medium">{{ lease.renewal }}</dd>
            </div>
            <div>
              <dt class="text-ink-3">Reference</dt>
              <dd class="mt-0.5 font-mono font-medium">{{ lease.id }}</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">The terms that matter</h2>
            <Chip tone="neutral">Plain English</Chip>
          </div>
          <dl class="mt-3 divide-y divide-rule">
            <div v-for="clause in clauses" :key="clause.title" class="py-3 first:pt-1">
              <dt class="text-[13px] font-semibold">{{ clause.title }}</dt>
              <dd class="mt-1 text-[12.5px] leading-relaxed text-ink-2">{{ clause.body }}</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Documents</h2>
            <Chip tone="neutral">{{ lease.documents.length }} files</Chip>
          </div>
          <ul class="mt-2 divide-y divide-rule">
            <li v-for="document in lease.documents" :key="document" class="flex items-center gap-3 py-2.5">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-rule-2 bg-alt text-ink-2">
                <Icon name="file" :size="16" />
              </span>
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[12.5px] font-semibold">{{ document }}</b>
                <span class="block text-[10.5px] text-ink-3">PDF · signed copy · {{ lease.id }}</span>
              </div>
              <button
                type="button"
                class="inline-flex h-8 items-center gap-1.5 rounded-btn border border-rule-2 px-2.5 text-[11px] font-semibold text-ink-2 transition hover:bg-navy-50 hover:text-ink"
                @click="store.toast(`${document} downloaded`)"
              >
                <Icon name="download" :size="13" /> Download
              </button>
            </li>
          </ul>
        </section>
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <section class="rounded-card border border-navy-100 bg-navy-50 p-5">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-navy-600">Renewal</p>
          <h2 class="mt-1.5 text-base font-semibold tracking-[-0.02em] text-navy-900">Your renewal window opens 1 Dec 2026</h2>
          <p class="mt-1.5 text-[12.5px] leading-relaxed text-navy-800/80">
            We will send proposed terms three months before {{ lease.end }}. Nothing renews automatically — you can stay, renegotiate or give notice.
          </p>
          <Btn to="/support" size="sm" class="mt-3">Ask about renewing</Btn>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Deposit</p>
          <p class="mt-1 font-mono text-2xl font-semibold tracking-[-0.03em]">{{ money(lease.deposit) }}</p>
          <p class="mt-1 text-[12px] leading-relaxed text-ink-2">Protected with the {{ lease.depositScheme }}.</p>
          <p class="mt-2 font-mono text-[10.5px] text-ink-3">Certificate saved to your documents.</p>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Managed by</p>
          <p class="mt-1.5 text-[13px] font-semibold">{{ org.name }}</p>
          <a :href="org.phoneHref" class="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-ink-2 hover:text-navy-800">
            <Icon name="phone" :size="13" /> {{ org.phone }}
          </a>
          <a :href="`mailto:${org.email}`" class="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-ink-2 hover:text-navy-800">
            <Icon name="message" :size="13" /> {{ org.email }}
          </a>
          <p class="mt-2 text-[10.5px] text-ink-3">{{ org.hours }}</p>
        </section>

        <p class="px-1 text-[11px] leading-relaxed text-ink-3">
          This is a summary, not the legal agreement. The signed PDF above is the version that applies.
        </p>
      </aside>
    </div>
  </div>
</template>
