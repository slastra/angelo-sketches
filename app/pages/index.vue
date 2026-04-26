<script setup lang="ts">
import { useTweaks, INK_COLORS, DARK_INK, type Theme } from '~/composables/useTweaks'
import { useSketches, type Sketch } from '~/composables/useSketches'

const { tweaks, setTweak } = useTweaks()
const { data: sketches } = useSketches()

const ink = computed(() => tweaks.value.theme === 'dark' ? DARK_INK : INK_COLORS[tweaks.value.inkColor])
const zoomed = ref<Sketch | null>(null)
const feedIndex = ref(0)

const list = computed(() => sketches.value || [])

function setLayout(v: 'feed' | 'grid') {
  setTweak('layout', v)
}
function setTheme(v: Theme) {
  setTweak('theme', v)
}
</script>

<template>
  <div class="app" :data-theme="tweaks.theme" :style="{ '--ink': ink, color: ink } as Record<string, string>">
    <PaperBackground :texture="tweaks.paperTexture" :theme="tweaks.theme" />

    <header class="gallery-nav">
      <div class="nav-left">
        <span class="nav-name">Angelo</span>
        <span class="nav-sub">sketches, 2026</span>
      </div>
      <LayoutSwitcher
        v-if="list.length"
        :layout="tweaks.layout"
        :theme="tweaks.theme"
        :ink="ink"
        @change="setLayout"
        @theme-change="setTheme"
      />
    </header>

    <Counter
      v-if="tweaks.layout === 'feed' && list.length"
      :index="feedIndex"
      :total="list.length"
      :ink="ink"
    />

    <main class="content" :style="{ color: ink }">
      <div v-if="!list.length" class="empty-state handwritten" :style="{ color: ink }">
        <div>no sketches yet</div>
        <NuxtLink to="/admin" class="empty-link">add your first one →</NuxtLink>
      </div>

      <template v-else>
        <GalleryFeedView
          v-if="tweaks.layout === 'feed'"
          :sketches="list"
          :ink="ink"
          :animate="tweaks.animateIn"
          @zoom="zoomed = $event"
          @index-change="feedIndex = $event"
        />
        <GalleryGridView
          v-else-if="tweaks.layout === 'grid'"
          :sketches="list"
          :ink="ink"
          :animate="tweaks.animateIn"
          @zoom="zoomed = $event"
        />
      </template>
    </main>

    <div
      v-if="tweaks.layout === 'feed' && list.length"
      class="scroll-hint handwritten"
      :style="{ color: ink }"
    >scroll ↓</div>

    <ZoomModal :sketch="zoomed" :ink="ink" @close="zoomed = null" />

    <BottomDoodle :ink="ink" />
  </div>
</template>

<style scoped>
.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 26px;
  opacity: 0.7;
}
.empty-link {
  font-size: 16px;
  opacity: 0.55;
  text-decoration: none;
  border-bottom: 1px dashed currentColor;
  padding-bottom: 1px;
}
.empty-link:hover { opacity: 1; }
</style>
