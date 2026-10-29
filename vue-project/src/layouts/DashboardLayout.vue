<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { org } from '../data/app'
import { useAppStore } from '../stores/app'
import Icon from '../components/Icon.vue'

const route = useRoute()
const store = useAppStore()
const sidebarOpen = ref(false)
const accountOpen = ref(false)

const navGroups = computed(() => [
  {
    heading: 'Overview',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: 'grid', match: (path) => path === '/dashboard' }],
  },
  {
    heading: 'Portfolio',
    items: [
      { label: 'Properties', to: '/d/properties', icon: 'building', match: (path) => path.startsWith('/d/properties') },
      { label: 'Units', to: '/d/units', icon: 'home', match: (path) => path.startsWith('/d/units') },
      { label: 'Residents', to: '/d/residents', icon: 'user', match: (path) => path.startsWith('/d/residents') },
      { label: 'Leases', to: '/d/leases', icon: 'key', match: (path) => path.startsWith('/d/leases') },
    ],
  },
  {
    heading: 'Operations',
    items: [
      {
        label: 'Requests',
        to: '/d/requests',
        icon: 'wrench',
        match: (path) => path.startsWith('/d/requests'),
        badge: store.openRequestCount,
      },
      { label: 'Payments', to: '/d/payments', icon: 'wallet', match: (path) => path.startsWith('/d/payments') },
      { label: 'Financial Ledger', to: '/d/ledger', icon: 'chart', match: (path) => path.startsWith('/d/ledger') },
      { label: 'Vendors', to: '/d/vendors', icon: 'phone', match: (path) => path.startsWith('/d/vendors') },
    ],
  },
  {
    heading: 'Governance',
    items: [
      { label: 'Documents', to: '/d/documents', icon: 'file', match: (path) => path.startsWith('/d/documents') },
      { label: 'Compliance', to: '/d/compliance', icon: 'shield', match: (path) => path.startsWith('/d/compliance'), badge: 2 },
      { label: 'Settings', to: '/d/settings', icon: 'scale', match: (path) => path.startsWith('/d/settings') },
    ],
  },
  ...(store.isAdmin
    ? [
        {
          heading: 'Administration',
          items: [
            { label: 'User Management', to: '/d/users', icon: 'user', match: (path) => path.startsWith('/d/users') },
            { label: 'Audit Logs', to: '/d/audit-logs', icon: 'list', match: (path) => path.startsWith('/d/audit-logs') },
            { label: 'Analytics', to: '/d/analytics', icon: 'chart', match: (path) => path.startsWith('/d/analytics') },
          ],
        },
      ]
    : []),
])

const crumbs = computed(() => {
  const section = route.meta.section
  const title = route.meta.title
  return [
    { label: 'Dashboard', to: '/dashboard' },
    ...(section ? [{ label: section, to: section === 'Overview' ? '/dashboard' : undefined }] : []),
    ...(title && title !== section ? [{ label: title }] : []),
  ]
})

const initials = computed(() => store.session.initials || 'DW')

function closeMenus() {
  sidebarOpen.value = false
  accountOpen.value = false
}

function onKey(event) {
  if (event.key === 'Escape') closeMenus()
}

