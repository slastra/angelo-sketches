<script setup lang="ts">
import type { Sketch } from '~/composables/useSketches'
import { sizeWithin } from '~/utils/aspect'

const props = defineProps<{
  sketches: Sketch[]
  ink: string
  animate: boolean
}>()

const emit = defineEmits<{ zoom: [Sketch], 'index-change': [number] }>()

const FEED_MAX_W = 560
// Vertical breathing room reserved per page: top/bottom padding so a frame
// never crowds against the corner mark or the bottom counter.
const FEED_V_PAD = 120

// Track viewport height so portrait sketches don't overflow short windows.
const viewportH = ref(900)
function updateViewport() { viewportH.value = window.innerHeight }

const sized = computed(() => {
  const maxH = Math.max(280, viewportH.value - FEED_V_PAD)
  return props.sketches.map(s => ({
    sketch: s,
    ...sizeWithin(s.width, s.height, FEED_MAX_W, maxH),
  }))
})

const scrollerRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
  if (!scrollerRef.value) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio > 0.5) {
          const idx = Number((e.target as HTMLElement).dataset.index)
          emit('index-change', idx)
        }
      }
    },
    { threshold: [0.5] },
  )
  scrollerRef.value.querySelectorAll('.feed-page-wrap').forEach(p => observer!.observe(p))
})

onBeforeUnmount(() => {
  if (import.meta.client) window.removeEventListener('resize', updateViewport)
  observer?.disconnect()
})

function pad(n: number) { return String(n + 1).padStart(2, '0') }
</script>

<template>
  <div ref="scrollerRef" class="feed-scroller">
    <div
      v-for="(item, i) in sized"
      :key="item.sketch.id"
      :data-index="i"
      class="feed-page-wrap"
    >
      <section
        :class="['feed-page', { 'animate-in': animate && i === 0 }]"
        :style="{ '--ink': ink } as Record<string, string>"
      >
        <div class="feed-inner">
          <div class="feed-margin left">
            <div class="margin-block">
              <div class="meta-label">no.</div>
              <div class="meta-value handwritten">{{ pad(i) }}</div>
            </div>
            <div class="margin-block">
              <div class="meta-label">drawn</div>
              <div class="meta-value handwritten">{{ item.sketch.date }}</div>
            </div>
          </div>

          <div
            class="feed-frame-wrap"
            role="button"
            tabindex="0"
            :aria-label="`Zoom into sketch ${pad(i)}`"
            @click="emit('zoom', item.sketch)"
            @keydown.enter.prevent="emit('zoom', item.sketch)"
            @keydown.space.prevent="emit('zoom', item.sketch)"
          >
            <SketchFrame
              :width="item.w"
              :height="item.h"
              :seed="item.sketch.id"
              :ink="ink"
              :image="item.sketch.image"
              :content-label="item.sketch.date"
            />
            <div class="zoom-hint handwritten" :style="{ color: ink }">↗ click to zoom</div>
          </div>

          <div class="feed-margin right">
            <div v-if="item.sketch.tags.length" class="margin-block">
              <div class="meta-label">tags</div>
              <div v-for="t in item.sketch.tags" :key="t" class="tag-line handwritten">{{ t }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
