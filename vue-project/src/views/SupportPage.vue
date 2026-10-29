<script setup>
import { ref } from 'vue'
import { org, supportContacts, supportTopics } from '@/data/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'
import PlateDrawing from '@/components/PlateDrawing.vue'

const openTopic = ref('payments')

function toggle(id) {
  openTopic.value = openTopic.value === id ? '' : id
}
</script>

<template>
  <div>
    <PageHeader eyebrow="Help" title="Support" description="Talk to the people who actually manage your home — no call centre, no ticket black hole.">
      <template #actions>
        <Btn to="/new-request" size="sm">
          <Icon name="wrench" :size="15" />
          Report a repair
        </Btn>
      </template>
    </PageHeader>

    <div class="grid gap-3 md:grid-cols-3">
      <a
        v-for="contact in supportContacts"
        :key="contact.id"
        :href="contact.href"
        class="group flex flex-col rounded-card border border-rule bg-surface p-5 shadow-e1 transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-e2"
      >
        <span class="grid h-10 w-10 place-items-center rounded-lg" :class="contact.id === 'emergency' ? 'bg-signal-bg text-signal' : 'bg-navy-50 text-navy-800'">
          <Icon :name="contact.icon" :size="19" />
        </span>
        <b class="mt-3 text-[13.5px] font-semibold">{{ contact.title }}</b>
        <span class="mt-0.5 text-[11.5px] leading-relaxed text-ink-2">{{ contact.detail }}</span>
        <span class="mt-3 font-mono text-[13px] font-semibold" :class="contact.id === 'emergency' ? 'text-signal' : 'text-navy-800'">{{ contact.value }}</span>
        <span class="mt-0.5 text-[10.5px] text-ink-3">{{ contact.meta }}</span>
      </a>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
        <div class="flex items-center justify-between gap-3">
          <h2 class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Common questions</h2>
          <Chip tone="neutral">{{ supportTopics.length }} topics</Chip>
        </div>
        <div class="mt-2 divide-y divide-rule">
          <div v-for="topic in supportTopics" :key="topic.id">
            <button
              type="button"
              class="flex w-full items-center gap-3 py-3.5 text-left"
              :aria-expanded="openTopic === topic.id"
              @click="toggle(topic.id)"
            >
              <b class="flex-1 text-[13px] font-semibold">{{ topic.title }}</b>
              <Icon name="chevron" :size="15" class="shrink-0 text-ink-3 transition" :class="{ 'rotate-90': openTopic === topic.id }" />
            </button>
            <p v-if="openTopic === topic.id" class="pb-4 pr-6 text-[12.5px] leading-relaxed text-ink-2">{{ topic.body }}</p>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-3 rounded-btn border border-rule bg-alt p-4">
          <div class="min-w-0 flex-1">
            <b class="block text-[12.5px] font-semibold">Still stuck?</b>
            <span class="block text-[11.5px] text-ink-2">Send the details and we will answer within {{ org.reply }}.</span>
          </div>
          <Btn :to="`mailto:${org.email}`" variant="ghost" size="sm">
            <Icon name="message" :size="14" />
            Email the team
          </Btn>
        </div>
      </section>

      <aside class="flex flex-col gap-4">
        <section class="overflow-hidden rounded-card border border-rule bg-surface shadow-e1">
          <PlateDrawing type="map" />
          <div class="border-t border-rule p-5">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Tenancy desk</p>
            <p class="mt-1 text-sm font-semibold">{{ org.name }}</p>
            <p class="mt-0.5 text-[12px] text-ink-2">{{ org.address }}</p>
            <dl class="mt-3 space-y-1.5 border-t border-dashed border-rule pt-3 text-[12px]">
              <div class="flex justify-between gap-3"><dt class="text-ink-3">Opening hours</dt><dd class="font-medium">{{ org.hours }}</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-ink-3">Walk-ins</dt><dd class="font-medium">By appointment</dd></div>
              <div class="flex justify-between gap-3"><dt class="text-ink-3">Replies</dt><dd class="font-medium">Within {{ org.reply }}</dd></div>
            </dl>
          </div>
        </section>

        <section class="rounded-card border border-signal-bd bg-signal-bg p-5">
          <div class="flex items-start gap-2.5">
            <Icon name="alert" :size="17" class="mt-0.5 shrink-0 text-signal" />
            <div>
              <p class="text-[13px] font-semibold text-signal">Out of hours emergency</p>
              <p class="mt-1 text-[12px] leading-relaxed text-signal/85">
                Gas leaks, flooding, fire damage or a total loss of heating. Call {{ org.emergency }} — answered 24 hours a day.
              </p>
            </div>
          </div>
        </section>
      </aside>
    </div>

    <section class="mt-6 flex flex-col items-start justify-between gap-4 rounded-card bg-navy-900 p-6 text-white shadow-e2 sm:flex-row sm:items-center">
      <div>
        <p class="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/50">Already reported something?</p>
        <h2 class="mt-1.5 text-lg font-bold tracking-[-0.025em]">Follow the repair instead of chasing it.</h2>
        <p class="mt-1 text-[12.5px] text-white/65">The request page shows the vendor, the arrival window and how much of the response promise is left.</p>
      </div>
      <Btn to="/my-requests" variant="light" size="sm">Track my requests</Btn>
    </section>
  </div>
</template>
