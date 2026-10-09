import { reactive } from 'vue'
import type { Item, ItemSource, Recipe } from '../models/types'
import { getItems, getRecipes } from './db'

/**
 * Estado global mínimo (sin Pinia): los datos viven en IndexedDB
 * y este store solo los mantiene en memoria sincronizados para las vistas.
 */
export const store = reactive({
  items: [] as Item[],
  recipes: [] as Recipe[],
  loaded: false,
})

export async function refreshData(): Promise<void> {
  const [items, recipes] = await Promise.all([getItems(), getRecipes()])
  store.items = items.sort((a, b) => a.name.localeCompare(b.name, 'es'))
  store.recipes = recipes
  store.loaded = true
}

export function itemName(itemId: string): string {
  return store.items.find((i) => i.id === itemId)?.name ?? '(item desconocido)'
}

export function itemSource(itemId: string): ItemSource {
  return store.items.find((i) => i.id === itemId)?.source ?? 'mercado'
}
