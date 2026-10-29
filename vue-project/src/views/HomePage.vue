<script setup>
import { computed } from 'vue'
import { money, org, properties, units } from '@/data/app'
import PlateDrawing from '@/components/PlateDrawing.vue'
import PropertyCard from '@/components/PropertyCard.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'

const available = computed(() => units.filter((unit) => unit.status === 'Vacant'))
const rentFrom = computed(() => Math.min(...units.map((unit) => unit.rent)))
const featured = computed(() => properties.slice(0, 3))

const steps = [
  {
    title: 'Find the home',
    body: 'Every property and unit is documented — rent, fees, floor area, condition and the exact date it is free.',
    icon: 'search',
  },
  {
    title: 'Ask, view, sign',
    body: 'Request a viewing, meet the manager and sign the tenancy. One reference number follows you through.',
    icon: 'key',
  },
  {
    title: 'Live in it',
    body: 'Pay rent, report repairs, renew the lease and keep every document in one place after you move in.',
    icon: 'home',
  },
]
</script>

<template>
  <div>
    <section class="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <Chip tone="ok">{{ available.length }} available now</Chip>
          <Chip>{{ properties.length }} properties · Northbank</Chip>
        </div>
        <h1 class="mt-5 max-w-[18ch] text-4xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-[56px]">
          Homes that come with a proper paper trail.
        </h1>
        <p class="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink-2">
          {{ org.name }} manages every home on this site directly — no letting agents in between. See the real rent,
          the real condition and the exact day a unit is free before you ask.
        </p>

        <div class="mt-7 flex flex-wrap gap-2.5">
          <Btn to="/properties">Browse properties</Btn>
          <Btn to="/new-request" variant="ghost">
            <Icon name="wrench" :size="16" />
            Report a repair
          </Btn>
        </div>

        <dl class="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-rule pt-5">
          <div>
            <dt class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">Rent from</dt>
            <dd class="mt-0.5 font-mono text-lg font-semibold">{{ money(rentFrom, 0) }}</dd>
          </div>
          <div>
            <dt class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">Units managed</dt>
            <dd class="mt-0.5 font-mono text-lg font-semibold">{{ units.length }}</dd>
          </div>
          <div>
            <dt class="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-3">Repair response</dt>
            <dd class="mt-0.5 font-mono text-lg font-semibold">24h</dd>
          </div>
        </dl>
      </div>

      <div class="overflow-hidden rounded-card border border-rule bg-surface shadow-e2">
        <PlateDrawing type="elevation" tint="#DCE7F2" label="P-01 · ELEV. S" width-label="18.4 m" />
        <div class="border-t border-rule p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Featured</p>
              <h2 class="mt-1 text-lg font-semibold tracking-[-0.02em]">Marsh Lane 12</h2>
              <p class="mt-1 text-[12.5px] text-ink-2">Six apartments, shared courtyard, four minutes to the tram.</p>
            </div>
            <Chip tone="ok">2 free</Chip>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <Chip v-for="amenity in properties[0].amenities.slice(0, 4)" :key="amenity">{{ amenity }}</Chip>
          </div>
          <RouterLink to="/properties/marsh" class="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-navy-600 hover:underline">
            See the units <Icon name="chevron" :size="14" />
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <RouterLink
        v-for="entry in [
          { label: 'My requests', meta: 'Track a repair', to: '/my-requests', icon: 'wrench' },
          { label: 'Pay rent', meta: 'Statement & receipts', to: '/my-payments', icon: 'wallet' },
          { label: 'My lease', meta: 'Terms & documents', to: '/my-lease', icon: 'key' },
          { label: 'Support', meta: 'Talk to the team', to: '/support', icon: 'message' },
        ]"
        :key="entry.to"
        :to="entry.to"
        class="group flex items-center gap-3 rounded-card border border-rule bg-surface p-4 shadow-e1 transition hover:border-navy-300"
      >
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy-800">
          <Icon :name="entry.icon" :size="19" />
        </span>
        <span class="min-w-0 flex-1">
          <b class="block text-[13px] font-semibold">{{ entry.label }}</b>
          <span class="block text-[11px] text-ink-3">{{ entry.meta }}</span>
        </span>
        <Icon name="chevron" :size="15" class="shrink-0 text-ink-3 transition group-hover:translate-x-0.5" />
      </RouterLink>
    </section>

    <section class="mt-14">
      <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">The portfolio</p>
          <h2 class="mt-1 text-2xl font-bold tracking-[-0.03em]">Three places to start</h2>
        </div>
        <RouterLink to="/properties" class="inline-flex items-center gap-1 text-[12.5px] font-semibold text-navy-600 hover:underline">
          All properties <Icon name="chevron" :size="14" />
        </RouterLink>
      </div>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PropertyCard v-for="property in featured" :key="property.id" :property="property" />
      </div>
    </section>

    <section class="mt-14 rounded-card border border-rule bg-surface p-6 shadow-e1 sm:p-8">
      <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">How it works</p>
      <div class="mt-5 grid gap-6 sm:grid-cols-3">
        <div v-for="(step, index) in steps" :key="step.title" class="flex gap-3.5">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-navy-100 bg-navy-50 text-navy-800">
            <Icon :name="step.icon" :size="17" />
          </span>
          <div>
            <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Step {{ index + 1 }}</p>
            <h3 class="mt-0.5 text-sm font-semibold">{{ step.title }}</h3>
            <p class="mt-1 text-[12.5px] leading-relaxed text-ink-2">{{ step.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="mt-5 flex flex-col items-start justify-between gap-5 rounded-card bg-navy-900 p-6 text-white shadow-e2 sm:flex-row sm:items-center sm:p-8">
      <div>
        <p class="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/50">Already a resident?</p>
        <h2 class="mt-1.5 text-xl font-bold tracking-[-0.025em]">Your tenancy is already set up.</h2>
        <p class="mt-1 text-[12.5px] text-white/65">Pay rent, report a repair or read the latest building notice — no forms to fill in twice.</p>
      </div>
      <div class="flex shrink-0 flex-wrap gap-2">
        <Btn to="/my-payments" variant="light" size="sm">Pay rent</Btn>
        <Btn to="/new-request" variant="ghost" size="sm" class="!border-white/25 !bg-transparent !text-white hover:!bg-white/10">
          Report a repair
        </Btn>
      </div>
    </section>
  </div>
</template>
