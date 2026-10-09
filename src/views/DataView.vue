<script setup lang="ts">
import { ref } from 'vue'
import { exportData, importData } from '../services/backup'
import { refreshData } from '../services/store'

const message = ref('')
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

async function onExport() {
  error.value = ''
  message.value = ''
  try {
    await exportData()
    message.value = 'Datos exportados correctamente.'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al exportar.'
  }
}

async function onImportFile(event: Event) {
  error.value = ''
  message.value = ''
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const counts = await importData(file)
    await refreshData()
    message.value = `Datos importados: ${counts.items} items y ${counts.recipes} recetas. Los datos anteriores fueron reemplazados.`
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al importar.'
  } finally {
    input.value = ''
  }
}
</script>

<template>
  <div class="view">
    <div class="view-header">
      <h2>Datos</h2>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="message" class="alert success">{{ message }}</div>

    <div class="panel">
      <h2>Exportar datos</h2>
      <p class="muted">Descarga un archivo JSON con todos tus items y recetas (backup).</p>
      <button class="primary" @click="onExport">Exportar datos</button>
    </div>

    <div class="panel">
      <h2>Importar datos</h2>
      <p class="muted">
        Selecciona un JSON exportado previamente. <strong>Reemplazará todos los datos actuales.</strong>
      </p>
      <input ref="fileInput" type="file" accept="application/json,.json" @change="onImportFile" style="max-width: 360px" />
    </div>
  </div>
</template>
