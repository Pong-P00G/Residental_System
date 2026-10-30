<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { org, resident } from '../data/app'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import { preferences } from '../lib/preferences'
import Icon from '../components/Icon.vue'
import PatternFineGrid from '../assets/PatternFineGrid.vue'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const auth = useAuthStore()
const menuOpen = ref(false)
const accountOpen = ref(false)
const searchTerm = ref('')
const scrolled = ref(false)
const year = new Date().getFullYear()

const links = [
  { label: 'Home', to: '/', match: (path) => path === '/' },
  { label: 'Properties', to: '/properties', match: (path) => path.startsWith('/properties') },
  { label: 'My Requests', to: '/my-requests', match: (path) => path.startsWith('/my-requests') || path.startsWith('/requests/') || path === '/new-request' },
  { label: 'Payments', to: '/my-payments', match: (path) => path === '/my-payments' || path === '/pay' },
  { label: 'My Lease', to: '/my-lease', match: (path) => path === '/my-lease' },
  { label: 'My Unit', to: '/my-unit', match: (path) => path === '/my-unit' },
  { label: 'Support', to: '/support', match: (path) => path === '/support' },
]

const isActive = (link) => link.match(route.path)
const openRequestCount = computed(
  () => store.myRequests.filter((request) => !['Resolved', 'Closed'].includes(request.status)).length,
)
const account = computed(() => (store.canManage ? store.session : store.profile))
const initials = computed(() => account.value.initials || 'ID')
const profileMeta = computed(() =>
  store.canManage ? `${store.session.role} · ${org.name}` : `Resident · Unit ${resident.unit}`,
)

function submitSearch() {
  const term = searchTerm.value.trim()
  closeMenus()
  router.push({ path: '/properties', query: term ? { q: term } : {} })
}

