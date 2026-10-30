<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { properties, units } from '@/data/app'
import PageHeader from '@/components/PageHeader.vue'
import Field from '@/components/Field.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import PropertyCard from '@/components/PropertyCard.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import Sheet from '@/components/Sheet.vue'
import Icon from '@/components/Icon.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const route = useRoute()
const { loading } = usePageLoading()

const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const kind = ref('All')
const onlyAvailable = ref(false)
const filtersOpen = ref(false)

watch(
  () => route.query.q,
  (value) => {
    query.value = typeof value === 'string' ? value : ''
  },
)

const kinds = ['All', 'Apartment block', 'House']
const availableUnits = computed(() => units.filter((unit) => unit.status === 'Vacant').length)
const activeFilters = computed(
  () => (kind.value !== 'All' ? 1 : 0) + (onlyAvailable.value ? 1 : 0) + (query.value.trim() ? 1 : 0),
)

const hasVacancy = (property) => units.some((unit) => unit.propertyId === property.id && unit.status === 'Vacant')
const countKind = (option) => (option === 'All' ? properties.length : properties.filter((property) => property.kind === option).length)

const results = computed(() => {
  const term = query.value.trim().toLowerCase()
  return properties.filter((property) => {
    if (kind.value !== 'All' && property.kind !== kind.value) return false
    if (onlyAvailable.value && !hasVacancy(property)) return false
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
  <PageSkeleton v-if="loading" variant="cards" :cards="6" />
  <div v-else>
    <PageHeader
      eyebrow="Portfolio"
      title="Properties"
      :description="`${properties.length} properties managed directly by us — ${availableUnits} units free right now.`"
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex h-9 items-center gap-2 rounded-btn border border-rule-2 bg-surface px-3.5 text-xs font-semibold text-ink transition hover:bg-navy-50 lg:hidden"
          :aria-expanded="filtersOpen"
          @click="filtersOpen = true"
        >
          <Icon name="filter" :size="15" />
          Filters
          <span v-if="activeFilters" class="grid h-4 min-w-4 place-items-center rounded-full bg-navy-800 px-1 font-mono text-[9px] text-white">
            {{ activeFilters }}
          </span>
        </button>
        <Btn to="/support" variant="ghost" size="sm">Ask about a home</Btn>
      </template>
    </PageHeader>

    <div class="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-6">
      <!-- filter sidebar -->
      <aside class="hidden lg:sticky lg:top-28 lg:block">
        <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
          <div class="flex items-center justify-between gap-2">
            <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Filters</p>
            <button v-if="activeFilters" type="button" class="text-[11px] font-semibold text-navy-600 hover:underline" @click="reset">
              Clear all
            </button>
          </div>

          <div class="mt-3">
            <Field v-model="query" search placeholder="Street, area or reference" />
          </div>

          <p class="mt-5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Property type</p>
          <div class="mt-2 flex flex-col gap-1">
            <button
              v-for="option in kinds"
              :key="option"
              type="button"
              class="flex items-center justify-between gap-2 rounded-btn px-2.5 py-2 text-left text-[12.5px] font-medium transition"
              :class="kind === option ? 'bg-navy-50 text-navy-800' : 'text-ink-2 hover:bg-alt hover:text-ink'"
              :aria-pressed="kind === option"
              @click="kind = option"
            >
              <span class="flex items-center gap-2">
                <span class="grid h-3.5 w-3.5 place-items-center rounded-full border" :class="kind === option ? 'border-[4px] border-navy-800' : 'border-rule-2'" />
                {{ option }}
              </span>
              <span class="font-mono text-[10px] text-ink-3">{{ countKind(option) }}</span>
            </button>
          </div>

          <div class="mt-5 border-t border-rule pt-4">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-btn border px-3 py-2.5 text-left transition"
              :class="onlyAvailable ? 'border-settled bg-settled-bg' : 'border-rule-2 hover:border-navy-300'"
              :aria-pressed="onlyAvailable"
              @click="onlyAvailable = !onlyAvailable"
            >
              <span>
                <b class="block text-[12px] font-semibold">Available now</b>
                <span class="block text-[10.5px] text-ink-3">{{ availableUnits }} units free</span>
              </span>
              <span class="relative h-5 w-9 shrink-0 rounded-full border transition" :class="onlyAvailable ? 'border-settled bg-settled' : 'border-rule-2 bg-fyi-bg'">
                <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all" :class="onlyAvailable ? 'left-[18px]' : 'left-0.5'" />
              </span>
            </button>
          </div>

          <p class="mt-4 rounded-btn bg-alt px-3 py-2.5 text-[10.5px] leading-relaxed text-ink-3">
            No fees to view. Deposits are protected and rent is paid directly to {{ 'Halden Property Group' }}.
          </p>
        </div>
      </aside>

      <div class="min-w-0">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p class="font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ results.length }} properties shown</p>
          <div class="flex flex-wrap items-center gap-1.5">
            <Chip v-if="kind !== 'All'" tone="neutral">{{ kind }}</Chip>
            <Chip v-if="onlyAvailable" tone="ok">Available now</Chip>
            <Chip v-if="query.trim()" tone="neutral">“{{ query.trim() }}”</Chip>
          </div>
        </div>

        <div v-if="results.length" class="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
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
          <span>Rent shown is the monthly rent before the service fee on each unit.</span>
        </div>
      </div>
    </div>

    <Sheet v-if="filtersOpen" eyebrow="Portfolio" title="Filter properties" subtitle="Narrow the portfolio, then close to see the results." @close="filtersOpen = false">
      <div class="flex flex-col gap-4">
        <Field v-model="query" search placeholder="Street, area or reference" />

        <div>
          <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Property type</p>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <button
              v-for="option in kinds"
              :key="option"
              type="button"
              class="rounded-chip border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] transition"
              :class="kind === option ? 'border-navy-800 bg-navy-800 text-white' : 'border-rule-2 bg-surface text-ink-2'"
              @click="kind = option"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <button
          type="button"
          class="flex items-center justify-between gap-3 rounded-btn border px-3 py-2.5 text-left transition"
          :class="onlyAvailable ? 'border-settled bg-settled-bg' : 'border-rule-2'"
          :aria-pressed="onlyAvailable"
          @click="onlyAvailable = !onlyAvailable"
        >
          <span>
            <b class="block text-[12px] font-semibold">Available now</b>
            <span class="block text-[10.5px] text-ink-3">{{ availableUnits }} units free</span>
          </span>
          <span class="relative h-5 w-9 shrink-0 rounded-full border transition" :class="onlyAvailable ? 'border-settled bg-settled' : 'border-rule-2 bg-fyi-bg'">
            <span class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all" :class="onlyAvailable ? 'left-[18px]' : 'left-0.5'" />
          </span>
        </button>

        <div class="flex items-center gap-2">
          <Btn block @click="filtersOpen = false">Show {{ results.length }} properties</Btn>
          <Btn variant="ghost" @click="reset">Clear</Btn>
        </div>
      </div>
    </Sheet>
  </div>
</template>
