<script setup>
import Skeleton from './Skeleton.vue'

defineProps({
  variant: { type: String, default: 'table' }, // table | cards | list | dashboard | detail | board | settings | form
  rows: { type: Number, default: 6 },
  cards: { type: Number, default: 6 },
})

const bars = [44, 62, 38, 74, 51, 67, 41, 58, 47, 71, 36, 54]
</script>

<template>
  <div role="status" aria-live="polite" aria-busy="true" :data-skeleton-variant="variant">
    <span class="sr-only">Loading page content…</span>

    <!-- page header -->
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div class="min-w-0 flex-1">
        <Skeleton class="h-2.5 w-28" />
        <Skeleton class="mt-2.5 h-7 w-56 max-w-full" />
        <Skeleton class="mt-3 h-3 w-full max-w-md" />
        <Skeleton class="mt-2 h-3 w-2/3 max-w-xs" />
      </div>
      <div class="flex gap-2">
        <Skeleton class="hidden h-9 w-24 rounded-btn sm:block" />
        <Skeleton class="h-9 w-32 rounded-btn" />
      </div>
    </div>

    <!-- dashboard overview -->
    <template v-if="variant === 'dashboard'">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="i in 4" :key="i" class="rounded-card border border-rule bg-surface p-4 shadow-e1">
          <Skeleton class="h-2.5 w-24" />
          <Skeleton class="mt-3 h-6 w-20" />
          <Skeleton class="mt-2.5 h-2.5 w-28" />
        </div>
      </div>

      <div class="mt-6 grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div class="flex flex-col gap-5">
          <div class="rounded-card border border-rule bg-surface p-5 shadow-e1">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="flex-1">
                <Skeleton class="h-2.5 w-24" />
                <Skeleton class="mt-3 h-7 w-36" />
                <Skeleton class="mt-2.5 h-2.5 w-48 max-w-full" />
              </div>
              <Skeleton class="h-2.5 w-28" />
            </div>
            <div class="mt-8 flex h-36 items-end gap-1.5 sm:gap-2">
              <Skeleton v-for="(height, i) in bars" :key="i" class="flex-1 rounded-sm" :style="{ height: height + '%' }" />
            </div>
          </div>

          <div class="rounded-card border border-rule bg-surface p-5 shadow-e1">
            <Skeleton class="h-2.5 w-32" />
            <div class="mt-4 space-y-3.5">
              <div v-for="i in 4" :key="i" class="flex items-center gap-3">
                <Skeleton shape="circle" class="h-8 w-8 shrink-0" />
                <div class="min-w-0 flex-1">
                  <Skeleton class="h-3 w-2/3" />
                  <Skeleton class="mt-1.5 h-2.5 w-1/3" />
                </div>
                <Skeleton class="h-5 w-16 shrink-0 rounded-chip" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div v-for="i in 3" :key="i" class="rounded-card border border-rule bg-surface p-5 shadow-e1">
            <Skeleton class="h-2.5 w-24" />
            <Skeleton class="mt-3.5 h-3 w-full" />
            <Skeleton class="mt-2 h-3 w-4/5" />
            <Skeleton class="mt-2 h-3 w-3/5" />
          </div>
        </div>
      </div>
    </template>

    <!-- master-detail: sticky rail + detail pane -->
    <template v-else-if="variant === 'detail'">
      <div class="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)] xl:items-start">
        <div class="hidden flex-col gap-2 rounded-card border border-rule bg-surface p-3 shadow-e1 xl:flex">
          <Skeleton class="h-2.5 w-16" />
          <Skeleton v-for="i in 5" :key="i" class="mt-2 h-14 w-full rounded-btn" />
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div v-for="i in 4" :key="i" class="rounded-card border border-rule bg-surface p-4 shadow-e1">
              <Skeleton class="h-2.5 w-20" />
              <Skeleton class="mt-3 h-6 w-24" />
              <Skeleton class="mt-2 h-2.5 w-28" />
            </div>
          </div>

          <div class="overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
            <Skeleton class="h-44 w-full rounded-none sm:h-56" />
            <div class="grid grid-cols-2 gap-4 border-t border-rule px-4 py-3 sm:grid-cols-4">
              <div v-for="i in 4" :key="i" class="text-center">
                <Skeleton class="mx-auto h-4 w-14" />
                <Skeleton class="mx-auto mt-2 h-2.5 w-10" />
              </div>
            </div>
          </div>

          <div class="rounded-card border border-rule bg-surface p-5 shadow-e1">
            <div class="flex items-center justify-between gap-3">
              <Skeleton class="h-2.5 w-24" />
              <Skeleton class="h-2.5 w-20" />
            </div>
            <div class="mt-4 flex flex-col gap-3">
              <div v-for="i in rows" :key="i" class="flex items-center gap-3">
                <Skeleton class="h-9 w-9 shrink-0 rounded-btn" />
                <div class="min-w-0 flex-1">
                  <Skeleton class="h-3 w-2/5" />
                  <Skeleton class="mt-1.5 h-2.5 w-1/4" />
                </div>
                <Skeleton class="hidden h-3 w-16 shrink-0 sm:block" />
                <Skeleton class="h-5 w-20 shrink-0 rounded-chip" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- kanban board -->
    <template v-else-if="variant === 'board'">
      <div class="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div v-for="i in 4" :key="i" class="rounded-card border border-rule bg-surface px-4 py-3 shadow-e1">
          <Skeleton class="h-2.5 w-20" />
          <Skeleton class="mt-2 h-5 w-10" />
        </div>
      </div>

      <div class="mb-4 flex flex-wrap items-center gap-2">
        <Skeleton v-for="i in 6" :key="i" class="h-7 w-20 rounded-chip" />
        <Skeleton class="ml-auto h-2.5 w-16" />
      </div>

      <div class="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        <div v-for="column in 5" :key="column" class="w-65 shrink-0 rounded-card border border-rule bg-alt/70 p-3">
          <div class="flex items-center justify-between gap-2">
            <Skeleton class="h-2.5 w-24" />
            <Skeleton class="h-5 w-7 rounded-chip" />
          </div>
          <div class="mt-3 flex flex-col gap-2.5">
            <div v-for="card in 2" :key="card" class="rounded-card border border-rule bg-surface p-3 shadow-e1">
              <Skeleton class="h-3 w-4/5" />
              <Skeleton class="mt-2 h-2.5 w-1/2" />
              <Skeleton class="mt-3 h-1.5 w-full rounded-full" />
              <div class="mt-3 flex items-center justify-between gap-2">
                <Skeleton class="h-5 w-16 rounded-chip" />
                <Skeleton shape="circle" class="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- section rail + form sections -->
    <template v-else-if="variant === 'settings'">
      <div class="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
        <div class="flex flex-col gap-2 lg:sticky lg:top-28">
          <div class="flex gap-1.5 overflow-hidden lg:flex-col lg:rounded-card lg:border lg:border-rule lg:bg-surface lg:p-2 lg:shadow-e1">
            <Skeleton v-for="i in 4" :key="i" class="h-9 w-full rounded-btn" />
          </div>
          <div class="hidden rounded-card border border-rule bg-surface p-4 shadow-e1 lg:block">
            <Skeleton class="h-2.5 w-20" />
            <Skeleton v-for="i in 3" :key="i" class="mt-3 h-2.5 w-full" />
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <section v-for="section in 3" :key="section" class="rounded-card border border-rule bg-surface p-5 shadow-e1">
            <div class="flex items-center justify-between gap-3">
              <Skeleton class="h-2.5 w-28" />
              <Skeleton class="h-5 w-16 rounded-chip" />
            </div>
            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div v-for="field in 4" :key="field">
                <Skeleton class="h-2.5 w-20" />
                <Skeleton class="mt-2 h-11 w-full rounded-btn" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>

    <!-- stepper + form -->
    <template v-else-if="variant === 'form'">
      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div class="rounded-card border border-rule bg-surface shadow-e1">
          <div class="flex items-stretch gap-2 border-b border-rule px-4 py-4 sm:px-6">
            <div v-for="i in 3" :key="i" class="flex flex-1 items-center gap-2">
              <Skeleton shape="circle" class="h-7 w-7 shrink-0" />
              <div class="min-w-0 flex-1">
                <Skeleton class="h-2.5 w-4/5" />
                <Skeleton class="mt-1.5 hidden h-2 w-3/5 sm:block" />
              </div>
              <Skeleton v-if="i < 3" class="hidden h-px w-8 sm:block" />
            </div>
          </div>

          <div class="p-5 sm:p-6">
            <Skeleton class="h-2.5 w-24" />
            <Skeleton class="mt-3 h-14 w-full rounded-btn" />
            <Skeleton class="mt-6 h-2.5 w-40" />
            <div class="mt-3 flex flex-wrap gap-2">
              <Skeleton v-for="i in 6" :key="i" class="h-8 w-20 rounded-chip" />
            </div>
            <Skeleton class="mt-6 h-2.5 w-32" />
            <div class="mt-3 grid gap-2 sm:grid-cols-3">
              <Skeleton v-for="i in 3" :key="i" class="h-20 w-full rounded-btn" />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div v-for="i in 2" :key="i" class="rounded-card border border-rule bg-surface p-5 shadow-e1">
            <Skeleton class="h-2.5 w-28" />
            <Skeleton class="mt-3.5 h-3 w-full" />
            <Skeleton class="mt-2 h-3 w-4/5" />
            <Skeleton class="mt-2 h-3 w-3/5" />
            <Skeleton class="mt-4 h-9 w-32 rounded-btn" />
          </div>
        </div>
      </div>
    </template>

    <!-- filter + card grid -->
    <template v-else-if="variant === 'cards'">
      <div class="mb-5 flex flex-col gap-3 rounded-card border border-rule bg-surface p-4 shadow-e1 lg:flex-row lg:items-center">
        <Skeleton class="h-11 w-full rounded-btn lg:w-80" />
        <div class="flex flex-1 flex-wrap gap-1.5">
          <Skeleton v-for="i in 4" :key="i" class="h-7 w-20 rounded-chip" />
        </div>
        <Skeleton class="h-2.5 w-20" />
      </div>

      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div v-for="i in cards" :key="i" class="overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
          <Skeleton class="h-32 w-full rounded-none" />
          <div class="p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <Skeleton class="h-3.5 w-2/3" />
                <Skeleton class="mt-2 h-2.5 w-1/2" />
              </div>
              <Skeleton class="h-5 w-14 rounded-chip" />
            </div>
            <div class="mt-4 flex gap-1.5">
              <Skeleton class="h-5 w-16 rounded-chip" />
              <Skeleton class="h-5 w-20 rounded-chip" />
              <Skeleton class="h-5 w-12 rounded-chip" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- stacked list + side rail -->
    <template v-else-if="variant === 'list'">
      <div class="mb-5 grid gap-3 sm:grid-cols-3">
        <div v-for="i in 3" :key="i" class="rounded-card border border-rule bg-surface p-4 shadow-e1">
          <Skeleton class="h-2.5 w-20" />
          <Skeleton class="mt-3 h-6 w-14" />
          <Skeleton class="mt-2 h-2.5 w-28" />
        </div>
      </div>

      <div class="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div>
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <Skeleton v-for="i in 3" :key="i" class="h-7 w-20 rounded-chip" />
            <Skeleton class="ml-auto h-2.5 w-16" />
          </div>
          <div class="flex flex-col gap-2.5">
            <div v-for="i in rows" :key="i" class="rounded-card border border-rule bg-surface p-4 shadow-e1">
              <div class="flex items-start justify-between gap-3">
                <Skeleton class="h-3.5 w-1/2" />
                <Skeleton class="h-5 w-20 shrink-0 rounded-chip" />
              </div>
              <Skeleton class="mt-2.5 h-2.5 w-2/3" />
              <Skeleton class="mt-2.5 h-3 w-full" />
              <Skeleton class="mt-1.5 h-3 w-1/2" />
              <Skeleton class="mt-3 h-1.5 w-full rounded-full" />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div v-for="i in 2" :key="i" class="rounded-card border border-rule bg-surface p-5 shadow-e1">
            <Skeleton class="h-2.5 w-28" />
            <Skeleton class="mt-4 h-3 w-full" />
            <Skeleton class="mt-2 h-3 w-4/5" />
            <Skeleton class="mt-2 h-3 w-3/5" />
            <Skeleton class="mt-4 h-9 w-36 rounded-btn" />
          </div>
        </div>
      </div>
    </template>

    <!-- stats + filter + table -->
    <template v-else>
      <div class="mb-3 grid gap-3 sm:grid-cols-3">
        <div v-for="i in 3" :key="i" class="rounded-card border border-rule bg-surface p-4 shadow-e1">
          <Skeleton class="h-2.5 w-24" />
          <Skeleton class="mt-3 h-6 w-16" />
          <Skeleton class="mt-2 h-2.5 w-28" />
        </div>
      </div>

      <div class="mb-3 flex flex-col gap-3 rounded-card border border-rule bg-surface p-4 shadow-e1 lg:flex-row lg:items-center">
        <Skeleton class="h-11 w-full rounded-btn lg:w-80" />
        <div class="flex flex-1 flex-wrap gap-1.5">
          <Skeleton v-for="i in 4" :key="i" class="h-7 w-20 rounded-chip" />
        </div>
        <Skeleton class="h-2.5 w-20" />
      </div>

      <div class="overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
        <div class="flex items-center gap-4 border-b border-rule bg-alt px-4 py-3">
          <Skeleton v-for="i in 5" :key="i" class="h-2.5 flex-1" />
        </div>
        <div v-for="i in rows" :key="i" class="flex items-center gap-4 border-b border-rule px-4 py-4 last:border-0">
          <Skeleton v-for="j in 5" :key="j" class="h-3 flex-1" />
        </div>
      </div>
    </template>
  </div>
</template>
