<script setup>
import { computed } from 'vue'
import { money, propertyUnits } from '@/data/app'
import PlateDrawing from './PlateDrawing.vue'
import Chip from './Chip.vue'
import Icon from './Icon.vue'

const props = defineProps({
  property: { type: Object, required: true },
})

const unitList = computed(() => propertyUnits(props.property.id))
const available = computed(() => unitList.value.filter((unit) => unit.status === 'Vacant'))
const rentFrom = computed(() => Math.min(...unitList.value.map((unit) => unit.rent)))
const beds = computed(() => Array.from(new Set(unitList.value.map((unit) => unit.beds))).sort((a, b) => a - b))
</script>

<template>
  <RouterLink
    :to="`/properties/${property.id}`"
    class="group flex flex-col overflow-hidden rounded-card border border-rule bg-surface shadow-e1 transition duration-150 hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-e2"
  >
    <div class="relative border-b border-rule">
      <PlateDrawing
        type="elevation"
        :variant="property.variant"
        :tint="property.tint"
        :label="property.plateLabel"
        :width-label="property.plateWidth"
      />
      <Chip class="absolute left-3 top-3" tone="neutral">{{ property.kind }}</Chip>
      <Chip v-if="available.length" class="absolute bottom-3 left-3" tone="ok">{{ available.length }} available</Chip>
      <Chip v-else class="absolute bottom-3 left-3" tone="warn">Waitlist only</Chip>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <span class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">{{ property.ref }} · {{ property.area }}</span>
      <h3 class="mt-1 text-lg font-semibold tracking-[-0.02em]">{{ property.name }}</h3>
      <p class="mt-0.5 text-[12.5px] leading-relaxed text-ink-2">{{ property.description }}</p>

      <dl class="mt-4 grid grid-cols-3 gap-2 border-t border-dashed border-rule pt-3 text-[11px]">
        <div>
          <dt class="text-ink-3">From</dt>
          <dd class="font-mono text-[13px] font-semibold">{{ money(rentFrom, 0) }}</dd>
        </div>
        <div>
          <dt class="text-ink-3">Units</dt>
          <dd class="font-mono text-[13px] font-semibold">{{ unitList.length }}</dd>
        </div>
        <div>
          <dt class="text-ink-3">Bedrooms</dt>
          <dd class="font-mono text-[13px] font-semibold">{{ beds[0] }}–{{ beds[beds.length - 1] }}</dd>
        </div>
      </dl>

      <span class="mt-4 flex items-center justify-between text-[11.5px] font-semibold text-navy-600">
        <span class="inline-flex items-center gap-1"><Icon name="map" :size="13" />{{ property.address }}</span>
        <Icon name="chevron" :size="15" class="transition group-hover:translate-x-0.5" />
      </span>
    </div>
  </RouterLink>
</template>
