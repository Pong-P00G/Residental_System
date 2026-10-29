<script setup>
import { org } from '@/data/app'
import PlateDrawing from './PlateDrawing.vue'

defineProps({
  headline: { type: String, default: 'Sign in to your home.' },
  sub: { type: String, default: '' },
})
</script>

<template>
  <div class="grid min-h-dvh board-grid lg:grid-cols-[1.05fr_1fr]">
    <aside class="relative hidden flex-col justify-between overflow-hidden bg-navy-900 p-10 text-white lg:flex xl:p-14">
      <RouterLink to="/" class="flex items-center gap-3">
        <span class="grid h-9 w-9 place-items-center rounded-lg bg-white font-mono text-[13px] font-bold text-navy-900">T</span>
        <span class="font-mono text-[10px] font-bold tracking-[0.3em]">TENURE</span>
      </RouterLink>

      <div class="max-w-lg">
        <p class="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          {{ org.name }} · Apartment 4B
        </p>
        <h1 class="mt-3 text-4xl font-bold leading-[1.1] tracking-[-0.04em] xl:text-[42px]">{{ headline }}</h1>
        <p class="mt-3 max-w-md text-sm leading-relaxed text-white/65">
          {{ sub || 'Pay rent, report a repair, read the building notices and keep one history of everything.' }}
        </p>
        <div class="mt-8 overflow-hidden rounded-xl border border-white/10 bg-navy-800/40">
          <PlateDrawing type="elevation" tint="#DCE7F2" label="4B · ELEV. S" width-label="18.4 m" />
        </div>
      </div>

      <p class="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
        Ledger · requests · compliance · handoff
      </p>
    </aside>

    <main class="flex items-center justify-center px-4 py-10 sm:px-8">
      <div class="w-full max-w-md">
        <RouterLink to="/" class="mb-8 flex items-center gap-2 lg:hidden">
          <span class="grid h-8 w-8 place-items-center rounded-lg bg-navy-800 font-mono text-[11px] font-bold text-white">T</span>
          <span class="font-mono text-[10px] font-bold tracking-[0.26em] text-ink">TENURE</span>
        </RouterLink>
        <slot />
      </div>
    </main>
  </div>
</template>
