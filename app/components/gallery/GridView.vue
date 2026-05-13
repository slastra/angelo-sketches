<script setup lang="ts">
import type { Sketch } from '~/composables/useSketches'
import { sizeWidth } from '~/utils/aspect'

const props = defineProps<{
  sketches: Sketch[]
  ink: string
  animate: boolean
}>()

const emit = defineEmits<{ zoom: [Sketch] }>()

const GRID_CELL_W = 260
const PER_ITEM_OVERHEAD = 82 // caption (~32) + col-gap (50)

const sized = computed(() => props.sketches.map((s, idx) => ({
  sketch: s,
  idx,
  ...sizeWidth(s.width, s.height, GRID_CELL_W),
})))

const cols = ref(3)
const mqls: { mql: MediaQueryList, handler: () => void }[] = []

onMounted(() => {
  const queries = [
    { q: '(max-width: 599px)', n: 1 },
    { q: '(min-width: 600px) and (max-width: 999px)', n: 2 },
    { q: '(min-width: 1000px) and (max-width: 1299px)', n: 3 },
    { q: '(min-width: 1300px)', n: 4 },
  ]
  for (const { q, n } of queries) {
    const mql = window.matchMedia(q)
    const handler = () => { if (mql.matches) cols.value = n }
    mql.addEventListener('change', handler)
    handler()
    mqls.push({ mql, handler })
  }
})

onBeforeUnmount(() => {
  for (const { mql, handler } of mqls) mql.removeEventListener('change', handler)
  mqls.length = 0
})

const columns = computed(() => {
  const n = cols.value
  const buckets: typeof sized.value[number][][] = Array.from({ length: n }, () => [])
  const heights = new Array(n).fill(0)
  for (const item of sized.value) {
    let mi = 0
    for (let i = 1; i < n; i++) if (heights[i]! < heights[mi]!) mi = i
    buckets[mi]!.push(item)
    heights[mi]! += item.h + PER_ITEM_OVERHEAD
  }
  return buckets
})
</script>

<template>
  <div class="grid-view">
    <div class="grid-inner">
      <div v-for="(col, ci) in columns" :key="ci" class="grid-col">
        <div
          v-for="item in col"
          :key="item.sketch.id"
          :class="['grid-cell', { 'animate-in': animate }]"
          :style="{ animationDelay: `${(item.idx % 12) * 40}ms` }"
          role="button"
          tabindex="0"
          @click="emit('zoom', item.sketch)"
          @keydown.enter.prevent="emit('zoom', item.sketch)"
        >
          <SketchFrame
            :width="item.w"
            :height="item.h"
            :seed="item.sketch.id"
            :ink="ink"
            :image="item.sketch.image"
            :content-label="item.sketch.date"
          />
          <div class="grid-caption handwritten" :style="{ color: ink }">
            <span class="grid-date">{{ item.sketch.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
