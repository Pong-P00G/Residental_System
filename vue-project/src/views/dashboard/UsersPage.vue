<script setup>
import { computed, ref } from 'vue'
import { staff } from '@/data/app'
import { useAppStore } from '@/stores/app'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import Field from '@/components/Field.vue'
import Chip from '@/components/Chip.vue'
import Btn from '@/components/Btn.vue'
import DataTable from '@/components/DataTable.vue'
import Icon from '@/components/Icon.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { usePageLoading } from '@/composables/usePageLoading'

const store = useAppStore()
const { loading } = usePageLoading()
const query = ref('')
const role = ref('All')
const roles = ['All', 'Admin', 'Owner', 'Manager', 'Resident']

const columns = [
  { key: 'name', label: 'User' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'twoFactor', label: '2FA' },
  { key: 'lastActive', label: 'Last active' },
  { key: 'action', label: '', align: 'right' },
]

const rows = computed(() => {
  const term = query.value.trim().toLowerCase()
  return staff
    .filter((user) => (role.value === 'All' || user.role === role.value) && (!term || `${user.name} ${user.email}`.toLowerCase().includes(term)))
    .map((user) => ({ ...user }))
})

const roleTone = (value) => ({ Admin: 'progress', Owner: 'neutral', Manager: 'neutral', Resident: 'neutral' })[value] || 'neutral'
const statusTone = (value) => (value === 'Active' ? 'ok' : 'crit')
</script>

<template>
  <PageSkeleton v-if="loading" variant="table" :rows="6" />
  <div v-else>
    <PageHeader
      eyebrow="Administration"
      title="User management"
      description="Staff and resident accounts, who can act, and the security state of each login. Admin-only."
    >
      <template #actions>
        <Chip tone="progress">Admin only</Chip>
        <Btn size="sm" @click="store.toast('Invite user form opened')">
          <Icon name="plus" :size="15" />
          Invite user
        </Btn>
      </template>
    </PageHeader>

    <div class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Accounts</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ staff.length }}</p>
        <p class="text-[11px] text-ink-3">Staff and residents</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Admins</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ staff.filter((user) => user.role === 'Admin').length }}</p>
        <p class="text-[11px] text-ink-3">Full access including audit</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Two-factor</p>
        <p class="mt-1 font-mono text-2xl font-semibold">{{ staff.filter((user) => user.twoFactor).length }}/{{ staff.length }}</p>
        <p class="text-[11px] text-ink-3">Accounts with 2FA enabled</p>
      </div>
      <div class="rounded-card border border-rule bg-surface p-4 shadow-e1">
        <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Suspended</p>
        <p class="mt-1 font-mono text-2xl font-semibold text-signal">{{ staff.filter((user) => user.status === 'Suspended').length }}</p>
        <p class="text-[11px] text-ink-3">Access removed pending review</p>
      </div>
    </div>

    <FilterBar>
      <div class="lg:w-80">
        <Field v-model="query" search placeholder="Name or email" />
      </div>
      <div class="flex flex-1 flex-wrap gap-1.5">
        <button
          v-for="option in roles"
          :key="option"
          type="button"
          class="h-7 rounded-chip border px-2.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] transition"
          :class="role === option ? 'border-navy-800 bg-navy-800 text-white' : 'border-fyi-bd bg-fyi-bg text-fyi hover:border-navy-300'"
          @click="role = option"
        >
          {{ option }}
        </button>
      </div>
      <span class="font-mono text-[10.5px] uppercase tracking-[0.09em] text-ink-3">{{ rows.length }} shown</span>
      <template #action>
        <Btn size="sm" block @click="store.toast('Invite user form opened')">
          <Icon name="plus" :size="15" />
          Invite user
        </Btn>
      </template>
    </FilterBar>

    <DataTable :columns="columns" :rows="rows" min-width="860px" empty="No users match this filter.">
      <template #cell-name="{ row }">
        <div class="flex items-center gap-2.5">
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-100 font-mono text-[10px] font-semibold text-navy-800">{{ row.initials }}</span>
          <span class="min-w-0">
            <b class="block truncate text-[12.5px] font-semibold text-ink">{{ row.name }}</b>
            <span class="block truncate text-[10.5px] text-ink-3">{{ row.email }}</span>
          </span>
        </div>
      </template>
      <template #cell-role="{ row }"><Chip :tone="roleTone(row.role)">{{ row.role }}</Chip></template>
      <template #cell-status="{ row }"><Chip :tone="statusTone(row.status)">{{ row.status }}</Chip></template>
      <template #cell-twoFactor="{ row }">
        <span class="inline-flex items-center gap-1 text-[11.5px] font-medium" :class="row.twoFactor ? 'text-settled' : 'text-ink-3'">
          <Icon :name="row.twoFactor ? 'check' : 'close'" :size="13" /> {{ row.twoFactor ? 'On' : 'Off' }}
        </span>
      </template>
      <template #cell-action="{ row }">
        <button
          type="button"
          class="inline-flex h-8 items-center rounded-btn border border-rule-2 px-2.5 text-[11px] font-semibold text-ink-2 transition hover:bg-navy-50 hover:text-ink"
          @click="store.toast(`${row.name}'s access settings opened`)"
        >
          Manage
        </button>
      </template>
    </DataTable>

    <div class="mt-5 flex flex-wrap gap-3">
      <div class="flex flex-1 items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
        <Icon name="shield" :size="15" class="mt-0.5 shrink-0 text-settled" />
        <p><b class="font-semibold text-ink">No self-service role changes.</b> Only an Admin can grant Admin. Every change lands in the audit log with the previous role.</p>
      </div>
      <div class="flex flex-1 items-start gap-2.5 rounded-card border border-rule bg-surface p-4 text-[12px] leading-relaxed text-ink-2 shadow-e1">
        <Icon name="info" :size="15" class="mt-0.5 shrink-0 text-progress" />
        <p><b class="font-semibold text-ink">Resident accounts are separate.</b> Residents can only ever see their own unit, lease, balance and requests.</p>
      </div>
    </div>
  </div>
</template>
