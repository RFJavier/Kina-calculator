export type ItemSource = 'tienda' | 'mercado' | 'farmeo'

export interface Item {
  id: string
  name: string
  referencePrice: number
  source: ItemSource
}

export interface RecipeMaterial {
  itemId: string
  quantity: number
}

export interface Recipe {
  id: string
  outputItemId: string
  outputQuantity: number
  doubleBountyPercent: number
  materials: RecipeMaterial[]
}

export interface MaterialRequirement {
  itemId: string
  name: string
  quantity: number
}

export interface DerivedAnalysis {
  itemId: string
  name: string
  craftCost: number
  referencePrice: number
  recommendation: 'COMPRAR' | 'FABRICAR' | 'IGUAL'
  difference: number
}

export interface CalculationResult {
  outputItemId: string
  outputName: string
  quantity: number
  producedQuantity: number
  directMaterials: MaterialRequirement[]
  rawMaterials: MaterialRequirement[]
  totalCost: number
  unitCost: number
  analysis: DerivedAnalysis[]
}

export interface BackupData {
  version: 1
  items: Item[]
  recipes: Recipe[]
}

// ---- Rentabilidad de lote ----

export interface LotMaterialCost {
  itemId: string
  name: string
  source: ItemSource
  /** unidades necesarias según la receta y el objetivo */
  quantity: number
  /** precio unitario efectivo (tienda = fijo, mercado = total/unidades, farmeo = 0) */
  unitPrice: number
  /** costo total en kinah de este material */
  cost: number
  /** minutos de farmeo invertidos (solo farmeo) */
  farmMinutes: number
}

export interface LotResult {
  outputItemId: string
  outputName: string
  /** lotes necesarios para cumplir el objetivo */
  batches: number
  /** unidades base producidas (sin doble bounty) */
  baseUnits: number
  /** unidades esperadas con doble bounty */
  expectedUnits: number
  materials: LotMaterialCost[]
  totalCost: number
  costPerUnit: number
  referencePrice: number
  suggestedPrice: number
  marginPercent: number
  profitAtReference: number
  profitAtSuggested: number
  craftMinutes: number
  totalFarmMinutes: number
  totalMinutes: number
  kinahPerHour: number
}
