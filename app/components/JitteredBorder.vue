<script setup lang="ts">
// Wraps a slot in a hand-drawn (jittered) SVG rectangle border. Seeded so a
// given element always gets the same wobble; redraws when the wrapper resizes.

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { seededRandom, jitteredRectPath } from '~/utils/jitter'

const props = withDefaults(defineProps<{
  seed: string
  ink?: string
  strokeWidth?: number
  jitter?: number
  segs?: number
  doubleStroke?: boolean
  /** rounded radius hint (px) — currently visual only via SVG corners */
  radius?: number
  /** SVG stroke-dasharray (e.g. "8 6") for a dashed pen feel */
  dasharray?: string | null
}>(), {
  ink: 'currentColor',
  strokeWidth: 1.1,
  jitter: 1.2,
  segs: 28,
  doubleStroke: false,
  radius: 0,
  dasharray: null,
})

const wrapRef = ref<HTMLElement | null>(null)
const dims = ref({ w: 0, h: 0 })
const paths = ref<{ d1: string, d2: string | null }>({ d1: '', d2: null })

function recompute() {
  const el = wrapRef.value
  if (!el) return
  const w = Math.max(2, Math.round(el.offsetWidth))
  const h = Math.max(2, Math.round(el.offsetHeight))
  if (w === dims.value.w && h === dims.value.h) return
  dims.value = { w, h }
  const r1 = seededRandom(props.seed + '-a-' + w + 'x' + h)
  const r2 = seededRandom(props.seed + '-b-' + w + 'x' + h)
  paths.value = {
    d1: jitteredRectPath(w, h, r1, props.jitter, props.segs),
    d2: props.doubleStroke ? jitteredRectPath(w, h, r2, props.jitter * 0.7, props.segs) : null,
  }
}

let ro: ResizeObserver | null = null
onMounted(() => {
  recompute()
  if (typeof ResizeObserver !== 'undefined' && wrapRef.value) {
    ro = new ResizeObserver(() => recompute())
    ro.observe(wrapRef.value)
  } else {
    window.addEventListener('resize', recompute)
  }
})
onBeforeUnmount(() => {
  ro?.disconnect()
  if (typeof ResizeObserver === 'undefined') window.removeEventListener('resize', recompute)
})
</script>

<template>
  <div ref="wrapRef" class="jb">
    <svg
      v-if="dims.w && dims.h"
      class="jb-svg"
      :viewBox="`-2 -2 ${dims.w + 4} ${dims.h + 4}`"
      :width="dims.w + 4"
      :height="dims.h + 4"
      aria-hidden="true"
    >
      <path
        :d="paths.d1"
        fill="none"
        :stroke="ink"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        :stroke-dasharray="dasharray || undefined"
        opacity="0.85"
      />
      <path
        v-if="paths.d2"
        :d="paths.d2"
        fill="none"
        :stroke="ink"
        :stroke-width="strokeWidth * 0.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        :stroke-dasharray="dasharray || undefined"
        opacity="0.5"
      />
    </svg>
    <div class="jb-content"><slot /></div>
  </div>
</template>

<style scoped>
.jb { position: relative; }
.jb-svg {
  position: absolute;
  inset: -2px;
  pointer-events: none;
  overflow: visible;
}
.jb-content { position: relative; }
</style>
