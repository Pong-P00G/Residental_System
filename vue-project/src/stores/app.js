import { defineStore } from 'pinia'
import {
  accounts,
  notifications as seedNotifications,
  requests as seedRequests,
  residentPayments,
  statement as seedStatement,
} from '@/data/app'

let toastId = 0
let requestCounter = 4900

const SESSION_KEY = 'tenure.session.v1'
const ROLES = ['resident', 'owner', 'admin']

function loadSession() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null')
    if (!stored || stored.signedIn !== true || !ROLES.includes(stored.role)) return null
    return stored
  } catch {
    return null
  }
}

function saveSession(state) {
  try {
    if (!state.signedIn) {
      window.localStorage.removeItem(SESSION_KEY)
      return
    }
    window.localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ signedIn: true, role: state.role, session: state.session, profile: state.profile }),
    )
  } catch {
    // Storage can be unavailable (private mode, quota) — the app still works for this visit.
  }
}

export const useAppStore = defineStore('app', {
  state: () => {
    const saved = loadSession()
    const role = saved?.role || 'resident'
    return {
      signedIn: Boolean(saved),
      role,
      session: { ...(saved?.session || accounts[role]) },
      profile: { ...(saved?.profile || accounts.resident) },
      statement: { ...seedStatement, lines: seedStatement.lines.map((line) => ({ ...line })), received: 0 },
      requestList: seedRequests.map((request) => ({ ...request, steps: request.steps.map((step) => ({ ...step })) })),
      notificationList: seedNotifications.map((notification) => ({ ...notification })),
      paymentLog: residentPayments.map((payment) => ({ ...payment })),
      contactPrefs: { email: true, sms: true, post: false, buildingNotices: true },
      toasts: [],
    }
  },
  getters: {
    isResident: (state) => state.role === 'resident',
    canManage: (state) => state.role === 'owner' || state.role === 'admin',
    isAdmin: (state) => state.role === 'admin',
    balance: (state) => Math.max(state.statement.total - state.statement.received, 0),
    paidOff: (state) => state.statement.total - state.statement.received <= 0,
    myRequests: (state) => state.requestList.filter((request) => request.residentId === accounts.resident.id),
    openRequestCount: (state) =>
      state.requestList.filter((request) => ['Needs action', 'Triaged', 'In progress', 'Scheduled', 'Submitted'].includes(request.status))
        .length,
    unreadCount: (state) => state.notificationList.filter((notification) => !notification.read).length,
    myPayments: (state) => state.paymentLog,
    myLeaseId: () => 'L-1004',
  },
  actions: {
    toast(message) {
      const id = ++toastId
      this.toasts.push({ id, message })
      setTimeout(() => {
        this.toasts = this.toasts.filter((toast) => toast.id !== id)
      }, 2800)
    },
    persistSession() {
      saveSession(this)
    },
    signIn(role = 'resident') {
      const next = ROLES.includes(role) ? role : 'resident'
      this.signedIn = true
      this.role = next
      this.session = { ...accounts[next] }
      if (next === 'resident') {
        this.profile = { ...accounts.resident }
      }
      this.persistSession()
      this.toast(next === 'resident' ? 'Signed in as resident' : `Signed in as ${this.session.role.toLowerCase()}`)
    },
    setRole(role = 'resident') {
      this.signIn(role)
    },
    signOut() {
      this.signedIn = false
      this.role = 'resident'
      this.session = { ...accounts.resident }
      this.persistSession()
      this.toast('Signed out')
    },
    markRead(id) {
      const notification = this.notificationList.find((item) => item.id === id)
      if (notification) notification.read = true
    },
    markAllRead() {
      this.notificationList = this.notificationList.map((item) => ({ ...item, read: true }))
      this.toast('All notifications marked as read')
    },
    submitRequest({ title, category, urgency, description, photos = 0, unitId = 'u-4b' }) {
      const id = `RQ-${++requestCounter}`
      const request = {
        id,
        title: title || description.split('.')[0].slice(0, 52) || 'New maintenance request',
        unitId,
        residentId: accounts.resident.id,
        category,
        priority: urgency,
        status: 'Submitted',
        sla: 6,
        target: 'Triage within 1 business day',
        submitted: 'Just now',
        description,
        photos,
        vendorId: null,
        steps: [
          { label: 'Submitted', meta: 'Just now · you', state: 'done' },
          { label: 'Awaiting triage', meta: 'Target: within 1 business day', state: 'now' },
          { label: 'Assigned to a vendor', meta: 'Not yet', state: '' },
          { label: 'Resolved', meta: 'Not yet', state: '' },
        ],
        updates: [{ at: 'Just now', from: 'Tenure', body: 'Request received. You will get an update as soon as it is triaged.' }],
      }
      this.requestList = [request, ...this.requestList]
      this.notificationList = [
        {
          id: `n-${id}`,
          kind: 'Request',
          title: `${id} submitted`,
          body: `${request.title} — we will confirm the response target shortly.`,
          at: 'Just now',
          read: false,
          tone: 'progress',
          to: `/requests/${id}`,
        },
        ...this.notificationList,
      ]
      this.toast(`Request ${id} submitted`)
      return request
    },
    pay(method) {
      const reference = `PAY-${9000 + this.paymentLog.length}`
      const payment = {
        id: reference.replace('PAY', 'PMT'),
        date: 'Just now',
        period: this.statement.period,
        amount: this.balance,
        method,
        status: 'Cleared',
        reference,
      }
      this.paymentLog = [payment, ...this.paymentLog]
      this.statement.received = this.statement.total
      this.toast('Payment sent · receipt saved to Documents')
      return payment
    },
    assignVendor(requestId, vendorId) {
      const request = this.requestList.find((item) => item.id === requestId)
      if (!request) return
      request.vendorId = vendorId
      request.status = 'Scheduled'
      request.sla = 18
      request.target = 'Awaiting confirmation'
      request.steps = request.steps.map((step) =>
        step.label === 'Assigned to a vendor' || step.label === 'Awaiting vendor assignment'
          ? { ...step, label: 'Assigned to a vendor', meta: 'Just now · you', state: 'done' }
          : step,
      )
      this.toast('Vendor assigned · resident notified')
    },
    resolveRequest(requestId) {
      const request = this.requestList.find((item) => item.id === requestId)
      if (!request) return
      request.status = 'Resolved'
      request.sla = 100
      request.target = 'Resolved just now'
      request.steps = request.steps.map((step) => ({ ...step, state: 'done' }))
      this.toast(`${requestId} marked resolved`)
    },
    updateProfile({ name, email, phone }) {
      this.profile.name = name
      this.profile.email = email
      this.profile.phone = phone
      this.session.name = name
      this.session.email = email
      this.persistSession()
      this.toast('Profile updated')
    },
  },
})
