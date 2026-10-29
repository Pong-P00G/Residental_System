<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'elevation' }, // elevation | plan | interior | map
  variant: { type: String, default: 'block' }, // block | house
  tint: { type: String, default: '#DCE7F2' },
  label: { type: String, default: '' },
  widthLabel: { type: String, default: '' },
  scale: { type: String, default: '1:100' },
})

const gridX = Array.from({ length: 15 }, (_, i) => (i + 1) * 20)
const gridY = Array.from({ length: 9 }, (_, i) => (i + 1) * 20)

const blockWindows = computed(() => {
  const out = []
  for (const y of [71, 97, 123, 149]) {
    for (const x of [108, 152, 196]) out.push({ x, y })
  }
  return out
})

const houseWindows = computed(() => {
  const out = []
  for (const y of [123, 149]) {
    for (const x of [103, 152, 201]) out.push({ x, y })
  }
  return out
})

const aria = computed(() => {
  const map = {
    elevation: 'Architectural elevation drawing',
    plan: 'Floor plan drawing',
    interior: 'Interior line drawing',
    map: 'Neighbourhood map drawing',
  }
  return `${map[props.type] || 'Drafting plate'}${props.label ? ', plate ' + props.label : ''}`
})

const planLabel = computed(() => props.label || 'A-01 · PLAN L2')
const interiorLabel = computed(() => props.label || 'A-01 · INT. 01')
</script>

