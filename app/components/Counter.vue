<script setup lang="ts">
const props = defineProps<{ index: number, total: number, ink: string }>()
const num = computed(() => String(props.index + 1).padStart(2, '0'))
const den = computed(() => String(props.total).padStart(2, '0'))
</script>

<template>
  <div class="counter" :style="{ color: ink }">
    <span class="num">{{ num }}</span>
    <span class="slash"> / </span>
    <span class="den">{{ den }}</span>
  </div>
</template>
