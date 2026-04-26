<script setup lang="ts">
import type { Sketch } from '~/composables/useSketches'
import { sizeWithin } from '~/utils/aspect'

const props = defineProps<{ sketch: Sketch | null, ink: string }>()
const emit = defineEmits<{ close: [] }>()

const dims = ref({ w: 540, h: 700 })

function recompute() {
  if (!import.meta.client || !props.sketch) return
  const maxW = Math.max(280, window.innerWidth - 220)
  const maxH = Math.max(280, window.innerHeight - 180)
  dims.value = sizeWithin(props.sketch.width, props.sketch.height, maxW, maxH)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(() => props.sketch?.id, (id) => {
  if (id && import.meta.client) {
    recompute()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', recompute)
  } else if (import.meta.client) {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('resize', recompute)
  }
}, { immediate: true })

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', recompute)
})
</script>

<template>
  <div v-if="sketch" class="zoom-overlay" @click="emit('close')">
    <div class="zoom-stage" @click.stop>
      <div class="zoom-meta-top handwritten" :style="{ color: ink }">
        <span>{{ sketch.date }}</span>
      </div>

      <div class="zoom-frame-wrap">
        <SketchFrame
          :width="dims.w"
          :height="dims.h"
          :seed="sketch.id"
          :ink="ink"
          :image="sketch.image"
          :content-label="sketch.date"
        />
      </div>

      <div class="zoom-meta-bottom handwritten" :style="{ color: ink }">
        <template v-for="(t, i) in sketch.tags" :key="t">
          <span>{{ t }}</span>
          <span v-if="i < sketch.tags.length - 1" class="zoom-meta-sep"> · </span>
        </template>
      </div>

      <button
        class="zoom-close handwritten"
        aria-label="Close"
        :style="{ color: ink }"
        @click="emit('close')"
      >✕ close</button>
    </div>
  </div>
</template>
