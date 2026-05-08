// types/index.ts
// Tipado TypeScript requerido por el examen — Requerimiento Dish

/**
 * Tipo principal para un plato registrado por el usuario.
 * Campos definidos según el requerimiento del examen.
 */
export type Dish = {
  id: string;
  user_id: string;
  name: string;
  photo_uri: string | null;      // URI pública de Supabase Storage
  city: string | null;           // Ciudad obtenida por GPS (expo-location)
  country: string | null;        // País obtenido por GPS
  latitude: number | null;       // Latitud capturada al registrar
  longitude: number | null;      // Longitud capturada al registrar
  created_at: string;            // ISO timestamp
};

/**
 * Payload para crear un nuevo plato (sin id ni created_at, los genera Supabase)
 */
export type CreateDishPayload = Omit<Dish, "id" | "created_at">;

/**
 * Contexto de autenticación global
 */
export type AuthUser = {
  id: string;
  email: string | undefined;
};
