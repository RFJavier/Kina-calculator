<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Item, ItemSource } from '../models/types'
import { createItem, updateItem } from '../services/db'
import { refreshData } from '../services/store'
import { validateItemInput } from '../utils/validation'

const props = defineProps<{ editing: Item | null }>()
const emit = defineEmits<{ done: [] }>()

const form = reactive({ name: '', referencePrice: '', source: 'mercado' as ItemSource })
const error = ref('')

watch(
  () => props.editing,
  (item) => {
    form.name = item?.name ?? ''
    form.referencePrice = item ? String(item.referencePrice) : ''
    form.source = item?.source ?? 'mercado'
    error.value = ''
  },
  { immediate: true },
)

async function save() {
  const price = Number(form.referencePrice)
  const validation = validateItemInput(form.name, price)
  if (validation) {
    error.value = validation
    return
  }
  if (props.editing) {
    await updateItem({
      ...props.editing,
      name: form.name.trim(),
      referencePrice: price,
      source: form.source,
    })
  } else {
    await createItem(form.name.trim(), price, form.source)
  }
  await refreshData()
  emit('done')
}
</script>

<template>
  <form class="form" @submit.prevent="save">
    <div v-if="error" class="alert error">{{ error }}</div>
    <label for="item-name">
      Nombre
      <input id="item-name" v-model="form.name" type="text" placeholder="Ej: Zafiro" />
    </label>
    <label for="item-price">
      Precio de referencia
      <input
        id="item-price"
        v-model="form.referencePrice"
        type="number"
        min="0"
        step="any"
        placeholder="Ej: 1500"
      />
    </label>
    <label for="item-source">
      Origen
      <select id="item-source" v-model="form.source">
        <option value="mercado">Mercado (otros jugadores)</option>
        <option value="tienda">Tienda (precio estable)</option>
        <option value="farmeo">Farmeo (0 kinah + tiempo)</option>
      </select>
    </label>
    <div class="form-actions">
      <button type="submit">{{ editing ? 'Guardar cambios' : 'Crear item' }}</button>
      <button v-if="editing" type="button" class="secondary" @click="emit('done')">
        Cancelar
      </button>
    </div>
  </form>
</template>
