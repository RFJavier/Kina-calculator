import type { BackupData, Item, Recipe } from '../models/types'
import { getItems, getRecipes, replaceAllData } from './db'

export async function buildBackup(): Promise<BackupData> {
  const [items, recipes] = await Promise.all([getItems(), getRecipes()])
  return { version: 1, items, recipes }
}

export async function exportData(): Promise<void> {
  const data = await buildBackup()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `aion2-economy-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function parseBackup(text: string): BackupData {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('El archivo no es un JSON válido.')
  }
  const candidate = data as Partial<BackupData>
  if (!Array.isArray(candidate.items) || !Array.isArray(candidate.recipes)) {
    throw new Error('El JSON debe contener las listas "items" y "recipes".')
  }
  const items = candidate.items.map((raw) => {
    const item = raw as Item
    if (typeof item.id !== 'string' || typeof item.name !== 'string' || typeof item.referencePrice !== 'number') {
      throw new Error('Formato de item inválido en el JSON.')
    }
    if (item.source !== 'tienda' && item.source !== 'mercado' && item.source !== 'farmeo') {
      item.source = 'mercado'
    }
    return item
  })
  const recipes = candidate.recipes.map((raw) => {
    const recipe = raw as Recipe
    if (
      typeof recipe.id !== 'string' ||
      typeof recipe.outputItemId !== 'string' ||
      typeof recipe.outputQuantity !== 'number' ||
      !Array.isArray(recipe.materials)
    ) {
      throw new Error('Formato de receta inválido en el JSON.')
    }
    if (typeof recipe.doubleBountyPercent !== 'number') {
      recipe.doubleBountyPercent = 0
    }
    return recipe
  })
  return { version: 1, items, recipes }
}

/** Reemplaza todos los datos actuales por los del archivo. */
export async function importData(file: File): Promise<{ items: number; recipes: number }> {
  const text = await file.text()
  const data = parseBackup(text)
  await replaceAllData(data.items, data.recipes)
  return { items: data.items.length, recipes: data.recipes.length }
}
