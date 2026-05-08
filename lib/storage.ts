// lib/storage.ts
// Requerimiento 2: Persistencia local de platos con AsyncStorage
// Se usa el user_id de Supabase como namespace para aislar datos por usuario

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Dish } from "../types";

/**
 * Genera la clave de AsyncStorage única por usuario.
 * Garantiza que cada usuario solo acceda a sus propios datos en el dispositivo.
 * Patrón: "dishes:<user_id>"
 */
const getDishKey = (userId: string): string => `dishes:${userId}`;

/**
 * Carga todos los platos del usuario desde AsyncStorage.
 * Requerimiento 2: Los platos deben cargarse al abrir la pantalla Home.
 */
export const loadDishes = async (userId: string): Promise<Dish[]> => {
  try {
    const raw = await AsyncStorage.getItem(getDishKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as Dish[];
  } catch (error) {
    console.error("[Storage] Error cargando platos:", error);
    return [];
  }
};

/**
 * Guarda la lista completa de platos del usuario en AsyncStorage.
 * Reemplaza el valor anterior (operación de escritura completa).
 */
export const saveDishes = async (
  userId: string,
  dishes: Dish[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(getDishKey(userId), JSON.stringify(dishes));
  } catch (error) {
    console.error("[Storage] Error guardando platos:", error);
    throw error;
  }
};

/**
 * Agrega un nuevo plato al inicio de la lista del usuario.
 * Requerimiento 2: Al agregar un plato, debe aparecer al inicio de la lista.
 */
export const addDishToStorage = async (
  userId: string,
  dish: Dish
): Promise<Dish[]> => {
  const current = await loadDishes(userId);
  const updated = [dish, ...current]; // Nuevo plato va al inicio
  await saveDishes(userId, updated);
  return updated;
};

/**
 * Elimina un plato por su ID del almacenamiento local.
 * Requerimiento 2 + 4: Eliminación con animación de swipe.
 */
export const removeDishFromStorage = async (
  userId: string,
  dishId: string
): Promise<Dish[]> => {
  const current = await loadDishes(userId);
  const updated = current.filter((d) => d.id !== dishId);
  await saveDishes(userId, updated);
  return updated;
};

/**
 * Limpia todos los platos del usuario del dispositivo.
 * Útil al cerrar sesión para limpiar datos locales.
 */
export const clearUserDishes = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(getDishKey(userId));
  } catch (error) {
    console.error("[Storage] Error limpiando platos del usuario:", error);
  }
};
