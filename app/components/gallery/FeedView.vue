<script setup lang="ts">
import type { Sketch } from '~/composables/useSketches'

const props = defineProps<{
  sketches: Sketch[]
  ink: string
  animate: boolean
}>()

const emit = defineEmits<{ zoom: [Sketch], 'index-change': [number] }>()

const scrollerRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
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

onBeforeUnmount(() => observer?.disconnect())

function pad(n: number) { return String(n + 1).padStart(2, '0') }
</script>

<template>
  <div ref="scrollerRef" class="feed-scroller">
    <div
      v-for="(s, i) in sketches"
      :key="s.id"
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
              <div class="meta-value handwritten">{{ s.date }}</div>
            </div>
          </div>

          <div
            class="feed-frame-wrap"
            role="button"
            tabindex="0"
            :aria-label="`Zoom into sketch ${pad(i)}`"
            @click="emit('zoom', s)"
            @keydown.enter.prevent="emit('zoom', s)"
            @keydown.space.prevent="emit('zoom', s)"
          >
            <SketchFrame
              :width="540"
              :height="700"
              :seed="s.id"
              :ink="ink"
              :image="s.image"
              :content-label="s.date"
            />
            <div class="zoom-hint handwritten" :style="{ color: ink }">↗ click to zoom</div>
          </div>

          <div class="feed-margin right">
            <div class="margin-block">
              <div class="meta-label">tags</div>
              <div v-for="t in s.tags" :key="t" class="tag-line handwritten">{{ t }}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
