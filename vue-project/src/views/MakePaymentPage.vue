<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { money, resident } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import Icon from '@/components/Icon.vue'

const router = useRouter()
const store = useAppStore()

const methods = [
  { id: 'visa', name: 'Visa ···· 4242', meta: 'Expires 09/28 · no fee' },
  { id: 'bank', name: 'Bank transfer', meta: '1 business day · no fee' },
  { id: 'apple', name: 'Apple Pay', meta: 'Fastest · confirmed instantly' },
]
const method = ref('visa')
const selected = computed(() => methods.find((option) => option.id === method.value))

function pay() {
  if (store.paidOff) {
    router.push('/my-payments')
    return
  }
  store.pay(selected.value.name)
  router.push('/my-payments')
}
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Payments"
      title="Make a payment"
      :description="`${store.statement.dueLabel} · Apartment 4B · ${resident.address}`"
      back="/my-payments"
    />

    <div class="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div class="flex flex-col gap-4">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <div class="flex items-center justify-between gap-3">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Amount</p>
            <Chip tone="neutral">{{ store.statement.periodLabel }}</Chip>
          </div>
          <p class="mt-1 font-mono text-[38px] font-semibold leading-none tracking-[-0.04em]">{{ money(store.balance) }}</p>
          <p class="mt-2 text-[12.5px] leading-relaxed text-ink-2">
            Rent, service fee, water and the October late notice — exactly as itemised on your statement. No card fee is added.
          </p>
        </section>

        <template v-if="!store.paidOff">
          <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
            <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Payment method</p>
            <div class="mt-3 flex flex-col gap-2">
              <button
                v-for="option in methods"
                :key="option.id"
                type="button"
                class="flex items-center gap-3 rounded-btn border px-3.5 py-3 text-left transition"
                :class="method === option.id ? 'border-navy-800 ring-2 ring-navy-800/10' : 'border-rule-2 hover:border-navy-300'"
                @click="method = option.id"
              >
                <span class="h-4 w-4 rounded-full border-2" :class="method === option.id ? 'border-[5px] border-navy-800' : 'border-rule-2'"></span>
                <span class="flex-1">
                  <b class="block text-sm font-semibold">{{ option.name }}</b>
                  <span class="block text-[11.5px] text-ink-2">{{ option.meta }}</span>
                </span>
                <Chip v-if="option.id === 'bank'" tone="ok">No fee</Chip>
              </button>
            </div>
          </section>

          <div class="flex items-start gap-2.5 rounded-card border border-progress-bd bg-progress-bg p-4 text-[12px] leading-relaxed text-navy-800">
            <Icon name="info" :size="16" class="mt-0.5 shrink-0" />
            <p>
              The payment is applied to the oldest open item first. Your receipt appears on My Payments and in documents the moment it clears.
            </p>
          </div>
        </template>

        <div v-else class="flex items-start gap-2.5 rounded-card border border-progress-bd bg-progress-bg p-4 text-[12.5px] leading-relaxed text-navy-800">
          <Icon name="check" :size="16" class="mt-0.5 shrink-0" />
          <p><b class="font-semibold text-navy-900">This statement is already settled.</b> Your receipt is on My Payments.</p>
        </div>
      </div>

      <aside class="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <section class="rounded-card border border-rule bg-surface p-5 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Summary</p>
          <dl class="mt-3 space-y-2 text-[12.5px]">
            <div class="flex justify-between gap-3"><dt class="text-ink-2">November statement</dt><dd class="font-mono">{{ money(store.statement.total) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-2">Already received</dt><dd class="font-mono">{{ money(store.statement.received) }}</dd></div>
            <div class="flex justify-between gap-3"><dt class="text-ink-2">Method</dt><dd class="font-mono">{{ selected.name }}</dd></div>
            <div class="flex justify-between gap-3 border-t border-rule-2 pt-2.5 text-sm font-bold"><dt>To pay</dt><dd class="font-mono">{{ money(store.balance) }}</dd></div>
          </dl>

          <Btn v-if="!store.paidOff" block class="mt-4" @click="pay">Pay {{ money(store.balance) }}</Btn>
          <Btn v-else to="/my-payments" block class="mt-4">Back to payments</Btn>

          <p class="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-ink-3">
            <Icon name="shield" :size="14" class="mt-0.5 shrink-0" />
            <span>Card details never touch our servers. The receipt is saved to your documents instantly.</span>
          </p>
        </section>

        <section class="rounded-card border border-rule bg-surface p-4 shadow-e1">
          <p class="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Payment reference</p>
          <p class="mt-1 font-mono text-[12.5px] font-semibold">{{ store.statement.reference }}</p>
          <p class="mt-1 text-[11px] leading-relaxed text-ink-3">Quote this if your bank needs to trace the transfer.</p>
        </section>
      </aside>
    </div>
  </div>
</template>
