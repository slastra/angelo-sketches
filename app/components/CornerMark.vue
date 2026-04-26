<script setup lang="ts">
defineProps<{ ink: string }>()
</script>

<template>
  <header class="corner-mark" :style="{ color: ink }">
    <div class="mark-row">
      <span class="mark-name">Angelo</span>
      <span class="mark-dot" aria-hidden="true">·</span>
      <span class="mark-sub">sketches, 2026</span>
    </div>
  </header>
</template>
