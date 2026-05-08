// app/_layout.tsx
// Layout raíz: configura TanStack Query, AuthProvider y navegación con Expo Router
// Requerimiento 1: Redirige automáticamente según estado de autenticación

import "../global.css"; // NativeWind v4: importar CSS de Tailwind
import { QueryClientProvider } from "@tanstack/react-query";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { queryClient } from "../lib/queryClient";

/**
 * NavigationGuard: Controla el flujo de navegación según autenticación.
 * Requerimiento 1: Redirige automáticamente a Home al iniciar sesión
 * y al Login al cerrar sesión.
 */
function NavigationGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(app)";

    if (user && inAuthGroup) {
      // Usuario autenticado intentando ver pantallas de auth → ir a Home
      router.replace("/(app)/home");
    } else if (!user && inAppGroup) {
      // Usuario no autenticado intentando ver pantallas protegidas → ir a Login
      router.replace("/(auth)/login");
    } else if (!user && !inAuthGroup) {
      // Primera carga sin sesión
      router.replace("/(auth)/login");
    }
  }, [user, loading, segments]);

  return <Slot />;
}

/**
 * Layout raíz de la aplicación.
 * Provee: GestureHandler (swipe), TanStack Query, AuthContext, Expo Router.
 */
export default function RootLayout() {
  return (
    // GestureHandlerRootView requerido por react-native-gesture-handler para swipe
    <GestureHandlerRootView className="flex-1">
      {/* QueryClientProvider: habilita TanStack Query en toda la app */}
      <QueryClientProvider client={queryClient}>
        {/* AuthProvider: provee estado de sesión Supabase globalmente */}
        <AuthProvider>
          <NavigationGuard />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
