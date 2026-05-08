// hooks/useDishes.ts
// Adicional +10 pts: TanStack Query para manejo de estado de platos
// useQuery para carga, useMutation para agregar y eliminar

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDishToStorage, loadDishes, removeDishFromStorage } from "../lib/storage";
import { uploadDishPhoto } from "../lib/uploadPhoto";
import type { CreateDishPayload, Dish } from "../types";
import * as Crypto from "expo-crypto";

// Clave de caché de TanStack Query para platos
const DISHES_KEY = (userId: string) => ["dishes", userId];

/**
 * Hook: useDishesQuery
 * TanStack Query — Requerimiento 2: carga platos al abrir Home.
 * Usa queryFn asíncrona que lee de AsyncStorage.
 * Los datos quedan en caché y se sincronizan automáticamente.
 */
export const useDishesQuery = (userId: string) => {
  return useQuery({
    queryKey: DISHES_KEY(userId),
    queryFn: () => loadDishes(userId),
    enabled: !!userId, // Solo ejecuta si hay usuario autenticado
  });
};

/**
 * Hook: useAddDishMutation
 * TanStack Query — Requerimiento 2 + 3: agregar un plato con foto y GPS.
 * Sube la foto a Supabase Storage y guarda el plato en AsyncStorage.
 * Invalida el caché de platos para refrescar la lista automáticamente.
 */
export const useAddDishMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<CreateDishPayload, "user_id" | "photo_uri"> & { localPhotoUri: string | null }) => {
      // Generar ID único para el nuevo plato
      const id = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${userId}-${Date.now()}-${Math.random()}`
      );

      // Subir foto a Supabase Storage si existe
      let photoUrl: string | null = null;
      if (payload.localPhotoUri) {
        photoUrl = await uploadDishPhoto(userId, payload.localPhotoUri);
        if (!photoUrl) {
          // Fallback: conserva la foto local si falla el upload remoto (ej. RLS en Storage)
          photoUrl = payload.localPhotoUri;
        }
      }

      // Construir el objeto Dish completo
      const newDish: Dish = {
        id: id.substring(0, 16),
        user_id: userId,
        name: payload.name,
        photo_uri: photoUrl,
        city: payload.city,
        country: payload.country,
        latitude: payload.latitude,
        longitude: payload.longitude,
        created_at: new Date().toISOString(),
      };

      // Persistir en AsyncStorage con namespace por usuario
      await addDishToStorage(userId, newDish);
      return newDish;
    },
    onSuccess: () => {
      // Invalidar caché para que useQuery refetch automáticamente
      queryClient.invalidateQueries({ queryKey: DISHES_KEY(userId) });
    },
    onError: (error) => {
      console.error("[useDishes] Error agregando plato:", error);
    },
  });
};

/**
 * Hook: useRemoveDishMutation
 * TanStack Query — Requerimiento 4: eliminación con swipe.
 * Actualiza optimistamente la UI antes de confirmar en storage.
 */
export const useRemoveDishMutation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dishId: string) => {
      return removeDishFromStorage(userId, dishId);
    },
    // Actualización optimista: remueve el plato de la UI inmediatamente
    onMutate: async (dishId: string) => {
      await queryClient.cancelQueries({ queryKey: DISHES_KEY(userId) });
      const previous = queryClient.getQueryData<Dish[]>(DISHES_KEY(userId));
      queryClient.setQueryData<Dish[]>(DISHES_KEY(userId), (old) =>
        old ? old.filter((d) => d.id !== dishId) : []
      );
      return { previous };
    },
    onError: (_err, _dishId, context) => {
      // Revertir si falla
      if (context?.previous) {
        queryClient.setQueryData(DISHES_KEY(userId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DISHES_KEY(userId) });
    },
  });
};
