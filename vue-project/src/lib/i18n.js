import { preferences } from './preferences'

const messages = {
  en: {
    'preferences.title': 'Preferences',
    'preferences.subtitle': 'Appearance, notifications and language for this browser.',
    'preferences.theme': 'Theme',
    'preferences.themeHint': 'Choose how Tenure looks. System follows your device.',
    'preferences.light': 'Light',
    'preferences.dark': 'Dark',
    'preferences.system': 'System',
    'preferences.notifications': 'Notifications',
    'preferences.notificationsHint': 'Push keeps the bell and alerts on. Muted hides badges and push messages.',
    'preferences.push': 'Push',
    'preferences.muted': 'Muted',
    'preferences.language': 'Language',
    'preferences.languageHint': 'Interface language for this browser. English is the default.',
    'preferences.english': 'English',
    'preferences.khmer': 'Khmer',
    'preferences.note': 'Changes apply immediately and are saved on this device.',
  },
  km: {
    'preferences.title': 'ចំណូលចិត្ត',
    'preferences.subtitle': 'រូបរាង ការជូនដំណឹង និងភាសាសម្រាប់កម្មវិធីរុករកនេះ។',
    'preferences.theme': 'រូបរាង',
    'preferences.themeHint': 'ជ្រើសរើសរបៀបដែល Tenure បង្ហាញ។ ប្រព័ន្ធ នឹងធ្វើតាមការកំណត់ឧបករណ៍។',
    'preferences.light': 'ភ្លឺ',
    'preferences.dark': 'ងងឹត',
    'preferences.system': 'ប្រព័ន្ធ',
    'preferences.notifications': 'ការជូនដំណឹង',
    'preferences.notificationsHint': 'បើក ដើម្បីរក្សាសញ្ញារណ្ដំ។ បិទ ដើម្បីលាក់សញ្ញា និងសារជូនដំណឹង។',
    'preferences.push': 'បើក',
    'preferences.muted': 'បិទ',
    'preferences.language': 'ភាសា',
    'preferences.languageHint': 'ភាសាសម្រាប់ចំណុចប្រទាក់ក្នុងកម្មវិធីរុករកនេះ។ ភាសាអង់គ្លេសជាលំនាំដើម។',
    'preferences.english': 'អង់គ្លេស',
    'preferences.khmer': 'ខ្មែរ',
    'preferences.note': 'ការផ្លាស់ប្ដូរត្រូវបានអនុវត្តភ្លាមៗ និងរក្សាទុកនៅលើឧបករណ៍នេះ។',
  },
}

export function t(key) {
  const dictionary = messages[preferences.language] || messages.en
  return dictionary[key] ?? messages.en[key] ?? key
}
