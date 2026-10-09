# AION 2 Economy Calculator

Calculadora local de economía para **AION 2** (aunque el sistema es genérico y funciona con cualquier juego). Permite registrar items, recetas y precios de referencia, calcular costos de fabricación, cantidades de materiales, comparar *comprar vs fabricar* y medir la rentabilidad de un lote de crafteo.

Todo corre en el navegador, sin backend ni base de datos externa: los datos se guardan en **IndexedDB** y pueden exportarse/importarse como JSON.

## Características

- **Items** con nombre, precio de referencia y origen (`tienda`, `mercado`, `farmeo`).
- **Recetas** con objeto producido, cantidad, lista de materiales y porcentaje de *doble bounty*.
- **Derivados**: un item con receta es un derivado; el sistema recorre las recetas recursivamente hasta las materias primas.
- **Calculadora de materiales**: materiales directos y materias primas finales para una cantidad dada.
- **Comparar comprar vs fabricar**: costo de producción contra precio de referencia.
- **Rentabilidad de lote**: costo total, precio sugerido, beneficio/pérdida y kinah por hora (sumando tiempo de farmeo).
- **Persistencia local** en IndexedDB.
- **Backup**: exportar e importar datos en JSON.
- Detección de **ciclos de recetas** y validaciones básicas.

## Stack

- Vue 3
- TypeScript
- Vite
- IndexedDB (sin librerías externas)
- CSS plano (sistema de diseño propio, sin framework)

## Requisitos

- Node.js 18+ (probado con Node 22)

## Instalación y uso

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # compilar para producción (typecheck + vite build)
npm run preview  # previsualizar el build
npm run typecheck # solo comprobación de tipos
```

## Estructura del proyecto

Ver [STRUCTURE.md](./STRUCTURE.md).

## Licencia

[Apache License 2.0](./LICENSE)
