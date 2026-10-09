import type {
  CalculationResult,
  DerivedAnalysis,
  Item,
  MaterialRequirement,
  Recipe,
} from '../models/types'

export interface CalcContext {
  items: Map<string, Item>
  recipeByOutput: Map<string, Recipe>
}

export function buildContext(items: Item[], recipes: Recipe[]): CalcContext {
  return {
    items: new Map(items.map((i) => [i.id, i])),
    recipeByOutput: new Map(recipes.map((r) => [r.outputItemId, r])),
  }
}

export function getRecipeFor(itemId: string, ctx: CalcContext): Recipe | undefined {
  return ctx.recipeByOutput.get(itemId)
}

export function isDerived(itemId: string, ctx: CalcContext): boolean {
  return ctx.recipeByOutput.has(itemId)
}

export function getItemName(itemId: string, ctx: CalcContext): string {
  return ctx.items.get(itemId)?.name ?? '(item desconocido)'
}

/**
 * Costo de fabricar una unidad del item.
 * Si no tiene receta, es su precio de referencia.
 * Si tiene receta: suma(costo de materiales) / cantidad producida, recursivamente.
 */
export function calculateItemUnitCost(
  itemId: string,
  ctx: CalcContext,
  visiting: Set<string> = new Set(),
): number {
  const item = ctx.items.get(itemId)
  if (!item) throw new Error(`Item no encontrado: ${itemId}`)
  const recipe = ctx.recipeByOutput.get(itemId)
  if (!recipe) return item.referencePrice
  if (visiting.has(itemId)) {
    throw new Error(`Ciclo de recetas detectado en: ${item.name}`)
  }
  visiting.add(itemId)
  let batchCost = 0
  for (const mat of recipe.materials) {
    batchCost += mat.quantity * calculateItemUnitCost(mat.itemId, ctx, visiting)
  }
  visiting.delete(itemId)
  return batchCost / recipe.outputQuantity
}

/** Costo de producir un lote completo de la receta y costo por unidad. */
export function calculateRecipeCost(
  recipe: Recipe,
  ctx: CalcContext,
): { batchCost: number; unitCost: number } {
  const visiting = new Set<string>([recipe.outputItemId])
  let batchCost = 0
  for (const mat of recipe.materials) {
    batchCost += mat.quantity * calculateItemUnitCost(mat.itemId, ctx, visiting)
  }
  return { batchCost, unitCost: batchCost / recipe.outputQuantity }
}

/** Materiales directos necesarios para producir `quantity` unidades del item. */
export function calculateRequiredMaterials(
  itemId: string,
  quantity: number,
  ctx: CalcContext,
): MaterialRequirement[] {
  const recipe = ctx.recipeByOutput.get(itemId)
  if (!recipe) return []
  const batches = Math.ceil(quantity / recipe.outputQuantity)
  return recipe.materials.map((mat) => ({
    itemId: mat.itemId,
    name: getItemName(mat.itemId, ctx),
    quantity: mat.quantity * batches,
  }))
}

export interface ExpansionResult {
  rawMaterials: MaterialRequirement[]
  derivedUsed: string[]
  batches: number
}

/**
 * Expande recursivamente un item hasta sus materias primas finales.
 * Los items con receta se expanden; los que no tienen receta son materias primas.
 */
export function expandRecipe(
  itemId: string,
  quantity: number,
  ctx: CalcContext,
): ExpansionResult {
  const rawTotals = new Map<string, number>()
  const derivedUsed = new Set<string>()
  const visiting = new Set<string>()

  const expand = (id: string, qty: number): number => {
    const recipe = ctx.recipeByOutput.get(id)
    if (!recipe) {
      rawTotals.set(id, (rawTotals.get(id) ?? 0) + qty)
      return 1
    }
    if (visiting.has(id)) {
      throw new Error(`Ciclo de recetas detectado en: ${getItemName(id, ctx)}`)
    }
    visiting.add(id)
    derivedUsed.add(id)
    const batches = Math.ceil(qty / recipe.outputQuantity)
    for (const mat of recipe.materials) {
      expand(mat.itemId, mat.quantity * batches)
    }
    visiting.delete(id)
    return batches
  }

  const rootBatches = expand(itemId, quantity)

  const rawMaterials = [...rawTotals.entries()].map(([id, total]) => ({
    itemId: id,
    name: getItemName(id, ctx),
    quantity: total,
  }))

  return { rawMaterials, derivedUsed: [...derivedUsed], batches: rootBatches }
}

export type Recommendation = DerivedAnalysis['recommendation']

export interface CraftComparison {
  itemId: string
  name: string
  referencePrice: number
  craftCost: number
  recommendation: Recommendation
  difference: number
}

/** Compara el precio de referencia contra el costo de fabricación por unidad. */
export function compareMarketVsCraft(
  itemId: string,
  ctx: CalcContext,
): CraftComparison | null {
  const recipe = ctx.recipeByOutput.get(itemId)
  if (!recipe) return null
  const item = ctx.items.get(itemId)
  if (!item) throw new Error(`Item no encontrado: ${itemId}`)
  const craftCost = calculateItemUnitCost(itemId, ctx)
  const referencePrice = item.referencePrice
  let recommendation: Recommendation = 'IGUAL'
  if (referencePrice < craftCost) recommendation = 'COMPRAR'
  else if (craftCost < referencePrice) recommendation = 'FABRICAR'
  return {
    itemId,
    name: item.name,
    referencePrice,
    craftCost,
    recommendation,
    difference: Math.abs(referencePrice - craftCost),
  }
}

/** Detecta si al guardar una receta (outputItemId + materials) se crearía un ciclo. */
export function wouldCreateCycle(
  outputItemId: string,
  materials: { itemId: string }[],
  ctx: CalcContext,
): boolean {
  const visited = new Set<string>()
  const reaches = (id: string): boolean => {
    if (id === outputItemId) return true
    if (visited.has(id)) return false
    visited.add(id)
    const recipe = ctx.recipeByOutput.get(id)
    if (!recipe) return false
    return recipe.materials.some((mat) => reaches(mat.itemId))
  }
  return materials.some((mat) => reaches(mat.itemId))
}

/** Cálculo completo usado por la Calculadora. */
export function calculateAll(
  itemId: string,
  quantity: number,
  ctx: CalcContext,
): CalculationResult {
  const item = ctx.items.get(itemId)
  if (!item) throw new Error(`Item no encontrado: ${itemId}`)
  const recipe = ctx.recipeByOutput.get(itemId)
  if (!recipe) throw new Error(`El item "${item.name}" no tiene receta`)

  const directMaterials = calculateRequiredMaterials(itemId, quantity, ctx)
  const { rawMaterials, derivedUsed, batches } = expandRecipe(itemId, quantity, ctx)

  let totalCost = 0
  for (const raw of rawMaterials) {
    const rawItem = ctx.items.get(raw.itemId)
    if (!rawItem) throw new Error(`Item no encontrado: ${raw.itemId}`)
    totalCost += raw.quantity * rawItem.referencePrice
  }

  const producedQuantity = batches * recipe.outputQuantity
  const unitCost = quantity > 0 ? totalCost / quantity : 0

  const analysis: DerivedAnalysis[] = derivedUsed
    .map((id) => compareMarketVsCraft(id, ctx))
    .filter((c): c is CraftComparison => c !== null)

  return {
    outputItemId: itemId,
    outputName: item.name,
    quantity,
    producedQuantity,
    directMaterials,
    rawMaterials,
    totalCost,
    unitCost,
    analysis,
  }
}
