<script setup lang="ts">
import { computed } from 'vue'
import {
  PAPER_TEXTURES,
  DARK_PAPER_BG,
  DARK_PAPER_LINE,
  type PaperKey,
  type Theme,
} from '~/composables/useTweaks'

const props = withDefaults(defineProps<{ texture: PaperKey, theme?: Theme }>(), {
  theme: 'light',
})

const style = computed(() => {
  const t = PAPER_TEXTURES[props.texture] || PAPER_TEXTURES['dot-grid']
  const isDark = props.theme === 'dark'
  const bg = isDark ? DARK_PAPER_BG : t.bg
  const dot = isDark ? DARK_PAPER_LINE : t.dot
  const line = isDark ? DARK_PAPER_LINE : t.line

  let bgImage = 'none'
  let bgSize = 'auto'
  if (t.dot) {
    bgImage = `radial-gradient(${dot} 1px, transparent 1.2px)`
    bgSize = '22px 22px'
  } else if (t.grid && line) {
    bgImage = `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`
    bgSize = '24px 24px'
  } else if (t.line) {
    bgImage = `linear-gradient(${line} 1px, transparent 1px)`
    bgSize = '100% 28px'
  }
  return {
    position: 'fixed' as const,
    inset: 0,
    background: bg,
    backgroundImage: bgImage,
    backgroundSize: bgSize,
    backgroundPosition: '0 0',
    zIndex: 0,
  }
})
</script>

<template>
  <div class="paper-bg" :style="style" />
</template>
