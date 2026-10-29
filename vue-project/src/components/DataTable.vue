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
    <div class="overflow-x-auto">
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
