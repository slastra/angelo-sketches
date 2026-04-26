<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
  suggestions: string[]
  seed?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [string[]] }>()

const draft = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const focused = ref(false)

const filtered = computed(() => {
  const q = draft.value.trim().toLowerCase()
  if (!q) return []
  return props.suggestions
    .filter(s => !props.modelValue.includes(s) && s.toLowerCase().includes(q))
    .slice(0, 6)
})

function commit(value: string) {
  const v = value.trim().toLowerCase()
  if (!v) return
  if (props.modelValue.includes(v)) {
    draft.value = ''
    return
  }
  emit('update:modelValue', [...props.modelValue, v])
  draft.value = ''
}

function remove(i: number) {
  emit('update:modelValue', props.modelValue.filter((_, idx) => idx !== i))
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    commit(draft.value)
  } else if (e.key === 'Backspace' && !draft.value && props.modelValue.length) {
    e.preventDefault()
    remove(props.modelValue.length - 1)
  }
}
</script>

<template>
  <JitteredBorder :seed="seed || 'tag-input'" :stroke-width="0.8" :jitter="0.7" class="tag-input-wrap">
    <div class="tag-input handwritten" @click="inputRef?.focus()">
      <span v-for="(t, i) in modelValue" :key="t" class="chip">
        <span class="chip-text">{{ t }}</span>
        <button type="button" class="chip-x" aria-label="remove" @click.stop="remove(i)">×</button>
      </span>
      <div class="tag-field">
        <input
          ref="inputRef"
          v-model="draft"
          type="text"
          placeholder="add tag…"
          class="handwritten"
          @keydown="onKey"
          @blur="focused = false; if (draft.trim()) commit(draft)"
          @focus="focused = true"
        >
        <div v-if="focused && filtered.length" class="suggestions">
          <button
            v-for="s in filtered"
            :key="s"
            type="button"
            class="handwritten"
            @mousedown.prevent="commit(s)"
          >{{ s }}</button>
        </div>
      </div>
    </div>
  </JitteredBorder>
</template>

<style scoped>
.tag-input-wrap { color: oklch(0.24 0.05 255); }
.tag-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  min-height: 36px;
  cursor: text;
  font-size: 15px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 4px 1px 8px;
  font-style: italic;
  opacity: 0.85;
}
.chip-text { padding-bottom: 1px; border-bottom: 1px dotted currentColor; }
.chip-x {
  appearance: none;
  border: 0;
  background: none;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.45;
  padding: 0 2px;
  line-height: 1;
  font-family: var(--hand);
}
.chip-x:hover { opacity: 1; }
.tag-field { position: relative; flex: 1; min-width: 100px; }
.tag-field input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 15px;
  color: inherit;
  padding: 2px 0;
  font-family: var(--hand);
}
.suggestions {
  position: absolute;
  left: -4px;
  top: calc(100% + 6px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  background: rgba(247, 244, 236, 0.96);
  border: 0.5px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  min-width: 140px;
  overflow: hidden;
}
.suggestions button {
  appearance: none;
  border: 0;
  background: transparent;
  text-align: left;
  padding: 6px 10px;
  font-size: 15px;
  cursor: pointer;
  color: inherit;
}
.suggestions button:hover { background: rgba(28, 36, 64, 0.08); }
</style>
