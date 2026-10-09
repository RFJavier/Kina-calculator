<script setup lang="ts">
defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="drawer-overlay" @click.self="emit('close')">
        <Transition name="slide" appear>
          <div class="drawer" role="dialog" aria-modal="true">
            <div class="drawer-header">
              <h3>{{ title }}</h3>
              <button class="menu-btn" aria-label="Cerrar" @click="emit('close')">
                <svg
                  class="menu-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="drawer-body">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
