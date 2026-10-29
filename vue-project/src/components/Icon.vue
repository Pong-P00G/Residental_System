<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  stroke: { type: [Number, String], default: 1.8 },
})

const icons = {
  back: '<path d="M15 5l-7 7 7 7"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  filter: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  search: '<circle cx="11" cy="11" r="6.2"/><path d="M15.6 15.6 20.5 20.5"/>',
  heart:
    '<path d="M12 20s-7.2-4.4-7.2-9.3A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.2 3.1C19.2 15.6 12 20 12 20z"/>',
  map: '<path d="M9 4 3.5 6.4v13.2L9 17.2l6 2.4 5.5-2.4V4L15 6.4z"/><path d="M9 4v13.2M15 6.4v13.2"/>',
  home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  inbox: '<path d="M4 5h16v14H4z"/><path d="M4 14h4l2 3h4l2-3h4"/>',
  bell: '<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><circle cx="17" cy="14.5" r="1"/>',
  wrench: '<path d="M15 4a5 5 0 0 0-4.6 7L4 17.4V20h2.6l6.4-6.4A5 5 0 0 0 20 9l-2.5 2.5-3-3z"/>',
  camera:
    '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.4"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  message: '<path d="M4 5h16v11H9l-5 4z"/>',
  phone:
    '<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2z"/>',
  check: '<path d="M4.5 12.5 10 18l9.5-12"/>',
  alert: '<path d="M12 4 2.8 20h18.4z"/><path d="M12 9v5M12 17.2v.2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.2"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5"/>',
  download: '<path d="M12 4v11M8 11l4 4 4-4M4 20h16"/>',
  sort: '<path d="M7 4v16M4 8l3-4 3 4M17 20V4M14 16l3 4 3-4"/>',
  building:
    '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/>',
  chart: '<path d="M4 4v16h16"/><path d="M8 16v-5M13 16V7M18 16v-8"/>',
  shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="M9 12l2 2 4-4"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6v.01M4 12v.01M4 18v.01"/>',
  more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  share: '<path d="M12 16V4M8 8l4-4 4 4"/><path d="M5 13v6h14v-6"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 5H5v10"/>',
  external: '<path d="M14 4h6v6M20 4l-8 8"/><path d="M18 14v5H5V6h5"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  key: '<circle cx="8" cy="8" r="4"/><path d="M11 11l8 8M15.5 15.5l2-2M18.5 18.5l2-2"/>',
  logout: '<path d="M10 5H5v14h5"/><path d="M14 8l4 4-4 4M8 12h10"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/>',
  scale: '<path d="M4 20h16M6 16l4-9h4l4 9"/><path d="M9 9h6"/>',
}

const inner = computed(() => icons[props.name] || icons.info)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="inner"
  />
</template>
