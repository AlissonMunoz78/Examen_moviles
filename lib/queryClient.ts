// lib/queryClient.ts
// Adicional +10 pts: TanStack Query para manejo de estado servidor
// QueryClient centralizado para toda la aplicación

import { QueryClient } from "@tanstack/react-query";

/**
 * Cliente de TanStack Query configurado con valores óptimos para una app móvil.
 * - staleTime: Los datos se consideran frescos por 1 minuto antes de re-fetch
 * - gcTime: Cache se mantiene 5 minutos después de que el componente se desmonta
 * - retry: Reintenta 2 veces en caso de error de red
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,       // 1 minuto
      gcTime: 1000 * 60 * 5,      // 5 minutos de caché
      retry: 2,
      refetchOnWindowFocus: false, // En móvil no aplica "window focus"
    },
    mutations: {
      retry: 1,
    },
  },
});
