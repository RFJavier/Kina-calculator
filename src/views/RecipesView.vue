<script setup lang="ts">
import { ref } from 'vue'
import type { Recipe } from '../models/types'
import { deleteRecipe } from '../services/db'
import { itemName, itemSource, refreshData, store } from '../services/store'
import { SOURCE_BADGE_CLASS, SOURCE_CARD_CLASS, SOURCE_LABEL } from '../utils/source'
import RecipeForm from '../components/RecipeForm.vue'
import Drawer from '../components/Drawer.vue'
import ActionMenu from '../components/ActionMenu.vue'

const editing = ref<Recipe | null>(null)
const drawerOpen = ref(false)

function startCreate() {
  editing.value = null
  drawerOpen.value = true
}

function startEdit(recipe: Recipe) {
  editing.value = recipe
  drawerOpen.value = true
}

function onDone() {
  editing.value = null
  drawerOpen.value = false
}

async function remove(recipe: Recipe) {
  if (!confirm(`¿Eliminar la receta de "${itemName(recipe.outputItemId)}"?`)) return
  await deleteRecipe(recipe.id)
  await refreshData()
}

function recipeTitle(recipe: Recipe): string {
  return itemName(recipe.outputItemId)
}
</script>

<template>
  <div class="view">
    <div class="view-header">
      <h2>Recetas</h2>
      <div class="view-header-actions">
        <button class="primary" @click="startCreate">+ Nueva receta</button>
      </div>
    </div>

    <div v-for="recipe in store.recipes" :key="recipe.id" class="panel">
      <div class="recipe-head">
        <strong>
          {{ recipeTitle(recipe) }}
          <span class="muted">(produce {{ recipe.outputQuantity }})</span>
          <span v-if="recipe.doubleBountyPercent" class="badge craft">
            doble {{ recipe.doubleBountyPercent }}%
          </span>
        </strong>
        <ActionMenu @edit="startEdit(recipe)" @remove="remove(recipe)" />
      </div>
      <div class="material-grid">
        <div
          v-for="mat in recipe.materials"
          :key="mat.itemId"
          class="material-card"
          :class="SOURCE_CARD_CLASS[itemSource(mat.itemId)]"
        >
          <div class="material-card-head">
            <span class="material-name">{{ itemName(mat.itemId) }}</span>
            <span :class="SOURCE_BADGE_CLASS[itemSource(mat.itemId)]">
              {{ SOURCE_LABEL[itemSource(mat.itemId)] }}
            </span>
          </div>
          <span class="material-qty">× {{ mat.quantity }}</span>
        </div>
      </div>
    </div>

    <p v-if="store.recipes.length === 0" class="empty panel">No hay recetas. Crea la primera.</p>

    <Drawer :open="drawerOpen" :title="editing ? 'Editar receta' : 'Nueva receta'" @close="drawerOpen = false">
      <RecipeForm v-if="drawerOpen" :key="editing?.id ?? 'new'" :editing="editing" @done="onDone" />
    </Drawer>
  </div>
</template>
