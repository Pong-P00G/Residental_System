<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { money, org, properties, propertyById, propertyUnits, unitStatusTone } from '@/data/app'
import PageHeader from '@/components/PageHeader.vue'
import MasterDetail from '@/components/MasterDetail.vue'
import PlateDrawing from '@/components/PlateDrawing.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const route = useRoute()
const { loading } = usePageLoading()
const property = computed(() => propertyById(route.params.id))
const propertyUnitList = computed(() => (property.value ? propertyUnits(property.value.id) : []))
const free = computed(() => propertyUnitList.value.filter((unit) => unit.status === 'Vacant'))
const masterItems = computed(() =>
  properties.map((item) => ({
    to: `/properties/${item.id}`,
    label: item.name,
    meta: `${item.ref} · ${item.area}`,
    active: item.id === property.value?.id,
  })),
)
</script>

<template>
  <PageSkeleton v-if="loading" variant="detail" />
  <div v-else-if="property">
    <PageHeader
      :eyebrow="`${property.ref} · ${property.area}`"
      :title="property.name"
      :description="property.description"
      back="/properties"
    >
      <template #actions>
        <Chip tone="ok">{{ free.length }} available</Chip>
        <Btn to="/support" size="sm">Contact the team</Btn>
      </template>
    </PageHeader>

    <MasterDetail label="Portfolio" :items="masterItems">
      <div class="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
      <div class="flex flex-col gap-5">
        <div class="overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
          <PlateDrawing
            type="elevation"
            :variant="property.variant"
            :tint="property.tint"
            :label="property.plateLabel"
            :width-label="property.plateWidth"
          />
          <div class="grid grid-cols-2 divide-x divide-rule border-t border-rule sm:grid-cols-4">
            <div v-for="fact in [
              { value: property.kind, label: 'Type' },
              { value: property.built, label: 'Built' },
              { value: property.floors, label: 'Floors' },
              { value: `EPC ${property.epc}`, label: 'Rating' },
            ]" :key="fact.label" class="px-3 py-3 text-center">
              <b class="block font-mono text-[15px] font-semibold tracking-[-0.02em]">{{ fact.value }}</b>
              <span class="mt-0.5 block font-mono text-[9.5px] uppercase tracking-[0.04em] text-ink-3">{{ fact.label }}</span>
            </div>
          </div>
        </div>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Units</h2>
            <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">{{ propertyUnitList.length }} in this property</span>
          </div>

          <div class="mt-3 divide-y divide-rule">
            <RouterLink
              v-for="unit in propertyUnitList"
              :key="unit.id"
              :to="`/properties/${property.id}/units/${unit.id}`"
              class="group flex items-center gap-3 py-3.5 transition first:pt-1 hover:bg-alt/60"
            >
              <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-navy-100 bg-navy-50 font-mono text-[12px] font-semibold text-navy-800">
                {{ unit.label }}
              </span>
              <div class="min-w-0 flex-1">
                <b class="block truncate text-[13px] font-semibold">{{ unit.name }}</b>
                <span class="block truncate text-[11.5px] text-ink-2">
                  {{ unit.beds }} bed · {{ unit.baths }} bath · {{ unit.areaM2 }} m² · {{ unit.floor }}
                </span>
              </div>
              <div class="hidden text-right sm:block">
                <span class="block font-mono text-[13px] font-semibold">{{ money(unit.rent, 0) }}</span>
                <span class="block text-[10px] text-ink-3">per month</span>
              </div>
              <Chip :tone="unitStatusTone(unit.status)">{{ unit.status === 'Vacant' ? `From ${unit.availableFrom}` : unit.status }}</Chip>
              <Icon name="chevron" :size="15" class="shrink-0 text-ink-3 transition group-hover:translate-x-0.5" />
            </RouterLink>
          </div>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">What is included</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <Chip v-for="amenity in property.amenities" :key="amenity">{{ amenity }}</Chip>
          </div>
          <p class="mt-4 text-[13px] leading-relaxed text-ink-2">{{ property.condition }}</p>
        </section>
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Available now</h2>
          <div v-if="free.length" class="mt-3 flex flex-col gap-2">
            <RouterLink
              v-for="unit in free"
              :key="unit.id"
              :to="`/properties/${property.id}/units/${unit.id}`"
              class="flex items-center justify-between gap-3 rounded-btn border border-rule-2 px-3 py-2.5 transition hover:border-navy-300"
            >
              <span>
                <b class="block text-[12.5px] font-semibold">{{ unit.name }}</b>
                <span class="block text-[11px] text-ink-3">{{ unit.beds }} bed · {{ unit.areaM2 }} m²</span>
              </span>
              <span class="font-mono text-[12.5px] font-semibold">{{ money(unit.rent, 0) }}</span>
            </RouterLink>
          </div>
          <p v-else class="mt-2 text-[12.5px] leading-relaxed text-ink-2">
            Every unit is let. Ask the team to add you to the waiting list for the next vacancy.
          </p>
          <Btn to="/support" block class="mt-4">Ask about this property</Btn>
          <p class="mt-2 text-center text-[10.5px] text-ink-3">Viewings arranged directly, no agency fee.</p>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Managed by</h2>
          <p class="mt-2 text-sm font-semibold">{{ property.manager }}</p>
          <p class="text-[11.5px] text-ink-2">{{ org.name }}</p>
          <div class="mt-3 border-t border-dashed border-rule pt-3 text-[12px]">
            <a :href="org.phoneHref" class="flex items-center gap-2 font-medium text-ink-2 transition hover:text-navy-800">
              <Icon name="phone" :size="14" /> {{ org.phone }}
            </a>
            <a :href="`mailto:${org.email}`" class="mt-1.5 flex items-center gap-2 font-medium text-ink-2 transition hover:text-navy-800">
              <Icon name="message" :size="14" /> {{ org.email }}
            </a>
            <p class="mt-1.5 text-[10.5px] text-ink-3">{{ org.hours }}</p>
          </div>
        </section>
      </aside>
      </div>
    </MasterDetail>
  </div>

  <div v-else class="mx-auto max-w-lg rounded-card border border-rule bg-surface p-6 shadow-e1">
    <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Property not found</p>
    <p class="mt-2 text-[13px] text-ink-2">This reference is not in the portfolio. Everything currently managed is on the properties page.</p>
    <Btn to="/properties" class="mt-4">Back to properties</Btn>
  </div>
</template>
