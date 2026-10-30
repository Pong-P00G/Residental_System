import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'

import MainLayout from '@/layouts/MainLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

/* customer / resident */
import HomePage from '@/views/HomePage.vue'
import PropertiesPage from '@/views/PropertiesPage.vue'
import PropertyDetailPage from '@/views/PropertyDetailPage.vue'
import UnitDetailPage from '@/views/UnitDetailPage.vue'
import MyRequestsPage from '@/views/MyRequestsPage.vue'
import RequestDetailPage from '@/views/RequestDetailPage.vue'
import NewRequestPage from '@/views/NewRequestPage.vue'
import MyPaymentsPage from '@/views/MyPaymentsPage.vue'
import MakePaymentPage from '@/views/MakePaymentPage.vue'
import MyLeasePage from '@/views/MyLeasePage.vue'
import MyUnitPage from '@/views/MyUnitPage.vue'
import ProfilePage from '@/views/ProfilePage.vue'
import NotificationsPage from '@/views/NotificationsPage.vue'
import SupportPage from '@/views/SupportPage.vue'

/* dashboard */
import DashboardOverviewPage from '@/views/dashboard/DashboardOverviewPage.vue'
import DashboardPropertiesPage from '@/views/dashboard/PropertiesPage.vue'
import DashboardPropertyDetailPage from '@/views/dashboard/PropertyDetailPage.vue'
import DashboardUnitsPage from '@/views/dashboard/UnitsPage.vue'
import DashboardUnitDetailPage from '@/views/dashboard/UnitDetailPage.vue'
import DashboardResidentsPage from '@/views/dashboard/ResidentsPage.vue'
import DashboardResidentDetailPage from '@/views/dashboard/ResidentDetailPage.vue'
import DashboardLeasesPage from '@/views/dashboard/LeasesPage.vue'
import DashboardLeaseDetailPage from '@/views/dashboard/LeaseDetailPage.vue'
import DashboardRequestsPage from '@/views/dashboard/RequestsPage.vue'
import DashboardRequestDetailPage from '@/views/dashboard/RequestDetailPage.vue'
import DashboardPaymentsPage from '@/views/dashboard/PaymentsPage.vue'
import DashboardLedgerPage from '@/views/dashboard/LedgerPage.vue'
import DashboardVendorsPage from '@/views/dashboard/VendorsPage.vue'
import DashboardDocumentsPage from '@/views/dashboard/DocumentsPage.vue'
import DashboardCompliancePage from '@/views/dashboard/CompliancePage.vue'
import DashboardSettingsPage from '@/views/dashboard/SettingsPage.vue'

/* admin only */
import DashboardUsersPage from '@/views/dashboard/UsersPage.vue'
import DashboardAuditLogsPage from '@/views/dashboard/AuditLogsPage.vue'
import DashboardAnalyticsPage from '@/views/dashboard/AnalyticsPage.vue'

import LoginPage from '@/views/Auth/LoginPage.vue'
import SignupPage from '@/views/Auth/SignupPage.vue'
import ForgotPasswordPage from '@/views/Auth/ForgotPasswordPage.vue'

const customerRoutes = [
  {
    path: '',
    name: 'home',
    component: HomePage
  },
  {
    path: 'properties',
    name: 'properties',
    component: PropertiesPage,
    meta: { section: 'Properties', title: 'Properties' }
  },
  {
    path: 'properties/:id',
    name: 'property-detail',
    component: PropertyDetailPage,
    meta: { section: 'Properties', title: 'Property detail' },
  },
  {
    path: 'properties/:id/units/:unitId',
    name: 'unit-detail',
    component: UnitDetailPage,
    meta: { section: 'Properties', title: 'Unit detail' },
  },
  { 
    path: 'my-requests', 
    name: 'my-requests', 
    component: MyRequestsPage, 
    meta: { section: 'Your tenancy', title: 'My requests', auth: true } 
  },
  { 
    path: 'requests/:id', 
    name: 'request-detail', 
    component: RequestDetailPage, 
    meta: { section: 'Your tenancy', title: 'Request detail', auth: true } 
  },
  { path: 'new-request', name: 'new-request', component: NewRequestPage, meta: { section: 'Your tenancy', title: 'New request', auth: true } },
  { path: 'my-payments', name: 'my-payments', component: MyPaymentsPage, meta: { section: 'Your tenancy', title: 'My payments', auth: true } },
  { path: 'pay', name: 'pay', component: MakePaymentPage, meta: { section: 'Your tenancy', title: 'Make payment', auth: true } },
  { path: 'my-lease', name: 'my-lease', component: MyLeasePage, meta: { section: 'Your tenancy', title: 'My lease', auth: true } },
  { path: 'my-unit', name: 'my-unit', component: MyUnitPage, meta: { section: 'Your tenancy', title: 'My unit', auth: true } },
  { path: 'profile', name: 'profile', component: ProfilePage, meta: { section: 'Account', title: 'Profile', auth: true } },
  { path: 'notifications', name: 'notifications', component: NotificationsPage, meta: { section: 'Account', title: 'Notifications', auth: true } },
  { path: 'support', name: 'support', component: SupportPage, meta: { section: 'Help', title: 'Support' } },
]

