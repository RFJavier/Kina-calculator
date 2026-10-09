<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { refreshData } from './services/store'
import ItemsView from './views/ItemsView.vue'
import RecipesView from './views/RecipesView.vue'
import CalculatorView from './views/CalculatorView.vue'
import LotView from './views/LotView.vue'
import DataView from './views/DataView.vue'

type Tab = 'items' | 'recipes' | 'calculator' | 'lot' | 'data'

const tab = ref<Tab>('items')
const ready = ref(false)
const menuOpen = ref(false)
const menuWrap = ref<HTMLElement | null>(null)

const tabs: { id: Tab; label: string }[] = [
  { id: 'items', label: 'Items' },
  { id: 'recipes', label: 'Recetas' },
  { id: 'calculator', label: 'Calculadora' },
  { id: 'lot', label: 'Rentabilidad' },
  { id: 'data', label: 'Datos' },
]

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function selectTab(t: Tab) {
  tab.value = t
  menuOpen.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (menuWrap.value && !menuWrap.value.contains(event.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(async () => {
  await refreshData()
  ready.value = true
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="header-brand">
        <div>
          <h1>A2 Economy Calculator</h1>
        </div>
      </div>
      <div ref="menuWrap" class="menu-wrap">
        <button class="menu-btn" aria-label="Menú" @click="toggleMenu">
          <svg
            class="menu-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <nav v-if="menuOpen" class="menu-dropdown">
          <button
            v-for="t in tabs"
            :key="t.id"
            class="menu-tile"
            :class="{ active: tab === t.id }"
            @click="selectTab(t.id)"
          >
            <span>{{ t.label }}</span>
          </button>
        </nav>
      </div>
    </header>

    <main v-if="ready" class="page">
      <ItemsView v-if="tab === 'items'" />
      <RecipesView v-else-if="tab === 'recipes'" />
      <CalculatorView v-else-if="tab === 'calculator'" />
      <LotView v-else-if="tab === 'lot'" />
      <DataView v-else />
    </main>
  </div>
</template>
