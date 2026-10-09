<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CalculationResult } from '../models/types'
import { buildContext, calculateAll, isDerived } from '../services/calculator'
import { store } from '../services/store'
import { formatKinah, formatNumber } from '../utils/format'

const selectedItemId = ref('')
const quantity = ref(1)
const result = ref<CalculationResult | null>(null)
const error = ref('')

const ctx = computed(() => buildContext(store.items, store.recipes))
const craftableItems = computed(() =>
  store.items.filter((item) => isDerived(item.id, ctx.value)),
)

function calculate() {
  error.value = ''
  result.value = null
  if (!selectedItemId.value) {
    error.value = 'Selecciona un objeto.'
    return
  }
  if (!Number.isInteger(quantity.value) || quantity.value <= 0) {
    error.value = 'La cantidad debe ser un número entero mayor que 0.'
    return
  }
  try {
    result.value = calculateAll(selectedItemId.value, quantity.value, ctx.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al calcular.'
  }
}

function badgeClass(recommendation: string): string {
  if (recommendation === 'COMPRAR') return 'badge buy'
  if (recommendation === 'FABRICAR') return 'badge craft'
  return 'badge equal'
}
</script>

<template>
  <div class="view">
    <div class="view-header">
      <h2>Calculadora</h2>
    </div>

    <div class="panel">
      <div class="form-row">
        <label for="calc-item">Objeto</label>
        <select id="calc-item" v-model="selectedItemId" style="max-width: 360px">
          <option value="" disabled>Selecciona un objeto con receta...</option>
          <option v-for="item in craftableItems" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </div>
      <div class="form-row">
        <label for="calc-qty">Cantidad</label>
        <input id="calc-qty" v-model.number="quantity" type="number" min="1" step="1" style="width: 130px" />
      </div>
      <button class="primary" @click="calculate">Calcular</button>
      <p v-if="craftableItems.length === 0" class="muted">
        No hay objetos con receta. Crea items y recetas primero.
      </p>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>

    <template v-if="result">
      <div class="panel">
        <h2>Producción</h2>
        <div class="kv">
          <div class="kv-row"><span class="key">Objeto</span><strong>{{ result.outputName }}</strong></div>
          <div class="kv-row"><span class="key">Cantidad solicitada</span><strong>{{ formatNumber(result.quantity) }}</strong></div>
          <div class="kv-row"><span class="key">Cantidad producida (lotes completos)</span><strong>{{ formatNumber(result.producedQuantity) }}</strong></div>
        </div>
      </div>

      <div class="panel">
        <h2>Materiales directos</h2>
        <table class="responsive-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mat in result.directMaterials" :key="mat.itemId">
              <td data-label="Material">{{ mat.name }}</td>
              <td data-label="Cantidad">{{ formatNumber(mat.quantity) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <h2>Materias primas finales</h2>
        <table class="responsive-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Cantidad</th>
              <th>Precio referencia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mat in result.rawMaterials" :key="mat.itemId">
              <td data-label="Material">{{ mat.name }}</td>
              <td data-label="Cantidad">{{ formatNumber(mat.quantity) }}</td>
              <td data-label="Precio referencia">
                {{
                  formatKinah(
                    ctx.items.get(mat.itemId)?.referencePrice ?? 0,
                  )
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <h2>Costo</h2>
        <div class="kv">
          <div class="kv-row"><span class="key">Costo total</span><strong>{{ formatKinah(result.totalCost) }}</strong></div>
          <div class="kv-row"><span class="key">Costo por unidad</span><strong>{{ formatKinah(result.unitCost) }}</strong></div>
        </div>
      </div>

      <div class="panel">
        <h2>Análisis de derivados</h2>
        <table class="responsive-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Fabricar</th>
              <th>Comprar</th>
              <th>Recomendación</th>
              <th>Diferencia</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in result.analysis" :key="a.itemId">
              <td data-label="Material">{{ a.name }}</td>
              <td data-label="Fabricar">{{ formatKinah(a.craftCost) }}</td>
              <td data-label="Comprar">{{ formatKinah(a.referencePrice) }}</td>
              <td data-label="Recomendación">
                <span :class="badgeClass(a.recommendation)">{{ a.recommendation }}</span>
              </td>
              <td data-label="Diferencia">{{ formatKinah(a.difference) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="result.analysis.length === 0" class="muted">
          Ningún material intermedio tiene receta propia.
        </p>
      </div>
    </template>
  </div>
</template>
