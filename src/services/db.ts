import type { Item, ItemSource, Recipe } from '../models/types'

const DB_NAME = 'aion2-economy'
const DB_VERSION = 2
const ITEMS_STORE = 'items'
const RECIPES_STORE = 'recipes'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        const db = request.result
        const tx = request.transaction
        if (!tx) return
        if (!db.objectStoreNames.contains(ITEMS_STORE)) {
          db.createObjectStore(ITEMS_STORE, { keyPath: 'id' })
        } else {
          const store = tx.objectStore(ITEMS_STORE)
          store.openCursor().onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
            if (cursor) {
              const item = cursor.value as Item
              if (item.source === undefined) {
                item.source = 'mercado'
                cursor.update(item)
              }
              cursor.continue()
            }
          }
        }
        if (!db.objectStoreNames.contains(RECIPES_STORE)) {
          db.createObjectStore(RECIPES_STORE, { keyPath: 'id' })
        } else {
          const store = tx.objectStore(RECIPES_STORE)
          store.openCursor().onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
            if (cursor) {
              const recipe = cursor.value as Recipe
              if (recipe.doubleBountyPercent === undefined) {
                recipe.doubleBountyPercent = 0
                cursor.update(recipe)
              }
              cursor.continue()
            }
          }
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return dbPromise
}

function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode)
        const request = fn(tx.objectStore(storeName))
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }),
  )
}

export function newId(): string {
  return crypto.randomUUID()
}

// ---- Items ----

export function getItems(): Promise<Item[]> {
  return withStore(ITEMS_STORE, 'readonly', (store) => store.getAll() as IDBRequest<Item[]>)
}

export function createItem(
  name: string,
  referencePrice: number,
  source: ItemSource = 'mercado',
): Promise<Item> {
  const item: Item = { id: newId(), name, referencePrice, source }
  return withStore(ITEMS_STORE, 'readwrite', (store) => store.put(item)).then(() => item)
}

export function updateItem(item: Item): Promise<void> {
  return withStore(ITEMS_STORE, 'readwrite', (store) => store.put(item)).then(() => undefined)
}

export function deleteItem(id: string): Promise<void> {
  return withStore(ITEMS_STORE, 'readwrite', (store) => store.delete(id)).then(() => undefined)
}

// ---- Recipes ----

export function getRecipes(): Promise<Recipe[]> {
  return withStore(RECIPES_STORE, 'readonly', (store) => store.getAll() as IDBRequest<Recipe[]>)
}

export function createRecipe(recipe: Omit<Recipe, 'id'>): Promise<Recipe> {
  const full: Recipe = { ...recipe, id: newId() }
  return withStore(RECIPES_STORE, 'readwrite', (store) => store.put(full)).then(() => full)
}

export function updateRecipe(recipe: Recipe): Promise<void> {
  return withStore(RECIPES_STORE, 'readwrite', (store) => store.put(recipe)).then(() => undefined)
}

export function deleteRecipe(id: string): Promise<void> {
  return withStore(RECIPES_STORE, 'readwrite', (store) => store.delete(id)).then(() => undefined)
}

// ---- Backup ----

export async function replaceAllData(items: Item[], recipes: Recipe[]): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([ITEMS_STORE, RECIPES_STORE], 'readwrite')
    tx.objectStore(ITEMS_STORE).clear()
    tx.objectStore(RECIPES_STORE).clear()
    for (const item of items) tx.objectStore(ITEMS_STORE).put(item)
    for (const recipe of recipes) tx.objectStore(RECIPES_STORE).put(recipe)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
