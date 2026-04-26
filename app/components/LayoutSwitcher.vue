<script setup lang="ts">
defineProps<{
  layout: 'feed' | 'grid'
  ink: string
}>()
const emit = defineEmits<{ change: ['feed' | 'grid'] }>()
</script>

<template>
  <div class="layout-switcher" :style="{ color: ink }">
    <button
      type="button"
      :class="['ls-btn', { active: layout === 'feed' }]"
      aria-label="Feed view"
      title="Feed"
      @click="emit('change', 'feed')"
    >
      <Icon name="lucide:square" size="18" />
    </button>
    <button
      type="button"
      :class="['ls-btn', { active: layout === 'grid' }]"
      aria-label="Grid view"
      title="Grid"
      @click="emit('change', 'grid')"
    >
      <Icon name="lucide:layout-grid" size="18" />
    </button>
  </div>
</template>

<style scoped>
.layout-switcher {
  position: fixed;
  top: 24px;
  right: 32px;
  z-index: 30;
  display: flex;
  gap: 4px;
}
.ls-btn {
  appearance: none;
  border: 0;
  background: transparent;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: inherit;
  opacity: 0.35;
  transition: opacity 0.15s, background 0.15s;
}
.ls-btn:hover { opacity: 0.7; background: rgba(0, 0, 0, 0.04); }
.ls-btn.active { opacity: 1; }
</style>
