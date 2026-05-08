// lib/supabase.ts
// Requerimiento 1: Configuración de Supabase Authentication
// Se usa ExpoSecureStoreAdapter para persistir la sesión de forma segura en el dispositivo

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Credenciales leídas desde .env (NUNCA hardcodeadas — Requerimiento de entrega)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validar que las credenciales existan
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] Variables de entorno no configuradas:",
    "EXPO_PUBLIC_SUPABASE_URL:",
    supabaseUrl ? "✓" : "✗",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "✓" : "✗"
  );
}

/**
 * Supabase Auth puede exceder 2KB por sesión.
 * Usamos AsyncStorage para evitar warnings/errores por límite de SecureStore.
 */
const SupabaseStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return AsyncStorage.getItem(key);
    } catch (error) {
      console.error("[AuthStorage] Error leyendo item:", error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("[AuthStorage] Error guardando item:", error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("[AuthStorage] Error eliminando item:", error);
    }
  },
};

// Cliente Supabase singleton — usado en toda la app
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      storage: SupabaseStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // No aplicable en React Native
    },
  }
);
