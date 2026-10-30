import { reactive } from 'vue'

const STORAGE_KEY = 'tenure.preferences.v1'

export const THEMES = ['light', 'dark', 'system']
export const NOTIFICATION_MODES = ['push', 'muted']
export const LANGUAGES = ['en', 'km']

export const preferences = reactive({
  theme: 'system',
  notifications: 'push',
  language: 'en',
})

let systemThemeQuery = null

function applyTheme() {
  const prefersDark = systemThemeQuery ? systemThemeQuery.matches : false
  const dark = preferences.theme === 'dark' || (preferences.theme === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

function applyLanguage() {
  document.documentElement.lang = preferences.language === 'km' ? 'km' : 'en'
}

function load() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
    if (!saved) return
    if (THEMES.includes(saved.theme)) preferences.theme = saved.theme
    if (NOTIFICATION_MODES.includes(saved.notifications)) preferences.notifications = saved.notifications
    if (LANGUAGES.includes(saved.language)) preferences.language = saved.language
  } catch {
    // Storage can be unavailable — defaults stay in place for this visit.
  }
}

export function savePreferences() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        theme: preferences.theme,
        notifications: preferences.notifications,
        language: preferences.language,
      }),
    )
  } catch {
    // Storage can be unavailable (private mode, quota) — the session still works.
  }
}

export function setPreference(key, value) {
  if (!(key in preferences)) return
  preferences[key] = value
  savePreferences()
  applyTheme()
  applyLanguage()
}

export function initPreferences() {
  if (typeof window === 'undefined') return
  load()
  systemThemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)') || null
  applyTheme()
  applyLanguage()
  systemThemeQuery?.addEventListener?.('change', () => {
    if (preferences.theme === 'system') applyTheme()
  })
}
