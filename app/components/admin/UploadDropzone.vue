<script setup lang="ts">
import type { Sketch } from '~/composables/useSketches'

const emit = defineEmits<{ added: [Sketch] }>()

const dragging = ref(false)
const busy = ref(0)
const error = ref<string | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

async function uploadOne(file: File) {
  const fd = new FormData()
  fd.append('image', file)
  const created = await $fetch<Sketch>('/api/sketches', { method: 'POST', body: fd })
  emit('added', created)
}

async function handleFiles(files: FileList | File[] | null) {
  if (!files || !files.length) return
  error.value = null
  const list = Array.from(files).filter(f => f.type.startsWith('image/'))
  if (!list.length) {
    error.value = 'images only'
    return
  }
  busy.value = list.length
  for (const f of list) {
    try { await uploadOne(f) }
    catch (e) { error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'upload failed' }
    finally { busy.value-- }
  }
}

function onDrop(e: DragEvent) {
  dragging.value = false
  handleFiles(e.dataTransfer?.files || null)
}

function onPick() {
  handleFiles(inputRef.value?.files || null)
  if (inputRef.value) inputRef.value.value = ''
}
</script>

<template>
  <JitteredBorder
    :class="['dz', { dragging, busy: busy > 0 }]"
    seed="dropzone"
    :stroke-width="1.4"
    :jitter="1.6"
    dasharray="9 7"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
    @click="inputRef?.click()"
  >
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      multiple
      hidden
      @change="onPick"
    >
    <Icon :name="busy > 0 ? 'lucide:loader-2' : 'lucide:upload'" size="22" :class="{ spin: busy > 0 }" />
    <div v-if="error" class="dz-err handwritten">{{ error }}</div>
  </JitteredBorder>
</template>

<style scoped>
.dz {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px 16px;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;
  color: oklch(0.18 0.01 270);
  opacity: 0.55;
}
.dz:hover { transform: translateY(-1px); opacity: 0.95; }
.dz.dragging { transform: translateY(-2px) scale(1.005); opacity: 1; }
.dz.busy { cursor: progress; opacity: 0.7; }

.spin { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.dz-err {
  font-size: 14px;
  color: #b04020;
  opacity: 0.85;
}
</style>