const dashboardRoutes = [
  { path: 'properties', name: 'dashboard-properties', component: DashboardPropertiesPage, meta: { section: 'Portfolio', title: 'Properties' } },
  {
    path: 'properties/:id',
    name: 'dashboard-property-detail',
    component: DashboardPropertyDetailPage,
    meta: { section: 'Portfolio', title: 'Property detail' },
  },
  { path: 'units', name: 'dashboard-units', component: DashboardUnitsPage, meta: { section: 'Portfolio', title: 'Units' } },
  { path: 'units/:id', name: 'dashboard-unit-detail', component: DashboardUnitDetailPage, meta: { section: 'Portfolio', title: 'Unit detail' } },
  { path: 'residents', name: 'dashboard-residents', component: DashboardResidentsPage, meta: { section: 'Portfolio', title: 'Residents' } },
  {
    path: 'residents/:id',
    name: 'dashboard-resident-detail',
    component: DashboardResidentDetailPage,
    meta: { section: 'Portfolio', title: 'Resident detail' },
  },
  { path: 'leases', name: 'dashboard-leases', component: DashboardLeasesPage, meta: { section: 'Portfolio', title: 'Leases' } },
  { path: 'leases/:id', name: 'dashboard-lease-detail', component: DashboardLeaseDetailPage, meta: { section: 'Portfolio', title: 'Lease detail' } },
  { path: 'requests', name: 'dashboard-requests', component: DashboardRequestsPage, meta: { section: 'Operations', title: 'Requests' } },
  {
    path: 'requests/:id',
    name: 'dashboard-request-detail',
    component: DashboardRequestDetailPage,
    meta: { section: 'Operations', title: 'Request detail' },
  },
  { path: 'payments', name: 'dashboard-payments', component: DashboardPaymentsPage, meta: { section: 'Operations', title: 'Payments' } },
  { path: 'ledger', name: 'dashboard-ledger', component: DashboardLedgerPage, meta: { section: 'Operations', title: 'Financial ledger' } },
  { path: 'vendors', name: 'dashboard-vendors', component: DashboardVendorsPage, meta: { section: 'Operations', title: 'Vendors' } },
  { path: 'documents', name: 'dashboard-documents', component: DashboardDocumentsPage, meta: { section: 'Governance', title: 'Documents' } },
  { path: 'compliance', name: 'dashboard-compliance', component: DashboardCompliancePage, meta: { section: 'Governance', title: 'Compliance' } },
  { path: 'settings', name: 'dashboard-settings', component: DashboardSettingsPage, meta: { section: 'Governance', title: 'Settings' } },
  {
    path: 'users',
    name: 'dashboard-users',
    component: DashboardUsersPage,
    meta: { section: 'Administration', title: 'User management', roles: ['admin'] },
  },
  {
    path: 'audit-logs',
    name: 'dashboard-audit-logs',
    component: DashboardAuditLogsPage,
    meta: { section: 'Administration', title: 'Audit logs', roles: ['admin'] },
  },
  {
    path: 'analytics',
    name: 'dashboard-analytics',
    component: DashboardAnalyticsPage,
    meta: { section: 'Administration', title: 'Analytics', roles: ['admin'] },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: customerRoutes,
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { roles: ['owner', 'admin'] },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardOverviewPage,
          meta: { section: 'Overview', title: 'Dashboard', roles: ['owner', 'admin'] },
        },
      ],
    },
    {
      path: '/d',
      component: DashboardLayout,
      meta: { roles: ['owner', 'admin'] },
      children: dashboardRoutes.map((route) => ({ ...route, meta: { roles: ['owner', 'admin'], ...route.meta } })),
    },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/signup', name: 'signup', component: SignupPage },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordPage },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const store = useAppStore()
  const allowed = to.meta.roles

  if (allowed) {
    if (store.signedIn && allowed.includes(store.role)) return true
    return store.role === 'owner' || store.role === 'admin'
      ? { path: '/dashboard' }
      : { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.auth && !store.signedIn) return { path: '/login', query: { redirect: to.fullPath } }

  return true
})

export default router
