<script setup>
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  empty: { type: String, default: 'Nothing to show yet.' },
  minWidth: { type: String, default: '720px' },
})

const cellSlot = (column) => `cell-${column.key}`
const alignClass = (column) => (column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left')
</script>

<template>
  <div class="overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
    <!-- phones: one labelled row per record instead of a sideways-scrolling table -->
    <ul v-if="rows.length" class="divide-y divide-rule sm:hidden">
      <li v-for="row in rows" :key="row[rowKey]" class="px-4 py-3.5">
        <div class="flex flex-col gap-1.5">
          <div
            v-for="column in columns"
            :key="column.key"
            class="flex items-start justify-between gap-3"
            :class="column.label ? '' : 'justify-end'"
          >
            <span
              v-if="column.label"
              class="shrink-0 pt-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ink-3"
            >
              {{ column.label }}
            </span>
            <span class="min-w-0 text-right text-[12.5px] text-ink-2" :class="alignClass(column)">
              <slot :name="cellSlot(column)" :row="row">{{ row[column.key] }}</slot>
            </span>
          </div>
        </div>
      </li>
    </ul>

    <div class="hidden overflow-x-auto sm:block">
      <table class="w-full border-collapse text-left" :style="{ minWidth }">
        <thead>
          <tr class="border-b border-rule bg-alt">
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="whitespace-nowrap px-4 py-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ink-3"
              :class="alignClass(column)"
              :style="column.width ? { width: column.width } : undefined"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row[rowKey]"
            class="border-b border-rule transition last:border-0 hover:bg-alt/70"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 align-middle text-[12.5px] text-ink-2"
              :class="alignClass(column)"
            >
              <slot :name="cellSlot(column)" :row="row">{{ row[column.key] }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!rows.length" class="border-t border-rule px-4 py-8 text-center">
      <p class="text-[12.5px] text-ink-3">{{ empty }}</p>
    </div>
  </div>
</template>
