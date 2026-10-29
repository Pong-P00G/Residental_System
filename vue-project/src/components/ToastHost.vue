<script setup>
import { useAppStore } from '../stores/app'


const store = useAppStore()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-4 z-60 flex flex-col items-center gap-2 px-4">
    <div
      v-for="toast in store.toasts"
      :key="toast.id"
      class="pointer-events-auto max-w-md rounded-btn bg-navy-900 px-4 py-2.5 text-[12.5px] font-medium text-white shadow-e2"
      role="status"
    >
      {{ toast.message }}
    </div>
  </div>
</template>
