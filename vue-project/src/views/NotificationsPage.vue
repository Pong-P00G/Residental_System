<script setup>
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'

const store = useAppStore()
const filter = ref('All')
const filters = ['All', 'Unread']

const rows = computed(() => (filter.value === 'Unread' ? store.notificationList.filter((item) => !item.read) : store.notificationList))
const unread = computed(() => store.notificationList.filter((item) => !item.read).length)

const toneClass = (tone) =>
  ({ warn: 'border-attention-bd bg-attention-bg text-attention', ok: 'border-settled-bd bg-settled-bg text-settled', progress: 'border-progress-bd bg-progress-bg text-progress' })[
    tone
  ] || 'border-fyi-bd bg-fyi-bg text-fyi'

function open(item) {
  store.markRead(item.id)
}
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Account"
      title="Notifications"
      :description="`${unread} unread · payment, repair and building updates in one inbox.`"
    >
      <template #actions>
        <Btn v-if="unread" variant="ghost" size="sm" @click="store.markAllRead">
          <Icon name="check" :size="15" /> Mark all read
        </Btn>
      </template>
    </PageHeader>

    <div class="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
      <div>
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <button
            v-for="option in filters"
            :key="option"
            type="button"
            class="rounded-chip border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.07em] transition"
            :class="filter === option ? 'border-navy-800 bg-navy-800 text-white' : 'border-fyi-bd bg-fyi-bg text-fyi hover:border-navy-300'"
            @click="filter = option"
          >
            {{ option }}<template v-if="option === 'Unread'"> · {{ unread }}</template>
          </button>
          <span class="ml-auto font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ rows.length }} shown</span>
        </div>

        <div v-if="rows.length" class="flex flex-col gap-2.5">
          <RouterLink
            v-for="item in rows"
            :key="item.id"
            :to="item.to"
            class="group relative flex gap-3 rounded-card border bg-surface p-4 shadow-e1 transition hover:border-navy-300"
            :class="item.read ? 'border-rule' : 'border-navy-300 bg-navy-50/40'"
            @click="open(item)"
          >
            <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" :class="item.read ? 'bg-rule-2' : 'bg-navy-800'"></span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex h-5 items-center rounded-chip border px-2 font-mono text-[9px] font-semibold uppercase tracking-[0.07em]" :class="toneClass(item.tone)">
                  {{ item.kind }}
                </span>
                <span class="font-mono text-[10px] text-ink-3">{{ item.at }}</span>
                <span v-if="!item.read" class="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-navy-600">New</span>
              </div>
              <b class="mt-1 block text-[13.5px] font-semibold leading-snug">{{ item.title }}</b>
              <p class="mt-0.5 text-[12.5px] leading-relaxed text-ink-2">{{ item.body }}</p>
            </div>
            <Icon name="chevron" :size="15" class="mt-1 shrink-0 text-ink-3 transition group-hover:translate-x-0.5" />
          </RouterLink>
        </div>

        <div v-else class="rounded-card border border-rule bg-surface p-8 text-center shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Inbox clear</p>
          <p class="mt-1.5 text-sm text-ink-2">Nothing unread. New updates about payments, repairs and the building will appear here.</p>
          <Btn to="/my-requests" variant="ghost" size="sm" class="mt-4">Open my requests</Btn>
        </div>
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">What we send</p>
          <ul class="mt-3 space-y-2 text-[12px] leading-relaxed text-ink-2">
            <li class="flex gap-2"><Icon name="check" :size="14" class="mt-0.5 shrink-0 text-settled" /> Statement issued and payment cleared</li>
            <li class="flex gap-2"><Icon name="check" :size="14" class="mt-0.5 shrink-0 text-settled" /> Repair triage, vendor assignment and arrival window</li>
            <li class="flex gap-2"><Icon name="check" :size="14" class="mt-0.5 shrink-0 text-settled" /> Building works that need access or storage</li>
            <li class="flex gap-2"><Icon name="check" :size="14" class="mt-0.5 shrink-0 text-settled" /> Lease dates and renewal windows</li>
          </ul>
          <p class="mt-3 border-t border-dashed border-rule pt-3 text-[11px] leading-relaxed text-ink-3">
            We never send marketing. Change the channels on your profile at any time.
          </p>
          <Btn to="/profile" variant="ghost" size="sm" block class="mt-3">Contact preferences</Btn>
        </section>

        <section class="rounded-card border border-progress-bd bg-progress-bg p-4 text-[12px] leading-relaxed text-navy-800">
          <p class="font-semibold">Need it in writing?</p>
          <p class="mt-1">Every notification links to the record it came from — statement, request, lease or document.</p>
        </section>
      </aside>
    </div>
  </div>
</template>
