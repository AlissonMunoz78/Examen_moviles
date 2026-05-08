// app/(auth)/register.tsx
// Requerimiento 1: Pantalla de Registro con Supabase Authentication
// Valida que las contraseñas coincidan antes de enviar (Requerimiento 1)
// Estilos 100% NativeWind — paleta Domino's Pizza

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

// Esquema de validación: confirma que las contraseñas coincidan
const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo es obligatorio")
      .email("Ingresa un correo válido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    // Requerimiento 1: Validación de que las contraseñas coinciden
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

/**
 * Pantalla de Registro
 * Requerimiento 1: Email + contraseña + confirmación → Supabase signUp
 */
export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  /**
   * Registra al usuario con Supabase Auth.
   * Requerimiento 1: Validación de contraseñas antes de enviar.
   */
  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      if (error) {
        Alert.alert("Error al registrarse", error.message);
      } else {
        Alert.alert(
          "¡Cuenta creada!",
          "Tu cuenta fue creada exitosamente. Revisa tu correo para confirmar.",
          [{ text: "Ir al Login", onPress: () => router.replace("/(auth)/login") }]
        );
      }
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
        {/* Header */}
        <Animated.View
          entering={ZoomIn.duration(600)}
          className="items-center mb-10"
        >
          <View className="w-24 h-24 rounded-2xl bg-dominos-blue items-center justify-center mb-4 shadow-lg">
            <Text className="text-white text-4xl">🍽️</Text>
          </View>
          <Text className="text-3xl font-bold text-dominos-red tracking-tight">
            GastroMap
          </Text>
          <Text className="text-dominos-gray-mid text-base mt-1">
            Crea tu cuenta gratis
          </Text>
        </Animated.View>

        {/* Formulario */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          className="bg-white rounded-3xl p-6 shadow-md"
        >
          <Text className="text-2xl font-bold text-dominos-gray-dark mb-6">
            Crear cuenta
          </Text>

          {/* Email */}
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

          {/* Contraseña */}
          <View className="mb-4">
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
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
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

          {/* Confirmar contraseña */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-dominos-gray-dark mb-2">
              Confirmar contraseña
            </Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-dominos-gray rounded-xl px-4 py-3 text-dominos-gray-dark text-base border-2 ${
                    errors.confirmPassword
                      ? "border-dominos-red"
                      : "border-transparent"
                  }`}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {/* Requerimiento 1: Validación que contraseñas coincidan */}
            {errors.confirmPassword && (
              <Text className="text-dominos-red text-xs mt-1">
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>

          {/* Botón Registrar */}
          <Pressable
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            className={`rounded-xl py-4 items-center ${
              loading ? "bg-dominos-blue-dark" : "bg-dominos-blue"
            } active:scale-95`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                Crear cuenta
              </Text>
            )}
          </Pressable>
        </Animated.View>

        {/* Link a Login */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          className="mt-6 items-center"
        >
          <Text className="text-dominos-gray-mid">
            ¿Ya tienes cuenta?{" "}
            <Text
              className="text-dominos-red font-bold"
              onPress={() => router.back()}
            >
              Iniciar sesión
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
