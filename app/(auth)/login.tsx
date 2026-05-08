// app/(auth)/login.tsx
// Requerimiento 1: Pantalla de Login con Supabase Authentication
// Usa react-hook-form + zod para validación (Requerimiento 2 — controles al ingresar)
// Estilos 100% con NativeWind (Requerimiento 4)

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import * as z from "zod";
import { supabase } from "../../lib/supabase";

// Esquema de validación con zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo válido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

/**
 * Pantalla de Login
 * Requerimiento 1: Email + contraseña → Supabase Auth → navega a Home
 */
export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  /**
   * Inicia sesión con Supabase.
   * Requerimiento 1: Navegación automática al Home al iniciar sesión correctamente.
   * La redirección la maneja NavigationGuard en _layout.tsx al detectar el cambio de usuario.
   */
  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (error) {
        Alert.alert("Error al iniciar sesión", error.message);
      }
      // La redirección automática ocurre en el NavigationGuard del layout raíz
    } catch (err) {
      Alert.alert("Error", "Ocurrió un error inesperado. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-dominos-cream"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Header con animación de entrada */}
        <Animated.View
          entering={ZoomIn.duration(600)}
          className="items-center mb-10"
        >
          {/* Domino's inspired logo badge */}
          <View className="w-24 h-24 rounded-2xl bg-dominos-red items-center justify-center mb-4 shadow-lg">
            <Text className="text-white text-4xl font-bold">🍕</Text>
          </View>
          <Text className="text-3xl font-bold text-dominos-red tracking-tight">
            GastroMap
          </Text>
          <Text className="text-dominos-gray-mid text-base mt-1">
            Tu mapa gastronómico personal
          </Text>
        </Animated.View>

        {/* Card del formulario */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          className="bg-white rounded-3xl p-6 shadow-md"
        >
          <Text className="text-2xl font-bold text-dominos-gray-dark mb-6">
            Iniciar sesión
          </Text>

          {/* Campo email */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-dominos-gray-dark mb-2">
              Correo electrónico
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-dominos-gray rounded-xl px-4 py-3 text-dominos-gray-dark text-base border-2 ${
                    errors.email ? "border-dominos-red" : "border-transparent"
                  }`}
                  placeholder="tu@correo.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && (
              <Text className="text-dominos-red text-xs mt-1">
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Campo contraseña */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-dominos-gray-dark mb-2">
              Contraseña
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-dominos-gray rounded-xl px-4 py-3 text-dominos-gray-dark text-base border-2 ${
                    errors.password
                      ? "border-dominos-red"
                      : "border-transparent"
                  }`}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoComplete="password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password && (
              <Text className="text-dominos-red text-xs mt-1">
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* Botón de Login */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            className={`rounded-xl py-4 items-center ${
              loading ? "bg-dominos-red-dark" : "bg-dominos-red"
            } active:scale-95`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                Iniciar sesión
              </Text>
            )}
          </Pressable>
        </Animated.View>

        {/* Link a Registro */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          className="mt-6 items-center"
        >
          <Text className="text-dominos-gray-mid">
            ¿No tienes cuenta?{" "}
            <Text
              className="text-dominos-blue font-bold"
              onPress={() => router.push("/(auth)/register")}
            >
              Regístrate aquí
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
