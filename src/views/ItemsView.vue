<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Item } from '../models/types'
import { deleteItem } from '../services/db'
import { refreshData, store } from '../services/store'
import { formatKinah } from '../utils/format'
import { SOURCE_BADGE_CLASS, SOURCE_CARD_CLASS, SOURCE_LABEL } from '../utils/source'
import ItemForm from '../components/ItemForm.vue'
import Drawer from '../components/Drawer.vue'
import ActionMenu from '../components/ActionMenu.vue'

type Filter = 'all' | 'tienda' | 'no-tienda'

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'tienda', label: 'Tienda' },
  { id: 'no-tienda', label: 'No tienda' },
]

const editing = ref<Item | null>(null)
const drawerOpen = ref(false)
const search = ref('')
const filter = ref<Filter>('all')

const filteredItems = computed(() => {
  let list = store.items
  if (filter.value === 'tienda') list = list.filter((i) => i.source === 'tienda')
  if (filter.value === 'no-tienda') list = list.filter((i) => i.source !== 'tienda')
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((i) => i.name.toLowerCase().includes(q))
  return list
})

function startCreate() {
  editing.value = null
  drawerOpen.value = true
}

function startEdit(item: Item) {
  editing.value = item
  drawerOpen.value = true
}

function onDone() {
  editing.value = null
  drawerOpen.value = false
}

async function remove(item: Item) {
  if (!confirm(`¿Eliminar "${item.name}"?`)) return
  await deleteItem(item.id)
  await refreshData()
}
</script>

<template>
  <div class="view">
    <div class="view-header">
      <h2>Items</h2>
      <div class="view-header-actions">
        <input
          v-if="store.items.length > 0"
          v-model="search"
          type="search"
          class="search-input"
          placeholder="Buscar item..."
        />
        <button class="primary" @click="startCreate">+ Nuevo item</button>
      </div>
    </div>

    <div v-if="store.items.length > 0" class="filter-tabs">
      <button
        v-for="f in filters"
        :key="f.id"
        class="filter-tab"
        :class="{ active: filter === f.id }"
        @click="filter = f.id"
      >
        {{ f.label }}
      </button>
    </div>

    <p v-if="store.items.length === 0" class="empty">No hay items. Crea el primero.</p>
    <p v-else-if="filteredItems.length === 0" class="empty">
      No hay resultados para "{{ search }}".
    </p>

    <div v-else class="item-grid">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="item-card"
        :class="SOURCE_CARD_CLASS[item.source]"
      >
        <div class="item-card-head">
          <span class="item-name">{{ item.name }}</span>
          <ActionMenu @edit="startEdit(item)" @remove="remove(item)" />
        </div>
        <div class="item-card-foot">
          <div class="item-price">{{ formatKinah(item.referencePrice) }}</div>
          <span :class="SOURCE_BADGE_CLASS[item.source]">{{ SOURCE_LABEL[item.source] }}</span>
        </div>
      </div>
    </div>

    <Drawer :open="drawerOpen" :title="editing ? 'Editar item' : 'Nuevo item'" @close="drawerOpen = false">
      <ItemForm v-if="drawerOpen" :key="editing?.id ?? 'new'" :editing="editing" @done="onDone" />
    </Drawer>
  </div>
</template>
