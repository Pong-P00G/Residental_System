<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { org, residentOfUnit, unitById, unitName } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Field from '@/components/Field.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const router = useRouter()
const store = useAppStore()
const { loading } = usePageLoading()

const myUnit = computed(() => unitById('u-4b'))
const tenant = computed(() => residentOfUnit('u-4b'))

const categories = ['Plumbing', 'Heating', 'Electric', 'Appliances', 'Building', 'General']
const urgencies = [
  { id: 'Routine', title: 'Routine', meta: '3 working days · no danger or damage' },
  { id: 'Urgent', title: 'Urgent', meta: '24 hours · heating, hot water, security' },
  { id: 'Safety', title: 'Safety', meta: '8 hours · gas, flooding, electrical danger' },
]

const steps = [
  { title: 'Category', meta: 'What and how urgent' },
  { title: 'Details', meta: 'Describe and attach' },
  { title: 'Review', meta: 'Check and submit' },
]

const step = ref(0)
const category = ref('Plumbing')
const urgency = ref('Routine')
const title = ref('')
const description = ref('')
const photos = ref(0)
const error = ref('')

const urgencyMeta = computed(() => urgencies.find((option) => option.id === urgency.value))

function addPhoto() {
  photos.value = Math.min(photos.value + 1, 4)
}

function next() {
  if (step.value === 1 && description.value.trim().length < 12) {
    error.value = 'Describe the problem in a sentence or two so the vendor arrives prepared.'
    return
  }
  error.value = ''
  step.value = Math.min(step.value + 1, steps.length - 1)
}

function back() {
  error.value = ''
  step.value = Math.max(step.value - 1, 0)
}

function submit() {
  if (description.value.trim().length < 12) {
    step.value = 1
    error.value = 'Describe the problem in a sentence or two so the vendor arrives prepared.'
    return
  }
  error.value = ''
  const request = store.submitRequest({
    title: title.value.trim(),
    category: category.value,
    urgency: urgency.value,
    description: description.value.trim(),
    photos: photos.value,
    unitId: myUnit.value.id,
  })
  router.push(`/requests/${request.id}`)
}
</script>

