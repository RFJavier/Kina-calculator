import type { Recipe, RecipeMaterial } from '../models/types'
import { buildContext, wouldCreateCycle } from '../services/calculator'
import type { Item } from '../models/types'

export function validateItemInput(name: string, referencePrice: number): string | null {
  if (!name.trim()) return 'El nombre no puede estar vacío.'
  if (!Number.isFinite(referencePrice)) return 'El precio debe ser un número.'
  if (referencePrice < 0) return 'El precio debe ser 0 o mayor.'
  return null
}

export function validateRecipeInput(
  outputItemId: string,
  outputQuantity: number,
  doubleBountyPercent: number,
  materials: RecipeMaterial[],
  items: Item[],
  existingRecipes: Recipe[],
  editingRecipeId: string | null,
): string | null {
  if (!outputItemId) return 'Selecciona el objeto producido.'
  if (!Number.isFinite(outputQuantity) || outputQuantity <= 0) {
    return 'La cantidad producida debe ser mayor que 0.'
  }
  if (!Number.isFinite(doubleBountyPercent) || doubleBountyPercent < 0 || doubleBountyPercent > 100) {
    return 'El % de doble bounty debe estar entre 0 y 100.'
  }
  if (materials.length === 0) return 'La receta debe tener al menos un material.'

  const seen = new Set<string>()
  for (const mat of materials) {
    if (!mat.itemId) return 'Selecciona un item en cada material.'
    if (!Number.isFinite(mat.quantity) || mat.quantity <= 0) {
      return 'La cantidad de cada material debe ser mayor que 0.'
    }
    if (mat.itemId === outputItemId) {
      return 'Una receta no puede usar como material el objeto que produce.'
    }
    if (seen.has(mat.itemId)) return 'Hay materiales repetidos en la lista.'
    seen.add(mat.itemId)
  }

  const otherRecipes = existingRecipes.filter((r) => r.id !== editingRecipeId)
  if (otherRecipes.some((r) => r.outputItemId === outputItemId)) {
    return 'Ya existe otra receta para ese objeto.'
  }

  const ctx = buildContext(items, otherRecipes)
  if (wouldCreateCycle(outputItemId, materials, ctx)) {
    return 'Ciclo de recetas detectado: los materiales dependen del objeto producido.'
  }

  return null
}
