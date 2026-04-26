<script setup lang="ts">
import { computed } from 'vue'
import { PAPER_TEXTURES, type PaperKey } from '~/composables/useTweaks'

const props = defineProps<{ texture: PaperKey }>()

const style = computed(() => {
  const t = PAPER_TEXTURES[props.texture] || PAPER_TEXTURES['dot-grid']
  let bgImage = 'none'
  let bgSize = 'auto'
  if (t.dot) {
    bgImage = `radial-gradient(${t.dot} 1px, transparent 1.2px)`
    bgSize = '22px 22px'
  } else if (t.grid && t.line) {
    bgImage = `linear-gradient(${t.line} 1px, transparent 1px), linear-gradient(90deg, ${t.line} 1px, transparent 1px)`
    bgSize = '24px 24px'
  } else if (t.line) {
    bgImage = `linear-gradient(${t.line} 1px, transparent 1px)`
    bgSize = '100% 28px'
  }
  return {
    position: 'fixed' as const,
    inset: 0,
    background: t.bg,
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
