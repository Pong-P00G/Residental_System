<script setup>
defineProps({
  label: { type: String, default: 'Records' },
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="xl:grid xl:grid-cols-[256px_minmax(0,1fr)] xl:items-start xl:gap-6">
    <!-- compact master strip on narrow screens -->
    <nav class="mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar xl:hidden" :aria-label="`${label} list`">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="shrink-0 rounded-chip border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] transition"
        :class="item.active ? 'border-navy-800 bg-navy-800 text-white' : 'border-rule-2 bg-surface text-ink-2 hover:border-navy-300'"
        :aria-current="item.active ? 'page' : undefined"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- master rail -->
    <aside class="hidden xl:sticky xl:top-28 xl:block xl:self-start">
      <div class="rounded-card border border-rule bg-surface p-2 shadow-e1">
        <p class="px-3 pb-1.5 pt-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">{{ label }}</p>
        <div class="max-h-[62vh] overflow-y-auto no-scrollbar">
          <RouterLink
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            class="mb-0.5 flex items-start gap-2.5 rounded-btn px-3 py-2.5 transition"
            :class="item.active ? 'bg-navy-50 text-navy-800' : 'text-ink-2 hover:bg-alt hover:text-ink'"
            :aria-current="item.active ? 'page' : undefined"
          >
            <span class="min-w-0 flex-1">
              <b class="block truncate text-[12.5px] font-semibold" :class="item.active ? 'text-navy-800' : 'text-ink'">{{ item.label }}</b>
              <span v-if="item.meta" class="mt-0.5 block truncate font-mono text-[10px] text-ink-3">{{ item.meta }}</span>
            </span>
            <span
              v-if="item.active"
              class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-800"
              aria-hidden="true"
            />
          </RouterLink>
        </div>
      </div>
      <slot name="aside" />
    </aside>

    <div class="min-w-0">
      <slot />
    </div>
  </div>
</template>
