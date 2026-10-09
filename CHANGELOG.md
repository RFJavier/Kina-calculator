# Changelog

Todas las novedades relevantes de este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/)
y el proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Agregado
- Diseño de UI con sistema de colores por origen de material (tienda = verde, farmeo = amarillo).
- Componentes `Drawer` y `ActionMenu` reutilizables para crear/editar y acciones por elemento.
- Cards de materiales en recetas y rentabilidad, resaltadas según su origen.
- Documentación: `README.md`, `STRUCTURE.md`, `CHANGELOG.md` y licencia Apache 2.0.

## [0.1.0] - 2026-10-08

### Agregado
- MVP inicial: items, recetas, derivados, calculadora de materiales y comparación comprar vs fabricar.
- Rentabilidad de lote: costo, precio sugerido, beneficio/pérdida y kinah por hora (con tiempo de farmeo).
- Persistencia local en IndexedDB con migración de esquema (v2).
- Exportar e importar datos en JSON (backup).
- Origen de material (`tienda` / `mercado` / `farmeo`) y porcentaje de doble bounty en recetas.
- Validaciones: nombre, cantidades, precio, materiales mínimos, auto-referencia y ciclos de recetas.
- Diseño mobile-first y menú de navegación desplegable.
