import axios from 'axios'
import { reactive } from 'vue'
import { auth } from './firebase'

// In dev this stays relative and Vite proxies /api to the Express server.
// In production set VITE_API_BASE_URL to the deployed API origin.
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, { status = 0, details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Shared connection state so any view can surface backend failures.
export const connection = reactive({
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  apiReachable: true,
  error: null, // { message, status, at }
  hasFailedRequest: false,
})

// The last retryable request, so Retry can replay it instead of only probing.
let lastFailedRequest = null

const isReplayable = (status) => status === 0 || status >= 500

const rememberFailedRequest = (config, status) => {
  // Network failures and server errors are worth replaying; 4xx are not.
  if (!config || !isReplayable(status) || config.url === '/health') return

  lastFailedRequest = {
    method: config.method,
    url: config.url,
    data: config.data,
    params: config.params,
  }
  connection.hasFailedRequest = true
}

const recordFailure = (error, status) => {
  connection.error = {
    message: error.response?.data?.message || error.message || 'The API request failed',
    status,
    at: Date.now(),
  }
}

const recordSuccess = () => {
  connection.apiReachable = true
  connection.error = null
  connection.hasFailedRequest = false
  lastFailedRequest = null
}

const updateBrowserOnline = () => {
  connection.online = navigator.onLine
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', updateBrowserOnline)
  window.addEventListener('offline', updateBrowserOnline)
}

export const dismissApiError = () => {
  connection.error = null
}

// Cheap reachability probe, used when there is nothing specific to replay.
export const checkApi = async () => {
  try {
    await apiClient.get('/health')
    recordSuccess()
    return true
  } catch {
    return false
  }
}

/**
 * Replay the request that failed, through the same interceptors (fresh token,
 * status bookkeeping). Falls back to a health probe when nothing is pending.
 *
 * Note: replaying a non-idempotent request (POST/PATCH/DELETE) can duplicate a
 * write whose response was lost; payments can supply an idempotencyKey for this.
 */
export const retryLastRequest = async () => {
  const request = lastFailedRequest
  if (!request) return checkApi()

  try {
    const response = await apiClient.request(request)
    recordSuccess()
    return response.data?.data ?? true
  } catch {
    return false
  }
}

// Firebase owns the session; every request presents its ID token.
apiClient.interceptors.request.use(async (config) => {
  const user = auth?.currentUser
  if (user) {
    try {
      config.headers.Authorization = `Bearer ${await user.getIdToken()}`
    } catch {
      // Leave the request unauthenticated; the API answers 401 and callers decide.
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    recordSuccess()
    return response
  },
  (error) => {
    const status = error.response?.status ?? 0
    const message = error.response?.data?.message || error.message || 'Something went wrong'

    // Network/timeout failures mean the API itself is unreachable; server errors
    // mean it answered but failed. Client errors (4xx) are handled by the caller.
    if (status === 0) {
      connection.apiReachable = false
      recordFailure(error, 0)
    } else if (status >= 500) {
      recordFailure(error, status)
    }
    rememberFailedRequest(error.config, status)

    return Promise.reject(new ApiError(message, { status, details: error.response?.data?.details ?? null }))
  },
)

const payload = (response) => response.data?.data ?? null
const collection = (response) => ({ items: response.data?.data ?? [], meta: response.data?.meta ?? null })

export const api = {
  auth: {
    createSession: () => apiClient.post('/auth/session').then(payload),
    getSession: () => apiClient.get('/auth/session').then(payload),
    logout: () => apiClient.post('/auth/logout').then(payload),
  },
  users: {
    me: () => apiClient.get('/users/me').then(payload),
    updateMe: (updates) => apiClient.patch('/users/me', updates).then(payload),
    list: (params) => apiClient.get('/users', { params }).then(collection),
    get: (id) => apiClient.get(`/users/${id}`).then(payload),
    updateRole: (id, role) => apiClient.patch(`/users/${id}/role`, { role }).then(payload),
  },
  properties: {
    list: (params) => apiClient.get('/properties', { params }).then(collection),
    get: (id) => apiClient.get(`/properties/${id}`).then(payload),
    create: (body) => apiClient.post('/properties', body).then(payload),
    update: (id, body) => apiClient.patch(`/properties/${id}`, body).then(payload),
  },
  units: {
    list: (params) => apiClient.get('/units', { params }).then(collection),
    get: (id) => apiClient.get(`/units/${id}`).then(payload),
    create: (body) => apiClient.post('/units', body).then(payload),
    update: (id, body) => apiClient.patch(`/units/${id}`, body).then(payload),
  },
  leases: {
    list: (params) => apiClient.get('/leases', { params }).then(collection),
    get: (id) => apiClient.get(`/leases/${id}`).then(payload),
    create: (body) => apiClient.post('/leases', body).then(payload),
    update: (id, body) => apiClient.patch(`/leases/${id}`, body).then(payload),
  },
  residents: {
    list: (params) => apiClient.get('/residents', { params }).then(collection),
    get: (id) => apiClient.get(`/residents/${id}`).then(payload),
    create: (body) => apiClient.post('/residents', body).then(payload),
    update: (id, body) => apiClient.patch(`/residents/${id}`, body).then(payload),
    endTenancy: (id) => apiClient.delete(`/residents/${id}`).then(payload),
  },
  requests: {
    list: (params) => apiClient.get('/requests', { params }).then(collection),
    get: (id) => apiClient.get(`/requests/${id}`).then(payload),
    create: (body) => apiClient.post('/requests', body).then(payload),
    updateStatus: (id, body) => apiClient.patch(`/requests/${id}/status`, body).then(payload),
    remove: (id) => apiClient.delete(`/requests/${id}`).then(payload),
  },
  payments: {
    list: (params) => apiClient.get('/payments', { params }).then(collection),
    get: (id) => apiClient.get(`/payments/${id}`).then(payload),
    create: (body) => apiClient.post('/payments', body).then(payload),
    update: (id, body) => apiClient.patch(`/payments/${id}`, body).then(payload),
  },
  documents: {
    list: (params) => apiClient.get('/documents', { params }).then(collection),
    get: (id) => apiClient.get(`/documents/${id}`).then(payload),
    create: (body) => apiClient.post('/documents', body).then(payload),
    update: (id, body) => apiClient.patch(`/documents/${id}`, body).then(payload),
    remove: (id) => apiClient.delete(`/documents/${id}`).then(payload),
  },
  notifications: {
    markRead: (id) => apiClient.patch(`/notifications/${id}/read`).then(payload),
    markAllRead: () => apiClient.patch('/notifications/read-all').then(payload),
  },
}