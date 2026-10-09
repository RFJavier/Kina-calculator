<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { refreshData } from './services/store'
import ItemsView from './views/ItemsView.vue'
import RecipesView from './views/RecipesView.vue'
import CalculatorView from './views/CalculatorView.vue'
import LotView from './views/LotView.vue'
import DataView from './views/DataView.vue'
import Drawer from './components/Drawer.vue'

type Tab = 'items' | 'recipes' | 'calculator' | 'lot' | 'data'

const tab = ref<Tab>('items')
const ready = ref(false)
const menuOpen = ref(false)
const menuWrap = ref<HTMLElement | null>(null)
const supportOpen = ref(false)

const supportLink = 'https://paypal.me/Noxtactics'

const tabs: { id: Tab; label: string }[] = [
  { id: 'items', label: 'Items' },
  { id: 'recipes', label: 'Recetas' },
  { id: 'calculator', label: 'Calculadora' },
  { id: 'lot', label: 'Rentabilidad' },
  { id: 'data', label: 'Datos' },
]

const devLinks = [
  { label: 'Repositorio (GitHub)', href: 'https://github.com/RFJavier/Kina-calculator', icon: 'code' },
  { label: 'Licencia (Apache 2.0)', href: 'https://github.com/RFJavier/Kina-calculator/blob/main/LICENSE', icon: 'scale' },
]

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function openSupport() {
  menuOpen.value = false
  supportOpen.value = true
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

          <div class="menu-divider"></div>
          <span class="menu-section-title">Desarrollo</span>

          <a
            v-for="link in devLinks"
            :key="link.href"
            class="menu-tile"
            :href="link.href"
            target="_blank"
            rel="noopener noreferrer"
            @click="menuOpen = false"
          >
            <svg
              class="menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <template v-if="link.icon === 'code'">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </template>
              <template v-else-if="link.icon === 'scale'">
                <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                <path d="M7 21h10" />
                <path d="M12 3v18" />
              </template>
              <template v-else>
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </template>
            </svg>
            <span>{{ link.label }}</span>
          </a>

          <button class="menu-tile" @click="openSupport">
            <svg
              class="menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span>Apoyame</span>
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

    <Drawer :open="supportOpen" title="❤️ Apoyo voluntario" @close="supportOpen = false">
      <div class="support-content">
        <p class="support-lead">
          ¿Te resulta útil esta herramienta? Puedes apoyarme voluntariamente para
          contribuir a su mantenimiento y desarrollo.
        </p>
        <p class="support-note">
          Las contribuciones son completamente opcionales y no otorgan funciones
          adicionales, mejoras, ventajas ni contenido exclusivo. La herramienta
          seguirá siendo la misma, independientemente de si decides apoyar el
          proyecto o no.
        </p>
        <p class="support-thanks">¡Gracias por formar parte de la comunidad!</p>
        <a
          class="support-cta primary"
          :href="supportLink"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apoyar ahora
        </a>
      </div>
    </Drawer>
  </div>
</template>
