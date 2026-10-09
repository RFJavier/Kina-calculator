export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return String(n)
  const rounded = Math.round(n * 100) / 100
  return rounded.toLocaleString('es-ES', { maximumFractionDigits: 2 })
}

export function formatKinah(n: number): string {
  return `${formatNumber(n)} kinah`
}
