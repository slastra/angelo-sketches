<script setup lang="ts">
import { Cropper, RectangleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import type { Sketch } from '~/composables/useSketches'

const props = defineProps<{ sketch: Sketch }>()
const emit = defineEmits<{ close: [], updated: [Sketch] }>()

interface CropperResult {
  canvas?: HTMLCanvasElement
}
interface CropperRef {
  rotate: (degrees: number) => void
  getResult: () => CropperResult
}

const cropperRef = ref<CropperRef | null>(null)
const fineAngle = ref(0)
const lastAppliedFine = ref(0)
const saving = ref(false)

// vue-advanced-cropper's `rotate(deg)` is a relative delta. Track the slider
// delta we've already pushed to the cropper so we only send the new offset.
function onFineChange() {
  const delta = fineAngle.value - lastAppliedFine.value
  lastAppliedFine.value = fineAngle.value
  cropperRef.value?.rotate(delta)
}

function rotate90(direction: 1 | -1) {
  cropperRef.value?.rotate(direction * 90)
}

function reset() {
  if (!cropperRef.value) return
  cropperRef.value.rotate(-lastAppliedFine.value)
  fineAngle.value = 0
  lastAppliedFine.value = 0
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      b => b ? resolve(b) : reject(new Error('canvas.toBlob failed')),
      mime,
      quality,
    )
  })
}

async function save() {
  const cropper = cropperRef.value
  if (!cropper || saving.value) return
  saving.value = true
  try {
    const result = cropper.getResult()
    if (!result.canvas) throw new Error('no canvas')

    const url = props.sketch.image || ''
    const ext = (url.split('?')[0] ?? '').split('.').pop()?.toLowerCase()
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
    const quality = mime === 'image/jpeg' ? 0.92 : undefined
    const blob = await canvasToBlob(result.canvas, mime, quality)

    const fd = new FormData()
    fd.append('image', blob, `edit.${ext || 'jpg'}`)

    const updated = await $fetch<Sketch>(`/api/sketches/${props.sketch.id}/edit`, {
      method: 'POST',
      body: fd,
    })
    emit('updated', updated)
    emit('close')
  } catch (e) {
    console.error('edit save failed', e)
  } finally {
    saving.value = false
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKey)
  }
})
</script>

<template>
  <div class="edit-overlay" @click.self="emit('close')">
    <div class="edit-stage">
      <header class="edit-hd">
        <span class="handwritten title">edit sketch</span>
        <button type="button" class="link handwritten" @click="emit('close')">✕ close</button>
      </header>

      <div class="cropper-wrap">
        <Cropper
          v-if="sketch.image"
          ref="cropperRef"
          class="cropper"
          :src="sketch.image"
          :stencil-component="RectangleStencil"
          image-restriction="fit-area"
        />
      </div>

      <div class="controls">
        <div class="control-group">
          <span class="ctl-label handwritten">rotate</span>
          <button type="button" class="rot-btn handwritten" title="Rotate 90° left" @click="rotate90(-1)">
            <Icon name="lucide:rotate-ccw" size="16" /> 90°
          </button>
          <button type="button" class="rot-btn handwritten" title="Rotate 90° right" @click="rotate90(1)">
            90° <Icon name="lucide:rotate-cw" size="16" />
          </button>
        </div>

        <div class="control-group fine">
          <span class="ctl-label handwritten">fine</span>
          <input
            v-model.number="fineAngle"
            type="range"
            min="-15"
            max="15"
            step="0.5"
            @input="onFineChange"
          >
          <span class="fine-readout handwritten">{{ fineAngle.toFixed(1) }}°</span>
        </div>

        <div class="control-group right">
          <button type="button" class="link handwritten" @click="reset">reset fine</button>
          <button type="button" class="save-btn handwritten" :disabled="saving" @click="save">
            {{ saving ? 'saving…' : 'save →' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: color-mix(in oklch, #f7f4ec 92%, transparent);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.edit-stage {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 1100px;
  height: 100%;
  max-height: 880px;
  color: oklch(0.24 0.05 255);
}

.edit-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title { font-size: 22px; font-family: var(--hand-display); font-weight: 600; }

.cropper-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cropper {
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 14px;
  overflow: hidden;
}
.cropper :deep(.vue-advanced-cropper__background),
.cropper :deep(.vue-advanced-cropper__foreground) {
  background: oklch(0.24 0.05 255);
}

.controls {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px;
}
.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.control-group.fine { gap: 12px; }
.control-group.right { gap: 16px; justify-content: flex-end; }
.ctl-label {
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-style: italic;
  opacity: 0.55;
}
.rot-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 10px;
  border: 0.5px solid currentColor;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  opacity: 0.75;
}
.rot-btn:hover { opacity: 1; background: rgba(28, 36, 64, 0.06); }
.fine input[type="range"] {
  flex: 1;
  accent-color: oklch(0.24 0.05 255);
}
.fine-readout {
  width: 50px;
  text-align: right;
  font-size: 14px;
  opacity: 0.75;
  font-variant-numeric: tabular-nums;
}
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
.save-btn {
  appearance: none;
  height: 32px;
  padding: 0 16px;
  border: 0;
  border-radius: 6px;
  background: oklch(0.24 0.05 255);
  color: #f7f4ec;
  font: inherit;
  font-size: 16px;
  cursor: pointer;
}
.save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
