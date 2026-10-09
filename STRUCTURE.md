# Estructura del proyecto

```
contador-kina/
├── index.html                 # Punto de entrada HTML
├── package.json               # Dependencias y scripts
├── tsconfig.json              # Configuración de TypeScript
├── vite.config.ts             # Configuración de Vite
├── README.md
├── STRUCTURE.md
├── CHANGELOG.md
├── LICENSE                    # Apache License 2.0
└── src/
    ├── main.ts                # Bootstrap de la app (createApp)
    ├── App.vue                # Shell, topbar, menú desplegable y enrutado por pestañas
    ├── style.css              # Sistema de diseño (CSS, mobile-first)
    ├── vite-env.d.ts          # Tipos para Vite / *.vue
    │
    ├── components/
    │   ├── ActionMenu.vue     # Menú desplegable de acciones (editar/eliminar)
    │   ├── Drawer.vue         # Panel lateral deslizante (crear/editar)
    │   ├── ItemForm.vue       # Formulario de item (crear/editar)
    │   └── RecipeForm.vue     # Formulario de receta (crear/editar)
    │
    ├── views/
    │   ├── ItemsView.vue      # Lista de items (cards + buscador + filtros)
    │   ├── RecipesView.vue    # Lista de recetas (paneles con cards de materiales)
    │   ├── CalculatorView.vue # Calculadora de materiales / comprar vs fabricar
    │   ├── LotView.vue        # Rentabilidad de lote (costo, beneficio, kinah/hora)
    │   └── DataView.vue       # Exportar / importar datos (backup)
    │
    ├── models/
    │   └── types.ts           # Tipos: Item, Recipe, CalculationResult, LotResult, BackupData...
    │
    ├── services/
    │   ├── db.ts              # Acceso a IndexedDB (CRUD de items y recetas)
    │   ├── store.ts           # Estado reactivo mínimo (sin Pinia) + helpers de lookup
    │   ├── calculator.ts      # Cálculo de costos, expansión de derivados, comparar
    │   ├── profit.ts          # Cálculo de rentabilidad de lote
    │   └── backup.ts          # Exportar/importar JSON
    │
    └── utils/
        ├── format.ts          # Formato de números y kinah
        ├── source.ts          # Etiquetas y clases de color por origen (tienda/mercado/farmeo)
        └── validation.ts      # Validaciones de items y recetas (incluye ciclos)
```

## Notas de arquitectura

- **Mobile-first**: los estilos base son para móvil; los `@media (min-width: ...)` aplican mejoras para escritorio.
- **Cards en móvil / tablas en escritorio**: las tablas usan `.responsive-table` para mostrarse como cards en pantallas pequeñas; los items usan siempre cards.
- **Acceso a IndexedDB aislado** en `src/services/db.ts`. Las vistas no tocan IndexedDB directamente.
- **Sin Pinia**: el estado se mantiene con un objeto `reactive` simple en `store.ts` sincronizado desde IndexedDB.
- **Cálculo recursivo**: `calculator.ts` recorre las recetas recursivamente, con detección de ciclos para evitar bucles infinitos.
