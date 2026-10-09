<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{ edit: []; remove: [] }>()

const open = ref(false)
const wrap = ref<HTMLElement | null>(null)

function toggle() {
  open.value = !open.value
}

function onEdit() {
  open.value = false
  emit('edit')
}

function onRemove() {
  open.value = false
  emit('remove')
}

function onDocumentClick(event: MouseEvent) {
  if (wrap.value && !wrap.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="wrap" class="action-menu-wrap">
    <button class="action-menu-btn" aria-label="Opciones" @click="toggle">
      <svg
        class="action-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    </button>

    <div v-if="open" class="action-menu">
      <button class="action-menu-item" @click="onEdit">
        <svg
          class="action-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
        <span>Editar</span>
      </button>
      <button class="action-menu-item" @click="onRemove">
        <svg
          class="action-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        <span>Eliminar</span>
      </button>
    </div>
  </div>
</template>
