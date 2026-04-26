<script setup lang="ts">
import { computed } from 'vue'
import { seededRandom, jitteredRectPath, jitteredLine } from '~/utils/jitter'

const props = withDefaults(defineProps<{
  width: number
  height: number
  seed: string
  ink?: string
  strokeWidth?: number
  doubleStroke?: boolean
  contentLabel?: string
  inset?: number
  image?: string | null
}>(), {
  ink: 'var(--ink)',
  strokeWidth: 1.1,
  doubleStroke: true,
  contentLabel: 'sketch',
  inset: 14,
  image: null,
})

const frame = computed(() => {
  const r1 = seededRandom(props.seed + '-a')
  const r2 = seededRandom(props.seed + '-b')
  const r3 = seededRandom(props.seed + '-t')
  const d1 = jitteredRectPath(props.width, props.height, r1, 1.4, 36)
  const d2 = props.doubleStroke ? jitteredRectPath(props.width, props.height, r2, 1.0, 36) : null
  const tickLen = 9
  const ticks = [
    jitteredLine(-2, -2, tickLen, -2, r3, 0.4, 6),
    jitteredLine(-2, -2, -2, tickLen, r3, 0.4, 6),
    jitteredLine(props.width + 2, -2, props.width - tickLen, -2, r3, 0.4, 6),
    jitteredLine(props.width + 2, -2, props.width + 2, tickLen, r3, 0.4, 6),
    jitteredLine(-2, props.height + 2, tickLen, props.height + 2, r3, 0.4, 6),
    jitteredLine(-2, props.height + 2, -2, props.height - tickLen, r3, 0.4, 6),
    jitteredLine(props.width + 2, props.height + 2, props.width - tickLen, props.height + 2, r3, 0.4, 6),
    jitteredLine(props.width + 2, props.height + 2, props.width + 2, props.height - tickLen, r3, 0.4, 6),
  ]
  return { d1, d2, ticks }
})
</script>

<template>
  <div class="sketch-frame" :style="{ position: 'relative', width: `${width}px`, height: `${height}px` }">
    <svg
      :viewBox="`-12 -12 ${width + 24} ${height + 24}`"
      :width="width + 24"
      :height="height + 24"
      :style="{ position: 'absolute', left: '-12px', top: '-12px', overflow: 'visible', pointerEvents: 'none' }"
    >
      <path
        :d="frame.d1"
        fill="none"
        :stroke="ink"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.9"
      />
      <path
        v-if="frame.d2"
        :d="frame.d2"
        fill="none"
        :stroke="ink"
        :stroke-width="strokeWidth * 0.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.55"
      />
      <path
        v-for="(d, i) in frame.ticks"
        :key="i"
        :d="d"
        fill="none"
        :stroke="ink"
        :stroke-width="strokeWidth * 0.9"
        stroke-linecap="round"
        opacity="0.7"
      />
    </svg>

    <div
      :style="{
        position: 'absolute',
        inset: `${inset}px`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }"
    >
      <img
        v-if="image"
        :src="image"
        loading="lazy"
        alt=""
        :style="{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }"
      >
      <SketchPlaceholder
        v-else
        :width="width - inset * 2"
        :height="height - inset * 2"
        :seed="seed"
        :ink="ink"
        :label="contentLabel"
      />
    </div>
  </div>
</template>