function onScroll() {
  scrolled.value = window.scrollY > 8
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeMenus() {
  menuOpen.value = false
  accountOpen.value = false
}

function onKey(event) {
  if (event.key === 'Escape') closeMenus()
}

watch(() => route.fullPath, closeMenus)

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  document.addEventListener('keydown', onKey)
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('scroll', onScroll)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="relative isolate flex min-h-dvh flex-col bg-surface">
    <PatternFineGrid />
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-navy-800 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
    >
      Skip to content
    </a>
    <header
      class="sticky top-0 z-30 border-b border-rule bg-surface/95 backdrop-blur transition-shadow"
      :class="scrolled ? 'shadow-e1' : ''"
    >
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
        <RouterLink to="/" class="flex shrink-0 items-center gap-3" aria-label="Tenure home">
          <span class="grid h-10 w-10 place-items-center rounded-lg bg-navy-800 font-mono text-sm font-bold text-white">T</span>
          <span class="leading-tight">
            <span class="block font-mono text-[10px] font-bold tracking-[0.3em] text-ink">TENURE</span>
            <span class="block text-[11.5px] text-ink-3">Resident portal</span>
          </span>
        </RouterLink>

        <nav class="ml-6 hidden items-center gap-0.5 lg:flex bg-sky-100/50 p-2 rounded-3xl " aria-label="Primary">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="rounded-2xl px-2.5 py-2 text-[12.5px] font-medium transition"
            :class="isActive(link) ? 'bg-navy-100 font-semibold text-navy-800' : 'text-black hover:bg-alt hover:text-ink'"
            :aria-current="isActive(link) ? 'page' : undefined"
          >
            {{ link.label }}
            <span
              v-if="link.label === 'My Requests' && store.signedIn && !store.canManage && openRequestCount"
              class="ml-1.5 rounded-full bg-signal px-1.5 py-0.5 font-mono text-[9px] font-semibold leading-none text-white"
            >
              {{ openRequestCount }}
            </span>
          </RouterLink>
        </nav>

        <div class="ml-auto flex items-center gap-2 xl:ml-2">
          <RouterLink
            v-if="store.signedIn"
            to="/notifications"
            class="relative hidden h-10 w-10 place-items-center bg-surface text-ink-2 transition hover:text-ink sm:grid"
            :aria-label="store.unreadCount ? `Notifications, ${store.unreadCount} unread` : 'Notifications'"
          >
            <Icon name="bell" :size="20" />
            <span
              v-if="store.unreadCount && preferences.notifications !== 'muted'"
              class="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-signal px-1 font-mono text-[9px] font-semibold leading-none text-white"
            >
              {{ store.unreadCount }}
            </span>
          </RouterLink>

          <div v-if="store.signedIn" class="relative">
            <button
              type="button"
              class="flex items-center rounded-full border border-navy-400 bg-surface transition"
              :aria-expanded="accountOpen"
              aria-haspopup="menu"
              aria-controls="account-menu"
              :aria-label="`Account — ${account.name}`"
              @click="accountOpen = !accountOpen"
            >
              <span class="relative grid h-8 w-8 place-items-center rounded-full bg-navy-100 font-mono text-[11px] font-semibold text-navy-800">
                {{ initials }}
              </span>
              <!-- <span class="hidden text-left leading-tight xl:block">
                <span class="block max-w-35 truncate text-[12px] font-semibold text-ink">{{ account.name }}</span>
                <span class="block max-w-35 truncate text-[10px] text-ink-3">{{ profileMeta }}</span>
              </span> -->
            </button>

            <div v-if="accountOpen" class="fixed inset-0 z-10" @click="accountOpen = false"></div>
            <div
              v-if="accountOpen"
              id="account-menu"
              class="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-card border border-rule bg-surface py-1.5 shadow-e2"
              role="menu"
            >
              <div class="border-b border-rule px-3 pb-2.5 pt-1.5">
                <p class="truncate text-[12.5px] font-semibold text-ink">{{ account.name }}</p>
                <p class="truncate text-[11px] text-ink-3">{{ account.email }}</p>
              </div>
              <RouterLink to="/profile" class="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-ink-2 transition hover:bg-alt hover:text-ink" role="menuitem">
                <Icon name="user" :size="16" /> Profile
              </RouterLink>
              <RouterLink
                v-if="store.canManage"
                to="/dashboard"
                class="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-ink-2 transition hover:bg-alt hover:text-ink"
                role="menuitem"
              >
                <Icon name="grid" :size="16" /> Manager dashboard
              </RouterLink>
              <RouterLink to="/notifications" class="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-ink-2 transition hover:bg-alt hover:text-ink" role="menuitem">
                <Icon name="bell" :size="16" />
                <span class="flex-1">Notifications</span>
                <span v-if="store.unreadCount && preferences.notifications !== 'muted'" class="rounded-full bg-signal px-1.5 py-0.5 font-mono text-[9px] font-semibold leading-none text-white">
                  {{ store.unreadCount }}
                </span>
              </RouterLink>
              <RouterLink to="/support" class="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-ink-2 transition hover:bg-alt hover:text-ink" role="menuitem">
                <Icon name="message" :size="16" /> Support
              </RouterLink>
              <RouterLink to="/login" class="flex items-center gap-2.5 border-t border-rule px-3 pb-1.5 pt-2.5 text-[13px] font-medium text-ink-2 transition hover:bg-alt hover:text-ink" role="menuitem" @click="auth.signOut()">
                <Icon name="logout" :size="16" /> Sign out
              </RouterLink>
            </div>
          </div>

          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-btn border border-rule-2 bg-surface text-ink-2 transition hover:border-navy-300 hover:bg-navy-50 hover:text-ink lg:hidden"
            :aria-expanded="menuOpen"
            aria-controls="customer-menu"
            aria-label="Open menu"
            @click="menuOpen = !menuOpen"
          >
            <Icon :name="menuOpen ? 'close' : 'menu'" :size="18" />
          </button>
        </div>
      </div>
    </header>

    <div v-if="menuOpen" class="fixed inset-0 z-40 bg-navy-900/45" @click="closeMenus"></div>

    <aside
      v-if="menuOpen"
      id="customer-menu"
      class="fixed inset-y-0 right-0 z-50 w-full max-w-85 overflow-y-auto border-l border-rule bg-surface p-5 shadow-e2"
      role="dialog"
      aria-modal="true"
      aria-label="Primary menu"
    >
      <div class="flex items-center justify-between gap-3 border-b border-rule pb-4">
        <span class="flex items-center gap-2.5">
          <span class="grid h-9 w-9 place-items-center rounded-lg bg-navy-800 font-mono text-[13px] font-bold text-white">T</span>
          <span class="font-mono text-[10px] font-bold tracking-[0.3em] text-ink">TENURE</span>
        </span>
        <button type="button" class="grid h-8 w-8 place-items-center rounded-full border border-rule-2 text-ink-2" aria-label="Close menu" @click="closeMenus">
          <Icon name="close" :size="16" />
        </button>
      </div>

      <form class="mt-4" role="search" @submit.prevent="submitSearch">
        <label for="drawer-search" class="sr-only">Search properties</label>
        <div class="relative">
          <Icon name="search" :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            id="drawer-search"
            v-model="searchTerm"
            type="search"
            placeholder="Search properties"
            class="h-11 w-full rounded-btn border border-rule-2 bg-alt pl-9 pr-3 text-sm text-ink focus:border-navy-300 focus:bg-surface focus:outline-none"
          />
        </div>
      </form>

      <nav class="mt-3 flex flex-col gap-0.5">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-btn px-3 py-2.5 text-sm font-medium transition"
          :class="isActive(link) ? 'bg-navy-50 font-semibold text-navy-800' : 'text-ink-2 hover:bg-alt'"
          :aria-current="isActive(link) ? 'page' : undefined"
        >
          {{ link.label }}
          <span
            v-if="link.label === 'My Requests' && store.signedIn && !store.canManage && openRequestCount"
            class="ml-1.5 rounded-full bg-signal px-1.5 py-0.5 font-mono text-[9px] font-semibold leading-none text-white"
          >
            {{ openRequestCount }}
          </span>
        </RouterLink>
        <div class="my-3 border-t border-rule"></div>
        <template v-if="store.signedIn">
          <div class="mb-2 flex items-center gap-3 rounded-card bg-alt px-3 py-2.5">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-100 font-mono text-[11px] font-semibold text-navy-800">{{ initials }}</span>
            <span class="min-w-0 leading-tight">
              <span class="block truncate text-[12.5px] font-semibold text-ink">{{ account.name }}</span>
              <span class="block truncate text-[10.5px] text-ink-3">{{ profileMeta }}</span>
            </span>
          </div>
          <RouterLink to="/new-request" class="mb-3 flex items-center justify-center gap-2 rounded-btn bg-navy-800 px-3 py-2.5 text-sm font-semibold text-white">
            <Icon name="plus" :size="16" /> New request
          </RouterLink>
          <RouterLink to="/profile" class="rounded-btn px-3 py-2.5 text-sm font-medium text-ink-2 transition hover:bg-alt">Profile</RouterLink>
          <RouterLink to="/notifications" class="flex items-center gap-2 rounded-btn px-3 py-2.5 text-sm font-medium text-ink-2 transition hover:bg-alt">
            Notifications
            <span v-if="store.unreadCount && preferences.notifications !== 'muted'" class="rounded-full bg-signal px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white">{{ store.unreadCount }}</span>
          </RouterLink>
          <RouterLink v-if="store.canManage" to="/dashboard" class="rounded-btn px-3 py-2.5 text-sm font-medium text-ink-2 transition hover:bg-alt">Manager dashboard</RouterLink>
          <RouterLink to="/login" class="rounded-btn px-3 py-2.5 text-sm font-medium text-ink-2 transition hover:bg-alt" @click="auth.signOut()">Sign out</RouterLink>
        </template>
        <RouterLink v-else to="/login" class="flex items-center justify-center gap-2 rounded-btn bg-navy-800 px-3 py-2.5 text-sm font-semibold text-white">
          <Icon name="user" :size="16" /> Sign in to your tenancy
        </RouterLink>
      </nav>
    </aside>

    <main id="main-content" class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      <RouterView />
    </main>

    <footer class="border-t border-rule bg-alt">
      <div class="bg-navy-900">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/40">Need a hand?</p>
            <p class="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">Rent, repairs or paperwork — we're here.</p>
            <p class="mt-1 text-[12.5px] leading-relaxed text-white/60">
              We reply within {{ org.reply }}. For emergencies call
              <a :href="`tel:${org.emergency.replace(/\s/g, '')}`" class="font-semibold text-white underline decoration-white/30 underline-offset-2 hover:decoration-white">{{ org.emergency }}</a>.
            </p>
          </div>
          <div class="flex shrink-0 flex-wrap items-center gap-2">
            <RouterLink
              to="/new-request"
              class="inline-flex h-10 items-center gap-2 rounded-btn bg-white px-4 text-[12.5px] font-semibold text-navy-900 transition hover:bg-white/90"
            >
              <Icon name="wrench" :size="15" /> Report a repair
            </RouterLink>
            <RouterLink
              to="/support"
              class="inline-flex h-10 items-center gap-2 rounded-btn border border-white/25 px-4 text-[12.5px] font-semibold text-white transition hover:bg-white/10"
            >
              Contact support
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <RouterLink to="/" class="flex items-center gap-2.5">
            <span class="grid h-9 w-9 place-items-center rounded-lg bg-navy-800 font-mono text-[13px] font-bold text-white">T</span>
            <span class="leading-tight">
              <span class="block font-mono text-[10px] font-bold tracking-[0.3em] text-ink">TENURE</span>
              <span class="block text-[11px] text-ink-3">{{ org.name }}</span>
            </span>
          </RouterLink>
          <p class="mt-4 max-w-[30ch] text-[12.5px] leading-relaxed text-ink-2">
            Rent, repairs, leases and documents in one place for every home managed by {{ org.name }}.
          </p>
          <p class="mt-4 font-mono text-[10.5px] leading-relaxed text-ink-3">{{ org.address }}</p>
        </div>

        <div>
          <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-ink-3">Explore</p>
          <ul class="mt-3 space-y-2">
            <li><RouterLink to="/properties" class="text-[12.5px] font-medium text-ink-2 transition hover:text-navy-800">Properties</RouterLink></li>
            <li><RouterLink to="/support" class="text-[12.5px] font-medium text-ink-2 transition hover:text-navy-800">Support</RouterLink></li>
            <li><RouterLink to="/new-request" class="text-[12.5px] font-medium text-ink-2 transition hover:text-navy-800">Report a repair</RouterLink></li>
          </ul>
        </div>

        <div>
          <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-ink-3">Your tenancy</p>
          <ul class="mt-3 space-y-2">
            <li><RouterLink to="/my-requests" class="text-[12.5px] font-medium text-ink-2 transition hover:text-navy-800">My requests</RouterLink></li>
            <li><RouterLink to="/my-payments" class="text-[12.5px] font-medium text-ink-2 transition hover:text-navy-800">My payments</RouterLink></li>
            <li><RouterLink to="/my-lease" class="text-[12.5px] font-medium text-ink-2 transition hover:text-navy-800">My lease</RouterLink></li>
            <li><RouterLink to="/my-unit" class="text-[12.5px] font-medium text-ink-2 transition hover:text-navy-800">My unit</RouterLink></li>
          </ul>
        </div>

        <div>
          <p class="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-ink-3">Contact</p>
          <ul class="mt-3 space-y-2 text-[12.5px] font-medium text-ink-2">
            <li><a :href="org.phoneHref" class="transition hover:text-navy-800">{{ org.phone }}</a></li>
            <li><a :href="`mailto:${org.email}`" class="transition hover:text-navy-800">{{ org.email }}</a></li>
            <li class="text-ink-3">{{ org.hours }}</li>
          </ul>
          <div class="mt-4 rounded-card border border-signal-bd bg-signal-bg px-3 py-2.5">
            <p class="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-signal">Out of hours</p>
            <p class="mt-0.5 text-[12px] leading-relaxed text-ink-2">
              Emergencies only:<br />
              <a :href="`tel:${org.emergency.replace(/\s/g, '')}`" class="font-semibold text-ink transition hover:text-signal">{{ org.emergency }}</a>
            </p>
          </div>
        </div>
      </div>

      <div class="border-t border-rule">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 font-mono text-[10px] text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {{ year }} TENURE · {{ org.name }}</p>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p>Prototype · figures are illustrative</p>
            <button type="button" class="inline-flex items-center gap-1 font-mono text-[10px] text-ink-3 transition hover:text-navy-800" @click="backToTop">
              Back to top <Icon name="chevron" :size="11" class="-rotate-90" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