<template>
  <svg viewBox="0 0 320 200" role="img" :aria-label="aria" class="block h-auto w-full">
    <rect x="0" y="0" width="320" height="200" :fill="type === 'map' ? '#EDF1F5' : tint" />

    <g v-if="type !== 'map'" stroke="#1D3557" stroke-opacity="0.09" stroke-width="0.6">
      <line v-for="x in gridX" :key="'x' + x" :x1="x" y1="0" :x2="x" y2="200" />
      <line v-for="y in gridY" :key="'y' + y" x1="0" :y1="y" x2="320" :y2="y" />
    </g>

    <!-- ------------------------------------------------ elevation -->
    <g v-if="type === 'elevation' && variant === 'block'">
      <rect x="134.4" y="34" width="105.6" height="30" :fill="tint" stroke="#1D3557" stroke-width="1.1" />
      <rect x="144.4" y="44" width="18" height="10" fill="#FFFFFF" fill-opacity="0.55" stroke="#1D3557" stroke-width="0.7" />
      <rect x="174.4" y="44" width="18" height="10" fill="#FFFFFF" fill-opacity="0.55" stroke="#1D3557" stroke-width="0.7" />
      <rect x="80" y="64" width="160" height="104" fill="#FFFFFF" fill-opacity="0.42" stroke="#1D3557" stroke-width="1.3" />
      <g v-for="(w, i) in blockWindows" :key="'bw' + i">
        <rect :x="w.x" :y="w.y" width="16" height="12" fill="#FFFFFF" fill-opacity="0.7" stroke="#1D3557" stroke-width="0.75" />
        <line :x1="w.x + 8" :y1="w.y" :x2="w.x + 8" :y2="w.y + 12" stroke="#1D3557" stroke-width="0.5" stroke-opacity="0.55" />
      </g>
      <rect x="148" y="138" width="24" height="30" fill="#1D3557" fill-opacity="0.14" stroke="#1D3557" stroke-width="1" />
      <circle cx="166" cy="153" r="1.6" fill="#1D3557" />
      <line x1="18" y1="168" x2="302" y2="168" stroke="#1D3557" stroke-width="1.3" />
      <g stroke="#1D3557" stroke-opacity="0.35" stroke-width="0.7">
        <line v-for="i in 21" :key="'h' + i" :x1="7 + i * 13" y1="169" :x2="i * 13" y2="177" />
      </g>
      <line x1="80" y1="188" x2="240" y2="188" stroke="#1D3557" stroke-width="0.7" stroke-opacity="0.75" />
      <line x1="80" y1="184" x2="80" y2="192" stroke="#1D3557" stroke-width="0.7" stroke-opacity="0.75" />
      <line x1="240" y1="184" x2="240" y2="192" stroke="#1D3557" stroke-width="0.7" stroke-opacity="0.75" />
      <text x="160" y="184" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="#1D3557" fill-opacity="0.8">
        {{ widthLabel || '18.4 m' }}
      </text>
      <text x="12" y="16" font-family="IBM Plex Mono, monospace" font-size="7.5" letter-spacing="1" fill="#1D3557" fill-opacity="0.72">
        {{ label || 'A-101 · ELEV. S' }}
      </text>
      <text x="308" y="194" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="7" fill="#1D3557" fill-opacity="0.5">
        {{ scale }}
      </text>
    </g>

    <g v-else-if="type === 'elevation'">
      <polygon points="60,116 160,82 260,116" :fill="tint" stroke="#1D3557" stroke-width="1.2" />
      <rect x="70" y="116" width="180" height="52" fill="#FFFFFF" fill-opacity="0.42" stroke="#1D3557" stroke-width="1.3" />
      <g v-for="(w, i) in houseWindows" :key="'hw' + i">
        <rect :x="w.x" :y="w.y" width="16" height="12" fill="#FFFFFF" fill-opacity="0.7" stroke="#1D3557" stroke-width="0.75" />
        <line :x1="w.x + 8" :y1="w.y" :x2="w.x + 8" :y2="w.y + 12" stroke="#1D3557" stroke-width="0.5" stroke-opacity="0.55" />
      </g>
      <rect x="149" y="138" width="24" height="30" fill="#1D3557" fill-opacity="0.14" stroke="#1D3557" stroke-width="1" />
      <circle cx="167" cy="153" r="1.6" fill="#1D3557" />
      <line x1="18" y1="168" x2="302" y2="168" stroke="#1D3557" stroke-width="1.3" />
      <g stroke="#1D3557" stroke-opacity="0.35" stroke-width="0.7">
        <line v-for="i in 21" :key="'hh' + i" :x1="7 + i * 13" y1="169" :x2="i * 13" y2="177" />
      </g>
      <line x1="70" y1="188" x2="250" y2="188" stroke="#1D3557" stroke-width="0.7" stroke-opacity="0.75" />
      <line x1="70" y1="184" x2="70" y2="192" stroke="#1D3557" stroke-width="0.7" stroke-opacity="0.75" />
      <line x1="250" y1="184" x2="250" y2="192" stroke="#1D3557" stroke-width="0.7" stroke-opacity="0.75" />
      <text x="160" y="184" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="#1D3557" fill-opacity="0.8">
        {{ widthLabel || '11.2 m' }}
      </text>
      <text x="12" y="16" font-family="IBM Plex Mono, monospace" font-size="7.5" letter-spacing="1" fill="#1D3557" fill-opacity="0.72">
        {{ label || 'A-104 · ELEV. S' }}
      </text>
      <text x="308" y="194" text-anchor="end" font-family="IBM Plex Mono, monospace" font-size="7" fill="#1D3557" fill-opacity="0.5">
        {{ scale }}
      </text>
    </g>

    <!-- ------------------------------------------------ floor plan -->
    <g v-else-if="type === 'plan'">
      <rect x="34" y="28" width="252" height="146" fill="#FFFFFF" fill-opacity="0.5" stroke="#1D3557" stroke-width="2.2" />
      <g stroke="#1D3557" stroke-width="1.4">
        <line x1="150" y1="28" x2="150" y2="112" />
        <line x1="34" y1="112" x2="150" y2="112" />
        <line x1="222" y1="112" x2="222" y2="174" />
        <line x1="222" y1="112" x2="286" y2="112" />
      </g>
      <path d="M150 78 a22 22 0 0 0 -22 22" fill="none" stroke="#1D3557" stroke-width="0.8" stroke-opacity="0.7" />
      <path d="M222 138 a20 20 0 0 1 20 20" fill="none" stroke="#1D3557" stroke-width="0.8" stroke-opacity="0.7" />
      <g stroke="#1D3557" stroke-width="1.1">
        <line x1="58" y1="25" x2="58" y2="31" /><line x1="76" y1="25" x2="76" y2="31" />
        <line x1="96" y1="25" x2="96" y2="31" /><line x1="114" y1="25" x2="114" y2="31" />
        <line x1="186" y1="25" x2="186" y2="31" /><line x1="204" y1="25" x2="204" y2="31" />
        <line x1="246" y1="25" x2="246" y2="31" /><line x1="264" y1="25" x2="264" y2="31" />
      </g>
      <g stroke="#1D3557" stroke-width="0.7">
        <line x1="58" y1="28" x2="76" y2="28" /><line x1="96" y1="28" x2="114" y2="28" />
        <line x1="186" y1="28" x2="204" y2="28" /><line x1="246" y1="28" x2="264" y2="28" />
      </g>
      <g font-family="IBM Plex Mono, monospace" font-size="7.5" letter-spacing="1" fill="#1D3557" fill-opacity="0.75" text-anchor="middle">
        <text x="78" y="74">LIVING</text>
        <text x="178" y="74">BEDROOM</text>
        <text x="84" y="146">KITCHEN</text>
        <text x="252" y="148">BATH</text>
      </g>
      <line x1="34" y1="188" x2="286" y2="188" stroke="#1D3557" stroke-width="0.7" stroke-opacity="0.75" />
      <line x1="34" y1="184" x2="34" y2="192" stroke="#1D3557" stroke-width="0.7" stroke-opacity="0.75" />
      <line x1="286" y1="184" x2="286" y2="192" stroke="#1D3557" stroke-width="0.7" stroke-opacity="0.75" />
      <text x="160" y="184" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7.5" fill="#1D3557" fill-opacity="0.8">9.6 m</text>
      <text x="12" y="16" font-family="IBM Plex Mono, monospace" font-size="7.5" letter-spacing="1" fill="#1D3557" fill-opacity="0.72">{{ planLabel }}</text>
    </g>

    <!-- ------------------------------------------------ interior -->
    <g v-else-if="type === 'interior'">
      <line x1="20" y1="156" x2="300" y2="156" stroke="#1D3557" stroke-width="1.4" />
      <rect x="26" y="40" width="268" height="116" fill="#FFFFFF" fill-opacity="0.3" stroke="#1D3557" stroke-width="1.1" />
      <rect x="196" y="52" width="86" height="66" fill="#FFFFFF" fill-opacity="0.6" stroke="#1D3557" stroke-width="1" />
      <line x1="239" y1="52" x2="239" y2="118" stroke="#1D3557" stroke-width="0.7" />
      <line x1="196" y1="85" x2="282" y2="85" stroke="#1D3557" stroke-width="0.7" />
      <rect x="200" y="124" width="78" height="20" rx="3" fill="none" stroke="#1D3557" stroke-width="0.9" />
      <g stroke="#1D3557" stroke-width="0.6" stroke-opacity="0.7">
        <line x1="208" y1="126" x2="208" y2="142" /><line x1="217" y1="126" x2="217" y2="142" />
        <line x1="226" y1="126" x2="226" y2="142" /><line x1="235" y1="126" x2="235" y2="142" />
        <line x1="244" y1="126" x2="244" y2="142" /><line x1="253" y1="126" x2="253" y2="142" />
        <line x1="262" y1="126" x2="262" y2="142" /><line x1="271" y1="126" x2="271" y2="142" />
      </g>
      <rect x="44" y="112" width="104" height="30" rx="5" fill="#FFFFFF" fill-opacity="0.45" stroke="#1D3557" stroke-width="1" />
      <line x1="44" y1="122" x2="148" y2="122" stroke="#1D3557" stroke-width="0.7" />
      <line x1="82" y1="122" x2="82" y2="142" stroke="#1D3557" stroke-width="0.7" stroke-opacity="0.7" />
      <line x1="110" y1="122" x2="110" y2="142" stroke="#1D3557" stroke-width="0.7" stroke-opacity="0.7" />
      <ellipse cx="176" cy="140" rx="22" ry="6" fill="none" stroke="#1D3557" stroke-width="0.9" />
      <line x1="176" y1="140" x2="176" y2="156" stroke="#1D3557" stroke-width="0.8" />
      <line x1="60" y1="156" x2="60" y2="96" stroke="#1D3557" stroke-width="0.8" />
      <polygon points="48,96 72,96 66,80 54,80" fill="none" stroke="#1D3557" stroke-width="0.9" />
      <ellipse cx="150" cy="152" rx="86" ry="10" fill="none" stroke="#1D3557" stroke-width="0.7" stroke-dasharray="4 3" stroke-opacity="0.7" />
      <path d="M266 156 l-6 -22 h12 z" fill="none" stroke="#1D3557" stroke-width="0.9" />
      <path d="M266 134 q-12 -6 -10 -20 M266 134 q12 -6 10 -20 M266 134 v-22" fill="none" stroke="#1D3557" stroke-width="0.8" />
      <text x="12" y="16" font-family="IBM Plex Mono, monospace" font-size="7.5" letter-spacing="1" fill="#1D3557" fill-opacity="0.72">{{ interiorLabel }}</text>
    </g>

    <!-- ------------------------------------------------ site map -->
    <g v-else>
      <g fill="#DDE5EC" stroke="#1D3557" stroke-opacity="0.16" stroke-width="0.8">
        <rect x="16" y="14" width="86" height="52" rx="3" />
        <rect x="118" y="14" width="74" height="40" rx="3" />
        <rect x="210" y="14" width="94" height="62" rx="3" />
        <rect x="16" y="86" width="70" height="44" rx="3" />
        <rect x="104" y="74" width="88" height="56" rx="3" />
        <rect x="210" y="96" width="94" height="44" rx="3" />
        <rect x="16" y="150" width="180" height="38" rx="3" />
        <rect x="212" y="158" width="92" height="30" rx="3" />
      </g>
      <rect x="104" y="146" width="86" height="42" rx="3" fill="#E2E8DE" stroke="#1D3557" stroke-opacity="0.16" />
      <text x="112" y="170" font-family="IBM Plex Mono, monospace" font-size="6.5" letter-spacing="1" fill="#1D3557" fill-opacity="0.55">PARK</text>
      <path d="M0 66 H320" stroke="#FFFFFF" stroke-width="12" />
      <path d="M100 0 V200" stroke="#FFFFFF" stroke-width="14" />
      <path d="M0 66 H320" stroke="#1D3557" stroke-opacity="0.2" stroke-width="0.8" stroke-dasharray="7 6" />
      <path d="M100 0 V200" stroke="#1D3557" stroke-opacity="0.2" stroke-width="0.8" stroke-dasharray="7 6" />
      <path d="M40 200 L300 30" stroke="#FFFFFF" stroke-width="9" />
      <circle cx="176" cy="104" r="34" fill="#1D3557" fill-opacity="0.07" stroke="#1D3557" stroke-opacity="0.25" stroke-width="0.8" />
      <circle cx="176" cy="104" r="5" fill="#1D3557" />
      <circle cx="176" cy="104" r="1.8" fill="#FFFFFF" />
    </g>
  </svg>
</template>
