<script setup>
import { org } from '@/data/app'
import PatternCrosshair from '@/assets/PatternCrosshair.vue'
import Icon from './Icon.vue'

defineProps({
  headline: { type: String, default: 'Sign in to your home.' },
  sub: { type: String, default: '' },
})
</script>

<template>
  <div class="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden board-grid px-4 py-10 sm:px-6">
    <PatternCrosshair :size="56" :mark="3" color="rgba(80, 105, 135, 0.38)" />
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-72"
      style="background-image: radial-gradient(80% 100% at 50% 0%, rgba(29, 53, 87, 0.09) 0%, rgba(227, 231, 236, 0) 70%)"
    />

    <div class="relative w-full max-w-110">
      <RouterLink to="/" class="mx-auto flex w-fit items-center gap-3" aria-label="Tenure home">
        <span class="grid h-10 w-10 place-items-center rounded-lg bg-navy-800 font-mono text-sm font-bold text-white">T</span>
        <span class="leading-tight">
          <span class="block font-mono text-[10px] font-bold tracking-[0.3em] text-ink">TENURE</span>
          <span class="block text-[11.5px] text-ink-3">Resident portal</span>
        </span>
      </RouterLink>

      <div class="mt-7 rounded-2xl border border-rule bg-surface p-6 shadow-e2 sm:p-8">
        <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          {{ org.name }} · Apartment 4B
        </p>
        <h1 class="mt-2 text-[26px] font-bold leading-[1.15] tracking-[-0.035em] sm:text-[28px]">{{ headline }}</h1>
        <p class="mt-2 text-sm leading-relaxed text-ink-2">
          {{ sub || 'Pay rent, report a repair, read the building notices and keep one history of everything.' }}
        </p>

        <div class="mt-6 border-t border-rule pt-6">
          <slot />
        </div>
      </div>

      <div class="mt-5 flex flex-col items-center gap-2">
        <p class="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
          <Icon name="shield" :size="12" />
          Secured by Firebase Authentication
        </p>
        <p class="text-center text-[10.5px] leading-relaxed text-ink-3">
          Managed by {{ org.name }} · <a :href="org.phoneHref" class="font-medium hover:text-navy-800">{{ org.phone }}</a>
        </p>
      </div>
    </div>
  </div>
</template>
