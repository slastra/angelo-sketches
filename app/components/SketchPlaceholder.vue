<script setup lang="ts">
// Procedural hand-drawn placeholder; ported from sketch-frame.jsx motifs.
import { computed } from 'vue'
import {
  seededRandom,
  jitteredCircle,
  jitteredLine,
  jitteredArcEllipse,
  jitteredRectPathAt,
} from '~/utils/jitter'

const props = withDefaults(defineProps<{
  width: number
  height: number
  seed: string
  ink?: string
  label?: string
}>(), { ink: 'var(--ink)', label: 'sketch' })

interface Stroke { d: string, w: number }

const motifs = ['still-life', 'figure', 'landscape', 'architecture', 'object', 'portrait', 'study', 'abstract']

const data = computed(() => {
  const r = seededRandom(props.seed + '-shapes')
  const pickRand = seededRandom(props.seed + '-p')
  const motif = motifs[Math.floor(pickRand() * motifs.length)]
  const cx = props.width / 2
  const cy = props.height / 2
  const paths: Stroke[] = []

  if (motif === 'still-life') {
    paths.push({ d: jitteredArcEllipse(cx, cy + 40, 90, 30, 0, Math.PI, r), w: 1.2 })
    paths.push({ d: jitteredArcEllipse(cx, cy + 40, 90, 30, Math.PI, 2 * Math.PI, r, 0.4), w: 0.8 })
    paths.push({ d: jitteredCircle(cx - 30, cy + 10, 22, r), w: 1.1 })
    paths.push({ d: jitteredCircle(cx + 25, cy + 5, 28, r), w: 1.1 })
    paths.push({ d: jitteredCircle(cx + 5, cy - 5, 18, r), w: 1.0 })
  } else if (motif === 'figure') {
    paths.push({ d: jitteredCircle(cx, cy - 80, 26, r, 0.6), w: 1.1 })
    paths.push({ d: jitteredLine(cx, cy - 54, cx, cy + 30, r, 0.8, 14), w: 1.1 })
    paths.push({ d: jitteredLine(cx, cy - 30, cx - 50, cy + 5, r, 0.8, 12), w: 1.0 })
    paths.push({ d: jitteredLine(cx, cy - 30, cx + 55, cy - 5, r, 0.8, 12), w: 1.0 })
    paths.push({ d: jitteredLine(cx, cy + 30, cx - 30, cy + 100, r, 0.8, 14), w: 1.1 })
    paths.push({ d: jitteredLine(cx, cy + 30, cx + 35, cy + 100, r, 0.8, 14), w: 1.1 })
  } else if (motif === 'landscape') {
    const horizon = cy + 20
    paths.push({ d: jitteredLine(20, horizon, props.width - 20, horizon, r, 0.8, 24), w: 1.0 })
    paths.push({ d: jitteredArcEllipse(cx - 60, horizon, 80, 35, Math.PI, 2 * Math.PI, r), w: 1.0 })
    paths.push({ d: jitteredArcEllipse(cx + 70, horizon, 100, 50, Math.PI, 2 * Math.PI, r), w: 1.0 })
    paths.push({ d: jitteredCircle(cx + 60, cy - 60, 28, r, 0.4), w: 1.1 })
  } else if (motif === 'architecture') {
    const w = 160, h = 110
    const x = cx - w / 2, y = cy - h / 2 + 20
    paths.push({ d: jitteredLine(x, y + h, x, y + 20, r, 0.6, 10), w: 1.1 })
    paths.push({ d: jitteredLine(x + w, y + h, x + w, y + 20, r, 0.6, 10), w: 1.1 })
    paths.push({ d: jitteredLine(x, y + h, x + w, y + h, r, 0.6, 12), w: 1.1 })
    paths.push({ d: jitteredLine(x, y + 20, cx, y - 30, r, 0.6, 12), w: 1.1 })
    paths.push({ d: jitteredLine(cx, y - 30, x + w, y + 20, r, 0.6, 12), w: 1.1 })
    paths.push({ d: jitteredRectPathAt(cx - 18, y + h - 50, 36, 50, r), w: 1.0 })
  } else if (motif === 'object') {
    paths.push({ d: jitteredArcEllipse(cx, cy + 30, 70, 60, 0, Math.PI, r), w: 1.1 })
    paths.push({ d: jitteredArcEllipse(cx, cy + 30, 70, 60, Math.PI, 2 * Math.PI, r), w: 1.1 })
    paths.push({ d: jitteredLine(cx - 50, cy - 20, cx + 50, cy - 20, r, 0.5, 10), w: 1.0 })
    paths.push({ d: jitteredArcEllipse(cx + 70, cy + 20, 25, 20, -Math.PI / 2, Math.PI / 2, r), w: 1.0 })
  } else if (motif === 'portrait') {
    paths.push({ d: jitteredCircle(cx, cy, 70, r, 0.5), w: 1.2 })
    paths.push({ d: jitteredLine(cx - 25, cy - 10, cx - 10, cy - 10, r, 0.4, 6), w: 1.0 })
    paths.push({ d: jitteredLine(cx + 10, cy - 10, cx + 25, cy - 10, r, 0.4, 6), w: 1.0 })
    paths.push({ d: jitteredLine(cx - 15, cy + 25, cx + 15, cy + 25, r, 0.4, 6), w: 1.0 })
    paths.push({ d: jitteredLine(cx, cy, cx, cy + 12, r, 0.4, 6), w: 0.9 })
  } else if (motif === 'study') {
    paths.push({ d: jitteredCircle(cx, cy, 80, r, 0.5), w: 1.2 })
    for (let i = 0; i < 14; i++) {
      const ang = -Math.PI / 4
      const off = -50 + i * 8
      const x1 = cx + Math.cos(ang) * 70 + off * 0.7
      const y1 = cy + Math.sin(ang) * 70 + off * 0.7
      const x2 = cx + Math.cos(ang + Math.PI) * 70 + off * 0.7
      const y2 = cy + Math.sin(ang + Math.PI) * 70 + off * 0.7
      paths.push({ d: jitteredLine(x1, y1, x2, y2, r, 0.4, 8), w: 0.5 })
    }
  } else {
    paths.push({ d: jitteredCircle(cx - 30, cy - 10, 60, r, 0.6), w: 1.1 })
    paths.push({ d: jitteredRectPathAt(cx - 10, cy - 30, 90, 90, r, 1.2), w: 1.1 })
    paths.push({ d: jitteredLine(cx - 80, cy + 60, cx + 80, cy - 60, r, 0.6, 16), w: 1.0 })
  }

  return { paths }
})
</script>

<template>
  <svg
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    style="display: block"
  >
    <path
      v-for="(p, i) in data.paths"
      :key="i"
      :d="p.d"
      fill="none"
      :stroke="ink"
      :stroke-width="p.w"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.85"
    />
    <text
      v-if="label"
      :x="width / 2"
      :y="height - 14"
      text-anchor="middle"
      :fill="ink"
      opacity="0.45"
      style="font-family: var(--hand); font-size: 13px; font-style: italic"
    >{{ label }}</text>
  </svg>
</template>
