import type { Item, ItemSource, LotResult, Recipe } from '../models/types'
import type { CalcContext } from './calculator'

export interface LotInputMaterial {
  itemId: string
  source: ItemSource
  /** Precio fijo (solo tienda). */
  unitPrice?: number
  /** Mercado: total gastado en la compra. */
  totalSpent?: number
  /** Mercado: unidades adquiridas en la compra. */
  unitsAcquired?: number
  /** Farmeo: minutos invertidos. */
  farmMinutes?: number
}

export interface LotInput {
  recipe: Recipe
  targetQuantity: number
  materials: LotInputMaterial[]
  craftMinutes: number
  marginPercent: number
}

function unitPriceOf(item: Item | undefined, input: LotInputMaterial): number {
  switch (input.source) {
    case 'tienda':
      return input.unitPrice ?? item?.referencePrice ?? 0
    case 'mercado': {
      const units = input.unitsAcquired ?? 0
      const total = input.totalSpent ?? 0
      if (units <= 0) return 0
      return total / units
    }
    case 'farmeo':
      return 0
  }
}

/**
 * Calcula la rentabilidad de un lote de crafteo.
 * `targetQuantity` = cantidad de unidades que se quieren obtener.
 * `materials` = cómo se consigue cada material directo de la receta.
 */
export function calculateLot(ctx: CalcContext, input: LotInput): LotResult {
  const { recipe } = input
  const outputItem = ctx.items.get(recipe.outputItemId)
  const batches = Math.ceil(input.targetQuantity / recipe.outputQuantity)
  const baseUnits = batches * recipe.outputQuantity
  const bountyFactor = 1 + (recipe.doubleBountyPercent || 0) / 100
  const expectedUnits = baseUnits * bountyFactor

  let totalCost = 0
  let totalFarmMinutes = 0

  const materials = recipe.materials.map((mat) => {
    const item = ctx.items.get(mat.itemId)
    const inputMat = input.materials.find((m) => m.itemId === mat.itemId)
    const source = inputMat?.source ?? item?.source ?? 'mercado'
    const unitPrice = unitPriceOf(item, inputMat ?? { itemId: mat.itemId, source })
    const quantity = mat.quantity * batches
    const cost = unitPrice * quantity
    const farmMinutes = source === 'farmeo' ? (inputMat?.farmMinutes ?? 0) : 0
    totalCost += cost
    totalFarmMinutes += farmMinutes
    return {
      itemId: mat.itemId,
      name: item?.name ?? '(item desconocido)',
      source,
      quantity,
      unitPrice,
      cost,
      farmMinutes,
    }
  })

  const costPerUnit = expectedUnits > 0 ? totalCost / expectedUnits : 0
  const referencePrice = outputItem?.referencePrice ?? 0
  const suggestedPrice = costPerUnit * (1 + (input.marginPercent || 0) / 100)
  const profitAtReference = (referencePrice - costPerUnit) * expectedUnits
  const profitAtSuggested = (suggestedPrice - costPerUnit) * expectedUnits
  const totalMinutes = (input.craftMinutes || 0) + totalFarmMinutes
  const kinahPerHour = totalMinutes > 0 ? (profitAtReference * 60) / totalMinutes : 0

  return {
    outputItemId: recipe.outputItemId,
    outputName: outputItem?.name ?? '(item desconocido)',
    batches,
    baseUnits,
    expectedUnits,
    materials,
    totalCost,
    costPerUnit,
    referencePrice,
    suggestedPrice,
    marginPercent: input.marginPercent || 0,
    profitAtReference,
    profitAtSuggested,
    craftMinutes: input.craftMinutes || 0,
    totalFarmMinutes,
    totalMinutes,
    kinahPerHour,
  }
}
