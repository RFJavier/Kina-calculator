<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { ItemSource, LotResult } from '../models/types'
import { buildContext, isDerived } from '../services/calculator'
import { calculateLot, type LotInputMaterial } from '../services/profit'
import { store } from '../services/store'
import { formatKinah, formatNumber } from '../utils/format'
import { SOURCE_BADGE_CLASS, SOURCE_CARD_CLASS, SOURCE_LABEL } from '../utils/source'

const ctx = computed(() => buildContext(store.items, store.recipes))
const craftableItems = computed(() => store.items.filter((i) => isDerived(i.id, ctx.value)))

const selectedItemId = ref('')
const targetQuantity = ref(100)
const craftMinutes = ref(0)
const marginPercent = ref(0)
const error = ref('')
const result = ref<LotResult | null>(null)

const selectedRecipe = computed(() =>
  selectedItemId.value ? ctx.value.recipeByOutput.get(selectedItemId.value) : undefined,
)

const materials = computed(() => {
  const recipe = selectedRecipe.value
  if (!recipe) return []
  return recipe.materials.map((mat) => {
    const item = ctx.value.items.get(mat.itemId)
    return {
      itemId: mat.itemId,
      name: item?.name ?? '(item desconocido)',
      source: (item?.source ?? 'mercado') as ItemSource,
      referencePrice: item?.referencePrice ?? 0,
      recipeQuantity: mat.quantity,
    }
  })
})

const input = reactive<Record<string, LotInputMaterial>>({})

watch(materials, (list) => {
  for (const key of Object.keys(input)) delete input[key]
  for (const mat of list) {
    input[mat.itemId] = {
      itemId: mat.itemId,
      source: mat.source,
      unitPrice: mat.referencePrice,
      totalSpent: 0,
      unitsAcquired: 0,
      farmMinutes: 0,
    }
  }
})

function calculate() {
  error.value = ''
  result.value = null
  const recipe = selectedRecipe.value
  if (!recipe) {
    error.value = 'Selecciona un objeto con receta.'
    return
  }
  if (!Number.isInteger(targetQuantity.value) || targetQuantity.value <= 0) {
    error.value = 'La cantidad debe ser un número entero mayor que 0.'
    return
  }
  const matInputs = materials.value.map((mat) => {
    const m = input[mat.itemId]
    return {
      itemId: mat.itemId,
      source: mat.source,
      unitPrice: mat.source === 'tienda' ? Number(m?.unitPrice ?? 0) : undefined,
      totalSpent: Number(m?.totalSpent ?? 0),
      unitsAcquired: Number(m?.unitsAcquired ?? 0),
      farmMinutes: Number(m?.farmMinutes ?? 0),
    } as LotInputMaterial
  })
  result.value = calculateLot(ctx.value, {
    recipe,
    targetQuantity: targetQuantity.value,
    materials: matInputs,
    craftMinutes: Number(craftMinutes.value) || 0,
    marginPercent: Number(marginPercent.value) || 0,
  })
}

function profitClass(v: number): string {
  if (v > 0) return 'better'
  if (v < 0) return 'worse'
  return 'muted'
}
</script>

