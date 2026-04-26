<script setup lang="ts">
import type { Sketch } from '~/composables/useSketches'

const props = defineProps<{
  sketch: Sketch
  tagSuggestions: string[]
}>()
const emit = defineEmits<{
  updated: [Sketch]
  removed: [string]
  'drag-start': [string]
  'drag-over': [string]
  'drag-end': []
}>()

const localDate = ref(props.sketch.dateIso)
const localTags = ref<string[]>([...props.sketch.tags])
const localPinned = ref(props.sketch.pinned)
const saving = ref(false)
const removing = ref(false)

watch(() => props.sketch, (s) => {
  localDate.value = s.dateIso
  localTags.value = [...s.tags]
  localPinned.value = s.pinned
})

let saveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => save(), 300)
}

async function save() {
  if (saving.value) return
  saving.value = true
  try {
    const updated = await $fetch<Sketch>(`/api/sketches/${props.sketch.id}`, {
      method: 'PATCH',
      body: {
        date: localDate.value,
        tags: localTags.value,
        pinned: localPinned.value,
      },
    })
    emit('updated', updated)
  } finally {
    saving.value = false
  }
}

watch([localDate, localTags, localPinned], scheduleSave, { deep: true })

async function remove() {
  if (!confirm('Delete this sketch?')) return
  removing.value = true
  try {
    await $fetch(`/api/sketches/${props.sketch.id}`, { method: 'DELETE' })
    emit('removed', props.sketch.id)
  } finally {
    removing.value = false
  }
}

function togglePin() {
  localPinned.value = !localPinned.value
}

const editing = ref(false)
function onEdited(updated: Sketch) {
  emit('updated', updated)
}

const isDragging = ref(false)
function onDragStartLocal(e: DragEvent) {
  isDragging.value = true
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    // Use the row itself as the drag preview so it matches what the user grabbed.
    const target = e.currentTarget as HTMLElement
    e.dataTransfer.setDragImage(target, 24, 24)
  }
  emit('drag-start', props.sketch.id)
}
function onDragEndLocal() {
  isDragging.value = false
  emit('drag-end')
}
</script>

<template>
  <JitteredBorder
    :seed="`row-${sketch.id}`"
    :stroke-width="1"
    :jitter="1.0"
    :class="['row-wrap', { dragging: isDragging }]"
    draggable="true"
    @dragstart="onDragStartLocal"
    @dragover.prevent="emit('drag-over', sketch.id)"
    @dragend="onDragEndLocal"
  >
    <div class="row">
      <div class="grip" aria-hidden="true">
        <Icon name="lucide:grip-vertical" size="16" />
      </div>

      <div class="thumb-wrap">
        <SketchFrame
          :width="64"
          :height="80"
          :seed="sketch.id"
          ink="oklch(0.18 0.01 270)"
          :image="sketch.image"
          :stroke-width="0.8"
          :inset="3"
          :content-label="''"
        />
      </div>

      <div class="fields">
        <JitteredBorder :seed="`date-${sketch.id}`" :stroke-width="0.8" :jitter="0.6" class="field-wrap field-date">
          <input v-model="localDate" type="date" class="date-input handwritten">
        </JitteredBorder>
        <admin-tag-input v-model="localTags" :suggestions="tagSuggestions" :seed="`tags-${sketch.id}`" />
      </div>

      <div class="actions">
        <button
          v-if="sketch.image"
          type="button"
          class="icon-btn"
          aria-label="Edit"
          title="Crop & rotate"
          @click="editing = true"
        >
          <Icon name="lucide:crop" size="16" />
        </button>
        <button
          type="button"
          :class="['icon-btn', { active: localPinned }]"
          :aria-label="localPinned ? 'Unpin' : 'Pin'"
          :title="localPinned ? 'Unpin' : 'Pin'"
          @click="togglePin"
        >
          <Icon :name="localPinned ? 'lucide:pin' : 'lucide:pin-off'" size="16" />
        </button>
        <button
          type="button"
          class="icon-btn danger"
          aria-label="Delete"
          title="Delete"
          :disabled="removing"
          @click="remove"
        >
          <Icon name="lucide:trash-2" size="16" />
        </button>
      </div>
    </div>
  </JitteredBorder>

  <admin-edit-modal
    v-if="editing"
    :sketch="sketch"
    @updated="onEdited"
    @close="editing = false"
  />
</template>

<style scoped>
.row-wrap {
  color: oklch(0.18 0.01 270);
  background: rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  transition:
    opacity 0.18s ease,
    transform 0.18s cubic-bezier(0.2, 0.7, 0.2, 1),
    box-shadow 0.18s ease,
    background 0.18s ease;
  will-change: transform;
}
.row-wrap[draggable="true"] { cursor: grab; }
.row-wrap[draggable="true"]:hover { background: rgba(255, 255, 255, 0.55); }
.row-wrap.dragging {
  cursor: grabbing;
  opacity: 0.35;
  transform: scale(0.985);
  background: rgba(255, 255, 255, 0.7);
}

.row {
  display: grid;
  grid-template-columns: 24px 64px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
}
.grip { color: oklch(0.18 0.01 270); opacity: 0.4; }

.thumb-wrap {
  width: 64px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fields { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.field-wrap { display: inline-block; }
.field-date { width: 168px; }
.date-input {
  width: 100%;
  height: 28px;
  padding: 0 8px;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 15px;
  color: oklch(0.18 0.01 270);
  font-family: var(--hand);
}
.date-input::-webkit-calendar-picker-indicator { opacity: 0.55; cursor: pointer; }

.actions { display: flex; flex-direction: column; gap: 4px; }
.icon-btn {
  appearance: none;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: oklch(0.18 0.01 270);
  opacity: 0.55;
  transition: opacity 0.15s;
}
.icon-btn:hover { opacity: 1; background: rgba(28, 36, 64, 0.06); }
.icon-btn.active {
  color: oklch(0.32 0.07 60);
  opacity: 1;
  background: rgba(28, 36, 64, 0.06);
}
.icon-btn.danger:hover { color: #b04020; background: rgba(176, 64, 32, 0.08); }
.icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>
