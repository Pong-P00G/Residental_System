<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { org, residentOfUnit, unitById, unitName } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Field from '@/components/Field.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'

const router = useRouter()
const store = useAppStore()

const myUnit = computed(() => unitById('u-4b'))
const tenant = computed(() => residentOfUnit('u-4b'))

const categories = ['Plumbing', 'Heating', 'Electric', 'Appliances', 'Building', 'General']
const urgencies = [
  { id: 'Routine', title: 'Routine', meta: '3 working days · no danger or damage', tone: 'neutral' },
  { id: 'Urgent', title: 'Urgent', meta: '24 hours · heating, hot water, security', tone: 'warn' },
  { id: 'Safety', title: 'Safety', meta: '8 hours · gas, flooding, electrical danger', tone: 'crit' },
]

const category = ref('Plumbing')
const urgency = ref('Routine')
const title = ref('')
const description = ref('')
const photos = ref(0)
const error = ref('')

function addPhoto() {
  photos.value = Math.min(photos.value + 1, 4)
}

function submit() {
  if (description.value.trim().length < 12) {
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
  <div>
    <PageHeader
      eyebrow="Support"
      title="New request"
      description="Tell us what is wrong. You do not need to repeat your address, tenancy or contact details — they are already on the record."
      back="/my-requests"
    />

    <div class="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">The home</p>
            <span class="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-3">Already on file</span>
          </div>
          <div class="mt-3 flex items-center gap-3 rounded-btn border border-rule bg-alt px-3.5 py-3">
            <span class="grid h-10 w-10 place-items-center rounded-lg border border-navy-100 bg-surface font-mono text-[12px] font-semibold text-navy-800">
              {{ myUnit.label }}
            </span>
            <div class="min-w-0 flex-1">
              <b class="block text-[13px] font-semibold">{{ unitName(myUnit.id) }}</b>
              <span class="block text-[11.5px] text-ink-2">{{ tenant?.name }} · tenant since {{ tenant?.since }}</span>
            </div>
            <Icon name="key" :size="16" class="text-ink-3" />
          </div>
        </section>

        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">What kind of problem is it?</p>
          <div class="mt-3 flex flex-wrap gap-2">
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

          <div class="mt-5">
            <Field v-model="title" label="Short title" placeholder="Water leak under the kitchen sink" />
          </div>

          <div class="mt-4">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">How urgent is it?</p>
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
                  <span class="h-3.5 w-3.5 rounded-full border-2" :class="urgency === option.id ? 'border-[4px] border-navy-800' : 'border-rule-2'"></span>
                  <b class="text-[12.5px] font-semibold">{{ option.title }}</b>
                </span>
                <span class="mt-1 block text-[10.5px] leading-snug text-ink-3">{{ option.meta }}</span>
              </button>
            </div>
          </div>

          <div class="mt-4">
            <Field
              v-model="description"
              label="Describe it"
              textarea
              :rows="5"
              placeholder="Water is pooling under the kitchen sink, roughly a cup every hour. The cabinet base is starting to swell."
              :error="error"
            />
          </div>

          <div class="mt-4 flex items-center justify-between gap-3 rounded-btn border border-dashed border-rule-2 px-3.5 py-3">
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

        <div class="flex flex-wrap items-center gap-2">
          <Btn type="submit" size="md">Submit request</Btn>
          <Btn to="/my-requests" variant="ghost" size="md">Cancel</Btn>
          <span class="text-[11px] text-ink-3">You can reply to updates on the request page.</span>
        </div>
      </form>

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
              <a :href="`tel:${org.emergency.replace(/\\s/g, '')}`" class="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-signal hover:underline">
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