<template>
  <PageSkeleton v-if="loading" variant="form" />
  <div v-else>
    <PageHeader
      eyebrow="Support"
      title="New request"
      description="Three short steps. Your address, tenancy and contact details are already on the record."
      back="/my-requests"
    />

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div class="rounded-card border border-rule bg-surface shadow-e1">
        <!-- stepper -->
        <ol class="flex items-stretch gap-1 border-b border-rule px-4 py-4 sm:gap-2 sm:px-6">
          <li v-for="(item, index) in steps" :key="item.title" class="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
            <span
              class="grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-[10.5px] font-semibold transition"
              :class="
                index < step
                  ? 'border-settled bg-settled text-white'
                  : index === step
                    ? 'border-navy-800 bg-navy-800 text-white'
                    : 'border-rule-2 bg-surface text-ink-3'
              "
            >
              <Icon v-if="index < step" name="check" :size="13" />
              <template v-else>{{ index + 1 }}</template>
            </span>
            <span class="min-w-0">
              <b class="block truncate text-[12px] font-semibold" :class="index === step ? 'text-ink' : 'text-ink-2'">{{ item.title }}</b>
              <span class="hidden truncate text-[10px] text-ink-3 sm:block">{{ item.meta }}</span>
            </span>
            <span v-if="index < steps.length - 1" class="ml-auto hidden h-px flex-1 bg-rule sm:block" aria-hidden="true" />
          </li>
        </ol>

        <div class="p-5 sm:p-6">
          <!-- step 1 -->
          <section v-if="step === 0">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">The home</p>
            <div class="mt-2 flex items-center gap-3 rounded-btn border border-rule bg-alt px-3.5 py-3">
              <span class="grid h-10 w-10 place-items-center rounded-lg border border-navy-100 bg-surface font-mono text-[12px] font-semibold text-navy-800">
                {{ myUnit.label }}
              </span>
              <div class="min-w-0 flex-1">
                <b class="block text-[13px] font-semibold">{{ unitName(myUnit.id) }}</b>
                <span class="block text-[11.5px] text-ink-2">{{ tenant?.name }} · tenant since {{ tenant?.since }}</span>
              </div>
              <Icon name="key" :size="16" class="text-ink-3" />
            </div>

            <p class="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">What kind of problem is it?</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <button
                v-for="option in categories"
                :key="option"
                type="button"
                class="h-8 rounded-chip border px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] transition"
                :class="category === option ? 'border-navy-800 bg-navy-800 text-white' : 'border-rule-2 bg-surface text-ink-2 hover:border-navy-300'"
                @click="category = option"
              >
                {{ option }}
              </button>
            </div>

            <p class="mt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">How urgent is it?</p>
            <div class="mt-2 grid gap-2 sm:grid-cols-3">
              <button
                v-for="option in urgencies"
                :key="option.id"
                type="button"
                class="rounded-btn border p-3 text-left transition"
                :class="urgency === option.id ? 'border-navy-800 ring-2 ring-navy-800/10' : 'border-rule-2 hover:border-navy-300'"
                @click="urgency = option.id"
              >
                <span class="flex items-center gap-2">
                  <span class="h-3.5 w-3.5 rounded-full border-2" :class="urgency === option.id ? 'border-[4px] border-navy-800' : 'border-rule-2'" />
                  <b class="text-[12.5px] font-semibold">{{ option.title }}</b>
                </span>
                <span class="mt-1 block text-[10.5px] leading-snug text-ink-3">{{ option.meta }}</span>
              </button>
            </div>
          </section>

          <!-- step 2 -->
          <section v-else-if="step === 1" class="flex flex-col gap-4">
            <Field v-model="title" label="Short title" placeholder="Water leak under the kitchen sink" />
            <Field
              v-model="description"
              label="Describe it"
              textarea
              :rows="5"
              placeholder="Water is pooling under the kitchen sink, roughly a cup every hour. The cabinet base is starting to swell."
              :error="error"
            />

            <div class="flex items-center justify-between gap-3 rounded-btn border border-dashed border-rule-2 px-3.5 py-3">
              <div>
                <b class="block text-[12.5px] font-semibold">Photos</b>
                <span class="block text-[11px] text-ink-3">Up to 4 · a picture saves a second visit</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-[11px] text-ink-3">{{ photos }}/4</span>
                <button
                  type="button"
                  class="inline-flex h-9 items-center gap-1.5 rounded-btn border border-rule-2 bg-surface px-3 text-[11.5px] font-semibold text-ink transition hover:bg-navy-50 disabled:opacity-50"
                  :disabled="photos >= 4"
                  @click="addPhoto"
                >
                  <Icon name="camera" :size="14" /> Add photo
                </button>
              </div>
            </div>
          </section>

          <!-- step 3 -->
          <section v-else>
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Review before sending</p>
            <dl class="mt-3 divide-y divide-rule rounded-btn border border-rule">
              <div class="flex items-start justify-between gap-4 px-3.5 py-2.5">
                <dt class="text-[11.5px] text-ink-3">Home</dt>
                <dd class="text-right text-[12.5px] font-medium">{{ unitName(myUnit.id) }}</dd>
              </div>
              <div class="flex items-start justify-between gap-4 px-3.5 py-2.5">
                <dt class="text-[11.5px] text-ink-3">Category</dt>
                <dd class="text-right text-[12.5px] font-medium">{{ category }}</dd>
              </div>
              <div class="flex items-start justify-between gap-4 px-3.5 py-2.5">
                <dt class="text-[11.5px] text-ink-3">Urgency</dt>
                <dd class="text-right text-[12.5px] font-medium">{{ urgency }} · {{ urgencyMeta.meta }}</dd>
              </div>
              <div class="flex items-start justify-between gap-4 px-3.5 py-2.5">
                <dt class="text-[11.5px] text-ink-3">Title</dt>
                <dd class="text-right text-[12.5px] font-medium">{{ title || '—' }}</dd>
              </div>
              <div class="px-3.5 py-2.5">
                <dt class="text-[11.5px] text-ink-3">Description</dt>
                <dd class="mt-1 text-[12.5px] leading-relaxed text-ink-2">{{ description }}</dd>
              </div>
              <div class="flex items-start justify-between gap-4 px-3.5 py-2.5">
                <dt class="text-[11.5px] text-ink-3">Photos</dt>
                <dd class="text-right text-[12.5px] font-medium">{{ photos }} attached</dd>
              </div>
            </dl>
            <p class="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-ink-3">
              <Icon name="info" :size="13" class="mt-px shrink-0" />
              Submitting notifies the tenancy team with the response target for this urgency.
            </p>
          </section>
        </div>

        <div class="flex flex-wrap items-center gap-2 border-t border-rule px-4 py-4 sm:px-6">
          <Btn v-if="step > 0" variant="ghost" @click="back">
            <Icon name="back" :size="15" />
            Back
          </Btn>
          <Btn v-if="step < steps.length - 1" @click="next">
            Continue
            <Icon name="chevron" :size="15" />
          </Btn>
          <Btn v-else @click="submit">
            Submit request
            <Icon name="check" :size="15" />
          </Btn>
          <RouterLink to="/my-requests" class="ml-auto text-[11.5px] font-semibold text-ink-2 hover:text-navy-800">Cancel</RouterLink>
        </div>
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">What happens next</p>
          <ol class="mt-3 space-y-3">
            <li class="flex gap-2.5">
              <span class="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy-100 font-mono text-[9.5px] font-semibold text-navy-800">1</span>
              <span class="text-[12px] leading-relaxed text-ink-2">We triage it and confirm the response target straight away.</span>
            </li>
            <li class="flex gap-2.5">
              <span class="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy-100 font-mono text-[9.5px] font-semibold text-navy-800">2</span>
              <span class="text-[12px] leading-relaxed text-ink-2">A named vendor is assigned and you get the arrival window by SMS.</span>
            </li>
            <li class="flex gap-2.5">
              <span class="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy-100 font-mono text-[9.5px] font-semibold text-navy-800">3</span>
              <span class="text-[12px] leading-relaxed text-ink-2">You confirm the fix, or we reopen it — the history follows the request.</span>
            </li>
          </ol>
        </section>

        <section class="rounded-card border border-signal-bd bg-signal-bg p-5">
          <div class="flex items-start gap-2.5">
            <Icon name="alert" :size="17" class="mt-0.5 shrink-0 text-signal" />
            <div>
              <p class="text-[13px] font-semibold text-signal">Smell gas or water coming through a ceiling?</p>
              <p class="mt-1 text-[12px] leading-relaxed text-signal/85">
                Do not use this form. Call the emergency line on {{ org.emergency }}. If you smell gas, leave the building and call the network operator first.
              </p>
              <a :href="`tel:${org.emergency.replace(/\s/g, '')}`" class="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-signal hover:underline">
                <Icon name="phone" :size="13" /> {{ org.emergency }}
              </a>
            </div>
          </div>
        </section>

        <p class="px-1 text-[11px] leading-relaxed text-ink-3">
          Requests are visible to the tenancy team and the assigned vendor only. Your balance and documents are never shared.
        </p>
      </aside>
    </div>
  </div>
</template>
