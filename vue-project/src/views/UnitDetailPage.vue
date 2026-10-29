<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { money, org, propertyById, residentOfUnit, unitById, unitStatusTone } from '@/data/app'
import PageHeader from '@/components/PageHeader.vue'
import PlateDrawing from '@/components/PlateDrawing.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'

const route = useRoute()
const property = computed(() => propertyById(route.params.id))
const unit = computed(() => {
  const found = unitById(route.params.unitId)
  return found && found.propertyId === route.params.id ? found : null
})
const monthlyTotal = computed(() => (unit.value ? unit.value.rent + unit.value.serviceFee : 0))
const isFree = computed(() => unit.value?.status === 'Vacant')
const tenant = computed(() => (unit.value ? residentOfUnit(unit.value.id) : null))
</script>

<template>
  <div v-if="unit && property">
    <PageHeader :eyebrow="`${property.name} · Unit ${unit.label}`" :title="unit.name" :description="`${unit.beds} bedrooms · ${unit.baths} bathroom · ${unit.areaM2} m² · ${unit.floor}`" :back="`/properties/${property.id}`">
      <template #actions>
        <Chip :tone="unitStatusTone(unit.status)">{{ unit.status }}</Chip>
        <Btn v-if="isFree" to="/support" size="sm">Enquire about this unit</Btn>
        <Btn v-else to="/support" variant="ghost" size="sm">Join the waiting list</Btn>
      </template>
    </PageHeader>

    <div class="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
      <div class="flex flex-col gap-5">
        <div class="overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
          <PlateDrawing type="plan" :tint="unit.tint" :label="unit.plateLabel" />
          <div class="grid grid-cols-2 divide-x divide-rule border-t border-rule sm:grid-cols-4">
            <div v-for="fact in [
              { value: unit.beds, label: 'Bedrooms' },
              { value: unit.baths, label: 'Bathroom' },
              { value: unit.areaM2, label: 'm² usable' },
              { value: unit.floor, label: 'Level' },
            ]" :key="fact.label" class="px-3 py-3 text-center">
              <b class="block font-mono text-[15px] font-semibold tracking-[-0.02em]">{{ fact.value }}</b>
              <span class="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.04em] text-ink-3">{{ fact.label }}</span>
            </div>
          </div>
        </div>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Rooms</h2>
            <Chip tone="neutral">{{ unit.rooms.length }} spaces</Chip>
          </div>
          <dl class="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            <div v-for="room in unit.rooms" :key="room.name" class="flex items-baseline justify-between gap-3 border-b border-dashed border-rule py-1.5 text-[12.5px] last:border-0">
              <dt class="text-ink-2">{{ room.name }}</dt>
              <dd class="shrink-0 font-mono text-[11.5px] font-medium">{{ room.size }}</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Included</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <Chip v-for="feature in unit.features" :key="feature">{{ feature }}</Chip>
          </div>
          <p class="mt-4 text-[13px] leading-relaxed text-ink-2">{{ unit.condition }}</p>
        </section>

        <section class="flex flex-wrap items-start gap-3 rounded-card border border-progress-bd bg-progress-bg p-4 text-[12.5px] leading-relaxed text-navy-800">
          <Icon name="info" :size="16" class="mt-0.5 shrink-0" />
          <p>
            This unit is documented by {{ org.name }} rather than advertised through an agency. Rent, fees and
            availability are the live figures from the tenancy system.
          </p>
        </section>
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Monthly cost</h2>
            <Chip :tone="unitStatusTone(unit.status)">{{ unit.status }}</Chip>
          </div>
          <p class="mt-1 font-mono text-[30px] font-semibold leading-none tracking-[-0.04em]">
            {{ money(unit.rent, 0) }}<span class="text-xs font-normal text-ink-3">/month</span>
          </p>
          <p class="mt-1.5 text-[12px] text-ink-2">Rent before the building service fee.</p>

          <dl class="mt-4 space-y-2 border-t border-dashed border-rule pt-3 text-[12.5px]">
            <div class="flex justify-between gap-3"><dt class="text-ink-2">Service fee</dt><dd class="font-mono">{{ money(unit.serviceFee) }}</dd></div>
            <div class="flex justify-between gap-3 border-t border-rule pt-2 font-semibold"><dt>Monthly total</dt><dd class="font-mono">{{ money(monthlyTotal) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-2">Deposit</dt><dd class="font-mono">{{ money(unit.deposit) }}</dd></div>
            <div class="flex justify-between gap-3">
              <dt class="text-ink-2">Available</dt>
              <dd class="font-mono">{{ isFree ? unit.availableFrom || 'Now' : 'Occupied' }}</dd>
            </div>
          </dl>

          <div class="mt-5 flex flex-col gap-2">
            <Btn to="/support" block>{{ isFree ? 'Ask to view this unit' : 'Ask about the next vacancy' }}</Btn>
            <Btn :to="`/properties/${property.id}`" variant="ghost" block>Back to {{ property.name }}</Btn>
          </div>
          <p class="mt-3 text-center text-[10.5px] leading-relaxed text-ink-3">
            {{ isFree ? 'Viewings run 09:00–17:00, Monday to Saturday.' : 'The team will contact you when this unit is re-let.' }}
          </p>
        </section>

        <section v-if="tenant" class="rounded-card border border-rule bg-surface p-4 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Currently let to</p>
          <p class="mt-1.5 text-[13px] font-semibold">{{ tenant.name }}</p>
          <p class="text-[11.5px] text-ink-2">Tenant since {{ tenant.since }}</p>
          <p class="mt-2 text-[11px] text-ink-3">Contact details are private. All enquiries go through the tenancy team.</p>
        </section>
      </aside>
    </div>
  </div>

  <div v-else class="mx-auto max-w-lg rounded-card border border-rule bg-surface p-6 shadow-e1">
    <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Unit not found</p>
    <p class="mt-2 text-[13px] text-ink-2">This unit is not part of the property you opened, or it has been withdrawn from the lettings list.</p>
    <Btn to="/properties" class="mt-4">Back to properties</Btn>
  </div>
</template>
