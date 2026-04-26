<script setup lang="ts">
import { computed } from 'vue'
import { seededRandom } from '~/utils/jitter'
import type { Sketch } from '~/composables/useSketches'

const props = defineProps<{
  sketches: Sketch[]
  ink: string
  animate: boolean
}>()

const emit = defineEmits<{ zoom: [Sketch] }>()

const layout = computed(() => {
  const cols = 4
  const rows = Math.ceil(props.sketches.length / cols)
  return props.sketches.map((s, i) => {
    const r = seededRandom(s.id + '-pos')
    const col = i % cols
    const row = Math.floor(i / cols)
    const jx = (r() - 0.5) * 80
    const jy = (r() - 0.5) * 80
    const rot = (r() - 0.5) * 6
    const w = 220 + Math.floor(r() * 60)
    const h = 280 + Math.floor(r() * 80)
    return { ...s, col, row, jx, jy, rot, w, h, _rows: rows }
  })
})

const cellW = 320
const cellH = 380
const totalRows = computed(() => layout.value[0]?._rows || 1)
</script>

<template>
  <div class="scattered-view">
    <div
      class="scattered-inner"
      :style="{
        width: `${4 * cellW + 80}px`,
        height: `${totalRows * cellH + 80}px`,
      }"
    >
      <div
        v-for="(s, i) in layout"
        :key="s.id"
        :class="['scattered-cell', { 'animate-in': animate }]"
        :style="{
          left: `${s.col * cellW + 40 + s.jx}px`,
          top: `${s.row * cellH + 40 + s.jy}px`,
          transform: `rotate(${s.rot}deg)`,
          width: `${s.w}px`,
          height: `${s.h}px`,
          animationDelay: `${(i % 16) * 35}ms`,
        }"
        role="button"
        tabindex="0"
        @click="emit('zoom', s)"
        @keydown.enter.prevent="emit('zoom', s)"
      >
        <SketchFrame
          :width="s.w"
          :height="s.h"
          :seed="s.id"
          :ink="ink"
          :image="s.image"
          :content-label="s.date"
        />
        <div class="scattered-caption handwritten" :style="{ color: ink }">
          {{ s.date }}
        </div>
      </div>
    </div>
  </div>
</template>
