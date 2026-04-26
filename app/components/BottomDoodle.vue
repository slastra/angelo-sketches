<script setup lang="ts">
// Small hand-drawn spiral that links to /admin. Seeded so it renders the same
// every load, with the same pen-jitter as the gallery frames.

import { computed } from 'vue'
import { seededRandom } from '~/utils/jitter'

defineProps<{ ink: string }>()

const path = computed(() => {
  const rand = seededRandom('admin-doodle')
  const segs = 64
  const turns = 2.4
  const maxR = 9
  const cx = 14
  const cy = 14
  const pts: [number, number][] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    const angle = t * turns * Math.PI * 2
    const r = t * maxR
    pts.push([
      cx + Math.cos(angle) * r + (rand() - 0.5) * 0.6,
      cy + Math.sin(angle) * r + (rand() - 0.5) * 0.6,
    ])
  }
  const first = pts[0]!
  let d = `M ${first[0].toFixed(2)} ${first[1].toFixed(2)}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i]!
    d += ` L ${p[0].toFixed(2)} ${p[1].toFixed(2)}`
  }
  return d
})
</script>

<template>
  <NuxtLink
    to="/admin"
    class="doodle"
    :style="{ color: ink }"
    aria-label="Admin"
    title="admin"
  >
    <svg width="28" height="28" viewBox="0 0 28 28">
      <path
        :d="path"
        fill="none"
        :stroke="ink"
        stroke-width="1.1"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.85"
      />
    </svg>
  </NuxtLink>
</template>

<style scoped>
.doodle {
  position: fixed;
  bottom: 22px;
  left: 30px;
  z-index: 30;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  opacity: 0.4;
  color: inherit;
  transition: opacity 0.2s, transform 0.25s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.doodle:hover { opacity: 0.85; transform: rotate(-10deg) scale(1.08); }
.doodle:focus-visible {
  outline: 1px dashed currentColor;
  outline-offset: 4px;
  border-radius: 50%;
  opacity: 0.85;
}
</style>
