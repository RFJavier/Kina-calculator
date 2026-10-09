import type { ItemSource } from '../models/types'

export const SOURCE_LABEL: Record<ItemSource, string> = {
  tienda: 'Tienda',
  mercado: 'Mercado',
  farmeo: 'Farmeo',
}

export const SOURCE_BADGE_CLASS: Record<ItemSource, string> = {
  tienda: 'badge tienda',
  mercado: 'badge mercado',
  farmeo: 'badge farmeo',
}

export const SOURCE_CARD_CLASS: Record<ItemSource, string> = {
  tienda: 'source-tienda',
  mercado: 'source-mercado',
  farmeo: 'source-farmeo',
}
