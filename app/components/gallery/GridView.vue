<script setup lang="ts">
import type { Sketch } from '~/composables/useSketches'

defineProps<{
  sketches: Sketch[]
  ink: string
  animate: boolean
}>()

const emit = defineEmits<{ zoom: [Sketch] }>()
</script>

<template>
  <div class="grid-view">
    <div class="grid-inner">
      <div
        v-for="(s, i) in sketches"
        :key="s.id"
        :class="['grid-cell', { 'animate-in': animate }]"
        :style="{ animationDelay: `${(i % 12) * 40}ms` }"
        role="button"
        tabindex="0"
        @click="emit('zoom', s)"
        @keydown.enter.prevent="emit('zoom', s)"
      >
        <SketchFrame
          :width="260"
          :height="340"
          :seed="s.id"
          :ink="ink"
          :image="s.image"
          :content-label="s.date"
        />
        <div class="grid-caption handwritten" :style="{ color: ink }">
          <span class="grid-date">{{ s.date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
