<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { properties, units } from '@/data/app'
import PageHeader from '@/components/PageHeader.vue'
import Field from '@/components/Field.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import PropertyCard from '@/components/PropertyCard.vue'

const route = useRoute()
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const kind = ref('All')
const onlyAvailable = ref(false)

watch(
  () => route.query.q,
  (value) => {
    query.value = typeof value === 'string' ? value : ''
  },
)

const kinds = ['All', 'Apartment block', 'House']
const availableUnits = computed(() => units.filter((unit) => unit.status === 'Vacant').length)

const results = computed(() => {
  const term = query.value.trim().toLowerCase()
  return properties.filter((property) => {
    if (kind.value !== 'All' && property.kind !== kind.value) return false
    if (onlyAvailable.value && !units.some((unit) => unit.propertyId === property.id && unit.status === 'Vacant')) return false
    if (!term) return true
    return [property.name, property.area, property.address, property.ref, property.kind]
      .join(' ')
      .toLowerCase()
      .includes(term)
  })
})

function reset() {
  query.value = ''
  kind.value = 'All'
  onlyAvailable.value = false
}
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Portfolio"
      title="Properties"
      :description="`${properties.length} properties managed directly by us — ${availableUnits} units free right now.`"
    >
      <template #actions>
        <Btn to="/support" variant="ghost" size="sm">Ask about a home</Btn>
      </template>
    </PageHeader>

    <div class="mb-5 flex flex-col gap-3 rounded-card border border-rule bg-surface p-4 shadow-e1 lg:flex-row lg:items-center">
      <div class="lg:w-80">
        <Field v-model="query" search placeholder="Street, area or reference" />
      </div>
      <div class="flex flex-1 flex-wrap gap-1.5">
        <button
          v-for="option in kinds"
          :key="option"
          type="button"
          class="h-7 rounded-chip border px-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] transition"
          :class="kind === option ? 'border-navy-800 bg-navy-800 text-white' : 'border-fyi-bd bg-fyi-bg text-fyi hover:border-navy-300'"
          @click="kind = option"
        >
          {{ option }}
        </button>
        <button
          type="button"
          class="h-7 rounded-chip border px-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] transition"
          :class="onlyAvailable ? 'border-settled bg-settled text-white' : 'border-settled-bd bg-settled-bg text-settled hover:border-settled'"
          @click="onlyAvailable = !onlyAvailable"
        >
          Available now
        </button>
      </div>
      <span class="font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ results.length }} shown</span>
    </div>

    <div v-if="results.length" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <PropertyCard v-for="property in results" :key="property.id" :property="property" />
    </div>

    <div v-else class="rounded-card border border-rule bg-surface p-8 text-center shadow-e1">
      <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">No properties match</p>
      <p class="mt-1.5 text-sm text-ink-2">Try a different area, or clear the filters to see the whole portfolio.</p>
      <Btn variant="ghost" size="sm" class="mt-4" @click="reset">Clear filters</Btn>
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-2 text-[11px] text-ink-3">
      <Chip tone="neutral">No fees to view</Chip>
      <Chip tone="neutral">Deposits protected</Chip>
      <Chip tone="neutral">Direct with the owner</Chip>
      <span>Rent shown is the monthly rent before the service fee shown on each unit.</span>
    </div>
  </div>
</template>