watch(() => route.fullPath, closeMenus)
watch(sidebarOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="min-h-dvh bg-alt">
    <!-- sidebar -->
    <aside class="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-navy-800 bg-navy-900 lg:flex">
      <div class="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <span class="grid h-10 w-10 place-items-center rounded-lg bg-white font-mono text-sm font-bold text-navy-900">T</span>
        <span class="leading-tight">
          <span class="block font-mono text-[10px] font-bold tracking-[0.3em] text-white">TENURE</span>
          <span class="block text-[11px] text-white/50">{{ org.name }}</span>
        </span>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-5 no-scrollbar">
        <div v-for="group in navGroups" :key="group.heading" class="mb-5">
          <p class="px-3 pb-2 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">{{ group.heading }}</p>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="mb-0.5 flex items-center gap-2.5 rounded-btn px-3 py-2 text-[12.5px] font-medium transition"
            :class="item.match(route.path) ? 'bg-white/12 font-semibold text-white' : 'text-white/65 hover:bg-white/8 hover:text-white'"
            :aria-current="item.match(route.path) ? 'page' : undefined"
          >
            <Icon :name="item.icon" :size="16" class="shrink-0" />
            <span class="truncate">{{ item.label }}</span>
            <span v-if="item.badge" class="ml-auto rounded-full bg-signal px-1.5 py-0.5 font-mono text-[9px] font-semibold leading-none text-white">
              {{ item.badge }}
            </span>
          </RouterLink>
        </div>
      </nav>

      <div class="border-t border-white/10 p-3">
        <RouterLink to="/" class="flex items-center gap-2.5 rounded-btn px-3 py-2 text-[12px] font-medium text-white/60 transition hover:bg-white/8 hover:text-white">
          <Icon name="external" :size="15" />
          View resident site
        </RouterLink>
        <div class="mt-2 flex items-center gap-2.5 rounded-btn bg-white/5 px-3 py-2.5">
          <span class="grid h-8 w-8 place-items-center rounded-full bg-white/15 font-mono text-[10.5px] font-semibold text-white">{{ initials }}</span>
          <span class="min-w-0 flex-1 leading-tight">
            <span class="block truncate text-[12px] font-semibold text-white">{{ store.session.name }}</span>
            <span class="block truncate text-[10px] text-white/50">{{ store.session.role }}</span>
          </span>
          <RouterLink to="/login" aria-label="Sign out" class="text-white/50 transition hover:text-white" @click="store.signOut()">
            <Icon name="logout" :size="16" />
          </RouterLink>
        </div>
      </div>
    </aside>

    <!-- mobile drawer -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-navy-900/50 lg:hidden" @click="closeMenus"></div>
    <aside
      v-if="sidebarOpen"
      class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy-900 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Dashboard menu"
    >
      <div class="flex h-20 items-center justify-between gap-3 border-b border-white/10 px-5">
        <span class="flex items-center gap-3">
          <span class="grid h-9 w-9 place-items-center rounded-lg bg-white font-mono text-[13px] font-bold text-navy-900">T</span>
          <span class="font-mono text-[10px] font-bold tracking-[0.3em] text-white">TENURE</span>
        </span>
        <button type="button" class="text-white/60 transition hover:text-white" aria-label="Close menu" @click="closeMenus">
          <Icon name="close" :size="18" />
        </button>
      </div>
      <nav class="flex-1 overflow-y-auto px-3 py-5">
        <div v-for="group in navGroups" :key="group.heading" class="mb-5">
          <p class="px-3 pb-2 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">{{ group.heading }}</p>
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="mb-0.5 flex items-center gap-2.5 rounded-btn px-3 py-2.5 text-[13px] font-medium transition"
            :class="item.match(route.path) ? 'bg-white/12 font-semibold text-white' : 'text-white/65 hover:bg-white/8 hover:text-white'"
          >
            <Icon :name="item.icon" :size="16" class="shrink-0" />
            <span class="flex-1 truncate">{{ item.label }}</span>
            <span v-if="item.badge" class="rounded-full bg-signal px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white">{{ item.badge }}</span>
          </RouterLink>
        </div>
      </nav>
      <div class="border-t border-white/10 p-3">
        <RouterLink to="/" class="flex items-center gap-2.5 rounded-btn px-3 py-2 text-[12px] font-medium text-white/60">
          <Icon name="external" :size="15" /> View resident site
        </RouterLink>
      </div>
    </aside>

    <!-- header -->
    <header class="sticky top-0 z-30 border-b border-rule bg-surface/95 backdrop-blur lg:ml-64">
      <div class="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          class="grid h-10 w-10 shrink-0 place-items-center rounded-btn border border-rule-2 text-ink-2 transition hover:bg-alt lg:hidden"
          aria-label="Open menu"
          @click="sidebarOpen = true"
        >
          <Icon name="menu" :size="18" />
        </button>

        <nav class="min-w-0 flex-1" aria-label="Breadcrumb">
          <ol class="flex items-center gap-1.5 overflow-hidden font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-3">
            <li v-for="(crumb, index) in crumbs" :key="crumb.label" class="flex min-w-0 items-center gap-1.5">
              <Icon v-if="index > 0" name="chevron" :size="11" class="shrink-0 text-rule-2" />
              <RouterLink v-if="crumb.to" :to="crumb.to" class="shrink-0 transition hover:text-navy-800">{{ crumb.label }}</RouterLink>
              <span v-else class="truncate" :class="index === crumbs.length - 1 ? 'font-semibold text-navy-800' : ''">{{ crumb.label }}</span>
            </li>
          </ol>
          <p class="mt-0.5 truncate text-[13px] font-semibold text-ink">{{ route.meta.title || 'Dashboard' }}</p>
        </nav>

        <div class="flex items-center gap-2">
          <span class="hidden rounded-chip border border-progress-bd bg-progress-bg px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.07em] text-progress sm:inline-flex">
            {{ store.session.role }} view
          </span>

          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-2 rounded-full border border-rule-2 bg-surface py-1 pl-1 pr-2.5 transition hover:border-navy-300"
              :aria-expanded="accountOpen"
              aria-haspopup="menu"
              @click="accountOpen = !accountOpen"
            >
              <span class="grid h-8 w-8 place-items-center rounded-full bg-navy-100 font-mono text-[11px] font-semibold text-navy-800">{{ initials }}</span>
              <span class="hidden text-left leading-tight sm:block">
                <span class="block max-w-33 truncate text-[12px] font-semibold text-ink">{{ store.session.name }}</span>
                <span class="block max-w-33 truncate text-[10px] text-ink-3">{{ store.session.email }}</span>
              </span>
              <Icon name="chevron" :size="13" class="hidden text-ink-3 sm:block" :class="{ 'rotate-90': accountOpen }" />
            </button>

            <div v-if="accountOpen" class="fixed inset-0 z-10" @click="accountOpen = false"></div>
            <div v-if="accountOpen" class="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-card border border-rule bg-surface py-1.5 shadow-e2" role="menu">
              <p class="px-3 pb-2 pt-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Demo role</p>
              <button
                type="button"
                class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12.5px] font-medium transition hover:bg-alt"
                :class="store.role === 'owner' ? 'text-navy-800' : 'text-ink-2'"
                role="menuitem"
                @click="store.setRole('owner')"
              >
                <Icon name="key" :size="15" /> Owner view
                <Icon v-if="store.role === 'owner'" name="check" :size="14" class="ml-auto text-settled" />
              </button>
              <button
                type="button"
                class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12.5px] font-medium transition hover:bg-alt"
                :class="store.role === 'admin' ? 'text-navy-800' : 'text-ink-2'"
                role="menuitem"
                @click="store.setRole('admin')"
              >
                <Icon name="shield" :size="15" /> Admin view
                <Icon v-if="store.role === 'admin'" name="check" :size="14" class="ml-auto text-settled" />
              </button>
              <RouterLink to="/" class="flex items-center gap-2.5 border-t border-rule px-3 py-2 pt-2.5 text-[12.5px] font-medium text-ink-2 transition hover:bg-alt" role="menuitem">
                <Icon name="external" :size="15" /> Resident site
              </RouterLink>
              <RouterLink to="/login" class="flex items-center gap-2.5 px-3 pb-1.5 pt-1 text-[12.5px] font-medium text-ink-2 transition hover:bg-alt" role="menuitem" @click="store.signOut()">
                <Icon name="logout" :size="15" /> Sign out
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="px-4 py-6 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
      <RouterView />
    </main>
  </div>
</template>
