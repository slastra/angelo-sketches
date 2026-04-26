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

const sized = computed(() => props.sketches.map(s => ({
  sketch: s,
  ...sizeWidth(s.width, s.height, GRID_CELL_W),
})))
</script>

<template>
  <div class="grid-view">
    <div class="grid-inner">
      <div
        v-for="(item, i) in sized"
        :key="item.sketch.id"
        :class="['grid-cell', { 'animate-in': animate }]"
        :style="{ animationDelay: `${(i % 12) * 40}ms` }"
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
</template>
