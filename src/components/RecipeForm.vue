<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Recipe, RecipeMaterial } from '../models/types'
import { createRecipe, updateRecipe } from '../services/db'
import { refreshData, store } from '../services/store'
import { validateRecipeInput } from '../utils/validation'

const props = defineProps<{ editing: Recipe | null }>()
const emit = defineEmits<{ done: [] }>()

const error = ref('')
const form = reactive({
  outputItemId: '',
  outputQuantity: '1',
  doubleBountyPercent: '0',
  materials: [] as RecipeMaterial[],
})

function syncFromEditing() {
  form.outputItemId = props.editing?.outputItemId ?? ''
  form.outputQuantity = String(props.editing?.outputQuantity ?? 1)
  form.doubleBountyPercent = String(props.editing?.doubleBountyPercent ?? 0)
  form.materials = props.editing
    ? props.editing.materials.map((m) => ({ ...m }))
    : [{ itemId: '', quantity: 1 }]
  error.value = ''
}

watch(() => props.editing, syncFromEditing, { immediate: true })

function addMaterial() {
  form.materials.push({ itemId: '', quantity: 1 })
}

function removeMaterial(index: number) {
  form.materials.splice(index, 1)
}

async function save() {
  const outputQuantity = Number(form.outputQuantity)
  const doubleBountyPercent = Number(form.doubleBountyPercent)
  const validation = validateRecipeInput(
    form.outputItemId,
    outputQuantity,
    doubleBountyPercent,
    form.materials,
    store.items,
    store.recipes,
    props.editing?.id ?? null,
  )
  if (validation) {
    error.value = validation
    return
  }
  const payload = {
    outputItemId: form.outputItemId,
    outputQuantity,
    doubleBountyPercent,
    materials: form.materials.map((m) => ({ itemId: m.itemId, quantity: Number(m.quantity) })),
  }
  if (props.editing) {
    await updateRecipe({ ...payload, id: props.editing.id })
  } else {
    await createRecipe(payload)
  }
  await refreshData()
  emit('done')
}
</script>

<template>
  <form class="form" @submit.prevent="save">
    <div v-if="error" class="alert error">{{ error }}</div>

    <label for="recipe-output">
      Objeto producido
      <select id="recipe-output" v-model="form.outputItemId">
        <option value="" disabled>Selecciona un item...</option>
        <option v-for="item in store.items" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>
    </label>

    <label for="recipe-quantity">
      Cantidad producida
      <input
        id="recipe-quantity"
        v-model="form.outputQuantity"
        type="number"
        min="1"
        step="1"
        style="width: 110px"
      />
    </label>

    <label for="recipe-bounty">
      Doble bounty (%)
      <input
        id="recipe-bounty"
        v-model="form.doubleBountyPercent"
        type="number"
        min="0"
        max="100"
        step="any"
        style="width: 110px"
      />
      <span class="muted">Probabilidad de obtener doble producción.</span>
    </label>

    <h2>Materiales</h2>
    <div v-for="(mat, index) in form.materials" :key="index" class="material-row">
      <select v-model="mat.itemId">
        <option value="" disabled>Selecciona material...</option>
        <option v-for="item in store.items" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>
      <input v-model.number="mat.quantity" type="number" min="1" step="1" />
      <button
        type="button"
        class="danger tiny"
        :disabled="form.materials.length === 1"
        @click="removeMaterial(index)"
      >
        Quitar
      </button>
    </div>

    <button type="button" class="secondary tiny" @click="addMaterial">
      + Agregar material
    </button>

    <div class="form-actions">
      <button type="submit">{{ editing ? 'Guardar cambios' : 'Crear receta' }}</button>
      <button v-if="editing" type="button" class="secondary" @click="emit('done')">
        Cancelar
      </button>
    </div>
  </form>
</template>
