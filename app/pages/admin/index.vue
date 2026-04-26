<script setup lang="ts">
import type { Sketch } from '~/composables/useSketches'

definePageMeta({ middleware: 'admin' })

useHead({ title: "Angelo's Sketches — admin" })

const { data: sketches, refresh } = useFetch<Sketch[]>('/api/sketches', { default: () => [] })
const { data: tagsData, refresh: refreshTags } = useFetch<{ tag: string, count: number }[]>('/api/tags', { default: () => [] })

const tagSuggestions = computed(() => (tagsData.value || []).map(t => t.tag))
const list = computed(() => sketches.value || [])

let dragId: string | null = null

function onDragStart(id: string) { dragId = id }
function onDragOver(overId: string) {
  if (!dragId || dragId === overId || !sketches.value) return
  const arr = [...sketches.value]
  const from = arr.findIndex(s => s.id === dragId)
  const to = arr.findIndex(s => s.id === overId)
  if (from < 0 || to < 0) return
  const moved = arr.splice(from, 1)[0]
  if (!moved) return
  arr.splice(to, 0, moved)
  sketches.value = arr
}
async function onDragEnd() {
  if (!dragId || !sketches.value) return
  dragId = null
  await $fetch('/api/sketches/reorder', {
    method: 'POST',
    body: { ids: sketches.value.map(s => s.id) },
  })
}

function onAdded(s: Sketch) {
  sketches.value = [...(sketches.value || []), s]
  refreshTags()
}
function onUpdated(s: Sketch) {
  if (!sketches.value) return
  sketches.value = sketches.value.map(x => x.id === s.id ? s : x)
  refreshTags()
}
function onRemoved(id: string) {
  if (!sketches.value) return
  sketches.value = sketches.value.filter(s => s.id !== id)
  refreshTags()
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>

<template>
  <div class="app admin-app">
    <PaperBackground texture="dot-grid" />

    <header class="admin-hd">
      <div class="hd-left">
        <span class="mark-name handwritten">Angelo</span>
        <span class="hd-sub">admin</span>
      </div>
      <div class="hd-right">
        <NuxtLink to="/" class="link handwritten">view gallery →</NuxtLink>
        <button class="link handwritten" @click="logout">logout</button>
      </div>
    </header>

    <main class="admin-main">
      <admin-upload-dropzone @added="onAdded" />

      <div v-if="!list.length" class="empty handwritten">no sketches yet — drop one above</div>
      <TransitionGroup v-else tag="section" name="rl" class="list">
        <admin-sketch-row
          v-for="s in list"
          :key="s.id"
          :sketch="s"
          :tag-suggestions="tagSuggestions"
          @updated="onUpdated"
          @removed="onRemoved"
          @drag-start="onDragStart"
          @drag-over="onDragOver"
          @drag-end="onDragEnd"
        />
      </TransitionGroup>
    </main>
  </div>
</template>

<style scoped>
.admin-app { overflow: auto; height: 100vh; }

.admin-hd {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: rgba(247, 244, 236, 0.85);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
  color: oklch(0.24 0.05 255);
}
.hd-left { display: flex; align-items: baseline; gap: 12px; }
.mark-name { font-family: var(--hand-display); font-size: 22px; font-weight: 600; }
.hd-sub {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.55;
  font-style: italic;
}
.hd-right { display: flex; gap: 18px; }
.link {
  appearance: none;
  border: 0;
  background: none;
  font-family: var(--hand);
  font-size: 16px;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  padding: 0;
}
.link:hover { opacity: 1; }

.admin-main {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 0 auto;
  padding: 28px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.list { display: flex; flex-direction: column; gap: 10px; position: relative; }
.rl-move { transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1); }
.rl-enter-active, .rl-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.rl-enter-from { opacity: 0; transform: translateY(-6px); }
.rl-leave-to { opacity: 0; transform: translateY(6px); }
.rl-leave-active { position: absolute; left: 0; right: 0; }
.empty {
  font-size: 18px;
  text-align: center;
  padding: 40px 0;
  opacity: 0.5;
  color: oklch(0.24 0.05 255);
}
</style>
