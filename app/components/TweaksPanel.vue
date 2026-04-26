<script setup lang="ts">
// Floating tweaks panel — gallery-only subset of the design's tweaks-panel.jsx.
// Always-visible (no host postMessage protocol), draggable, collapsible.

import { ref, onMounted, onBeforeUnmount } from 'vue'
import { PAPER_TEXTURES, INK_COLORS, type TweakState, type PaperKey, type InkKey } from '~/composables/useTweaks'

const props = defineProps<{ tweaks: TweakState }>()
const emit = defineEmits<{ 'update:tweak': [key: keyof TweakState, value: TweakState[keyof TweakState]] }>()

const open = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const offset = ref({ x: 16, y: 16 })

const PAD = 16

function clamp() {
  if (!panelRef.value) return
  const w = panelRef.value.offsetWidth
  const h = panelRef.value.offsetHeight
  const maxRight = Math.max(PAD, window.innerWidth - w - PAD)
  const maxBottom = Math.max(PAD, window.innerHeight - h - PAD)
  offset.value = {
    x: Math.min(maxRight, Math.max(PAD, offset.value.x)),
    y: Math.min(maxBottom, Math.max(PAD, offset.value.y)),
  }
}

let onResize: (() => void) | null = null

watch(open, (v) => {
  if (v) {
    nextTick(() => clamp())
    onResize = clamp
    window.addEventListener('resize', onResize)
  } else if (onResize) {
    window.removeEventListener('resize', onResize)
    onResize = null
  }
})

onMounted(() => { /* nothing — panel toggled via floating button */ })
onBeforeUnmount(() => { if (onResize) window.removeEventListener('resize', onResize) })

function startDrag(e: MouseEvent) {
  if (!panelRef.value) return
  const r = panelRef.value.getBoundingClientRect()
  const sx = e.clientX
  const sy = e.clientY
  const startRight = window.innerWidth - r.right
  const startBottom = window.innerHeight - r.bottom
  function move(ev: MouseEvent) {
    offset.value = {
      x: startRight - (ev.clientX - sx),
      y: startBottom - (ev.clientY - sy),
    }
    clamp()
  }
  function up() {
    window.removeEventListener('mousemove', move)
    window.removeEventListener('mouseup', up)
  }
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', up)
}

const paperOptions = Object.entries(PAPER_TEXTURES).map(([k, v]) => ({ value: k as PaperKey, label: v.label }))
const inkOptions = Object.keys(INK_COLORS).map(k => ({ value: k as InkKey, label: k }))
const layoutOptions = [
  { value: 'feed', label: 'Feed' },
  { value: 'grid', label: 'Grid' },
  { value: 'scattered', label: 'Scattered' },
] as const

function set<K extends keyof TweakState>(key: K, v: TweakState[K]) {
  emit('update:tweak', key, v)
}
</script>

<template>
  <button
    v-if="!open"
    class="twk-fab"
    aria-label="Open tweaks"
    @click="open = true"
  >
    <span>tweaks</span>
  </button>

  <div
    v-if="open"
    ref="panelRef"
    class="twk-panel"
    :style="{ right: `${offset.x}px`, bottom: `${offset.y}px` }"
  >
    <div class="twk-hd" @mousedown="startDrag">
      <b>Tweaks</b>
      <button
        class="twk-x"
        aria-label="Close tweaks"
        @mousedown.stop
        @click="open = false"
      >✕</button>
    </div>
    <div class="twk-body">
      <div class="twk-sect">Paper</div>
      <div class="twk-row">
        <div class="twk-lbl"><span>Texture</span></div>
        <select
          class="twk-field"
          :value="tweaks.paperTexture"
          @change="set('paperTexture', ($event.target as HTMLSelectElement).value as PaperKey)"
        >
          <option v-for="o in paperOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>

      <div class="twk-sect">Ink</div>
      <div class="twk-row">
        <div class="twk-lbl"><span>Color</span></div>
        <select
          class="twk-field"
          :value="tweaks.inkColor"
          @change="set('inkColor', ($event.target as HTMLSelectElement).value as InkKey)"
        >
          <option v-for="o in inkOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>

      <div class="twk-sect">Layout</div>
      <div class="twk-row">
        <div class="twk-seg">
          <button
            v-for="o in layoutOptions"
            :key="o.value"
            type="button"
            :class="{ active: tweaks.layout === o.value }"
            @click="set('layout', o.value)"
          >{{ o.label }}</button>
        </div>
      </div>

      <div class="twk-sect">Motion</div>
      <div class="twk-row twk-row-h">
        <div class="twk-lbl"><span>Animate in on load</span></div>
        <button
          type="button"
          class="twk-toggle"
          :data-on="tweaks.animateIn ? '1' : '0'"
          role="switch"
          :aria-checked="tweaks.animateIn"
          @click="set('animateIn', !tweaks.animateIn)"
        ><i /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.twk-fab {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2147483646;
  height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  border: 0.5px solid rgba(0, 0, 0, 0.12);
  background: rgba(250, 249, 247, 0.85);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  backdrop-filter: blur(20px) saturate(160%);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  font: 11px/1 ui-sans-serif, system-ui, -apple-system, sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(41, 38, 27, 0.7);
  cursor: pointer;
}
.twk-fab:hover { color: rgba(41, 38, 27, 1); }

.twk-panel {
  position: fixed;
  z-index: 2147483646;
  width: 280px;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  background: rgba(250, 249, 247, 0.78);
  color: #29261b;
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  backdrop-filter: blur(24px) saturate(160%);
  border: 0.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 14px;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.5) inset, 0 12px 40px rgba(0, 0, 0, 0.18);
  font: 11.5px/1.4 ui-sans-serif, system-ui, -apple-system, sans-serif;
  overflow: hidden;
}
.twk-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px 10px 14px;
  cursor: move;
  user-select: none;
}
.twk-hd b { font-size: 12px; font-weight: 600; letter-spacing: 0.01em; }
.twk-x {
  appearance: none;
  border: 0;
  background: transparent;
  color: rgba(41, 38, 27, 0.55);
  width: 22px;
  height: 22px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
}
.twk-x:hover { background: rgba(0, 0, 0, 0.06); color: #29261b; }
.twk-body {
  padding: 2px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  min-height: 0;
}
.twk-row { display: flex; flex-direction: column; gap: 5px; }
.twk-row-h { flex-direction: row; align-items: center; justify-content: space-between; gap: 10px; }
.twk-lbl { display: flex; justify-content: space-between; align-items: baseline; color: rgba(41, 38, 27, 0.72); }
.twk-lbl > span:first-child { font-weight: 500; }
.twk-sect {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(41, 38, 27, 0.45);
  padding: 10px 0 0;
}
.twk-sect:first-child { padding-top: 0; }
.twk-field {
  appearance: none;
  width: 100%;
  height: 26px;
  padding: 0 8px;
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.6);
  color: inherit;
  font: inherit;
  outline: none;
}
.twk-seg {
  display: flex;
  padding: 2px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
  user-select: none;
}
.twk-seg button {
  appearance: none;
  flex: 1;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 500;
  min-height: 22px;
  border-radius: 6px;
  cursor: pointer;
  padding: 4px 6px;
  line-height: 1.2;
}
.twk-seg button.active {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}
.twk-toggle {
  position: relative;
  width: 32px;
  height: 18px;
  border: 0;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.15);
  transition: background 0.15s;
  cursor: pointer;
  padding: 0;
}
.twk-toggle[data-on="1"] { background: #34c759; }
.twk-toggle i {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  transition: transform 0.15s;
}
.twk-toggle[data-on="1"] i { transform: translateX(14px); }
</style>