<template>
  <div class="view">
    <div class="view-header">
      <h2>Rentabilidad de lote</h2>
    </div>

    <div class="panel">
      <div class="form-row">
        <label for="lot-item">Objeto</label>
        <select id="lot-item" v-model="selectedItemId" style="max-width: 360px">
          <option value="" disabled>Selecciona un objeto con receta...</option>
          <option v-for="item in craftableItems" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </div>
      <div class="form-row">
        <label for="lot-qty">Unidades deseadas</label>
        <input id="lot-qty" v-model.number="targetQuantity" type="number" min="1" step="1" style="width: 130px" />
      </div>
      <div class="form-row">
        <label for="lot-margin">Margen sugerido (%)</label>
        <input id="lot-margin" v-model.number="marginPercent" type="number" min="0" step="any" style="width: 110px" />
      </div>
      <div class="form-row">
        <label for="lot-craft">Tiempo de crafteo (min)</label>
        <input id="lot-craft" v-model.number="craftMinutes" type="number" min="0" step="any" style="width: 110px" />
      </div>
      <p v-if="craftableItems.length === 0" class="muted">
        No hay objetos con receta. Crea items y recetas primero.
      </p>
    </div>

    <div v-if="selectedRecipe" class="panel">
      <h2>Materiales</h2>
      <p v-if="selectedRecipe.doubleBountyPercent" class="muted">
        Doble bounty: {{ selectedRecipe.doubleBountyPercent }}% de probabilidad de duplicar.
      </p>
      <div class="material-grid">
        <div
          v-for="mat in materials"
          :key="mat.itemId"
          class="material-card"
          :class="SOURCE_CARD_CLASS[mat.source]"
        >
          <div class="material-card-head">
            <span class="material-name">{{ mat.name }}</span>
            <span :class="SOURCE_BADGE_CLASS[mat.source]">{{ SOURCE_LABEL[mat.source] }}</span>
          </div>
          <div class="material-card-form">
            <template v-if="mat.source === 'tienda'">
              <label for="">Precio unitario</label>
              <input
                v-model.number="input[mat.itemId].unitPrice"
                type="number"
                min="0"
                step="any"
                :placeholder="String(mat.referencePrice)"
              />
            </template>
            <template v-else-if="mat.source === 'mercado'">
              <label for="">Total gastado</label>
              <input v-model.number="input[mat.itemId].totalSpent" type="number" min="0" step="any" />
              <label for="">Unidades</label>
              <input v-model.number="input[mat.itemId].unitsAcquired" type="number" min="0" step="any" />
            </template>
            <template v-else>
              <label for="">Minutos de farmeo</label>
              <input v-model.number="input[mat.itemId].farmMinutes" type="number" min="0" step="any" />
            </template>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button class="primary" @click="calculate">Calcular</button>
      </div>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>

    <template v-if="result">
      <div class="stats-grid">
        <div class="stat-card"><span>Unidades esperadas</span><strong>{{ formatNumber(result.expectedUnits) }}</strong></div>
        <div class="stat-card"><span>Costo por unidad</span><strong>{{ formatKinah(result.costPerUnit) }}</strong></div>
        <div class="stat-card"><span>Precio sugerido</span><strong>{{ formatKinah(result.suggestedPrice) }}</strong></div>
        <div class="stat-card"><span>Kinah / hora</span><strong>{{ formatKinah(result.kinahPerHour) }}</strong></div>
      </div>

      <div class="panel">
        <h2>Producción</h2>
        <div class="kv">
          <div class="kv-row"><span class="key">Objeto</span><strong>{{ result.outputName }}</strong></div>
          <div class="kv-row"><span class="key">Lotes</span><strong>{{ formatNumber(result.batches) }}</strong></div>
          <div class="kv-row"><span class="key">Unidades base</span><strong>{{ formatNumber(result.baseUnits) }}</strong></div>
          <div class="kv-row"><span class="key">Unidades esperadas (con doble bounty)</span><strong>{{ formatNumber(result.expectedUnits) }}</strong></div>
        </div>
      </div>

      <div class="panel">
        <h2>Costos</h2>
        <table class="responsive-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Cantidad</th>
              <th>Precio unitario</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mat in result.materials" :key="mat.itemId">
              <td data-label="Material">{{ mat.name }}</td>
              <td data-label="Cantidad">{{ formatNumber(mat.quantity) }}</td>
              <td data-label="Precio unitario">{{ mat.source === 'farmeo' ? '—' : formatKinah(mat.unitPrice) }}</td>
              <td data-label="Costo">{{ formatKinah(mat.cost) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="kv" style="margin-top: var(--space-4)">
          <div class="kv-row"><span class="key">Costo total</span><strong>{{ formatKinah(result.totalCost) }}</strong></div>
          <div class="kv-row"><span class="key">Costo por unidad</span><strong>{{ formatKinah(result.costPerUnit) }}</strong></div>
        </div>
      </div>

      <div class="panel">
        <h2>Precio y beneficio</h2>
        <div class="kv">
          <div class="kv-row"><span class="key">Precio de referencia (mercado)</span><strong>{{ formatKinah(result.referencePrice) }}</strong></div>
          <div class="kv-row"><span class="key">Precio sugerido (margen {{ result.marginPercent }}%)</span><strong>{{ formatKinah(result.suggestedPrice) }}</strong></div>
          <div class="kv-row">
            <span class="key">Beneficio vs precio de referencia</span>
            <strong :class="profitClass(result.profitAtReference)">{{ formatKinah(result.profitAtReference) }}</strong>
          </div>
          <div class="kv-row">
            <span class="key">Beneficio vs precio sugerido</span>
            <strong :class="profitClass(result.profitAtSuggested)">{{ formatKinah(result.profitAtSuggested) }}</strong>
          </div>
        </div>
      </div>

      <div class="panel">
        <h2>Tiempo</h2>
        <div class="kv">
          <div class="kv-row"><span class="key">Tiempo de crafteo</span><strong>{{ formatNumber(result.craftMinutes) }} min</strong></div>
          <div class="kv-row"><span class="key">Tiempo de farmeo</span><strong>{{ formatNumber(result.totalFarmMinutes) }} min</strong></div>
          <div class="kv-row"><span class="key">Tiempo total</span><strong>{{ formatNumber(result.totalMinutes) }} min</strong></div>
          <div class="kv-row"><span class="key">Kinah por hora (beneficio)</span><strong>{{ formatKinah(result.kinahPerHour) }}</strong></div>
        </div>
      </div>
    </template>
  </div>
</template>
