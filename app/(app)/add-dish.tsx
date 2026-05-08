// app/(app)/add-dish.tsx
// Requerimiento 3: Registro de plato con cámara/galería + GPS
// Requerimiento 4: Botón con efecto de escala withSpring (Animación 3)
// Requerimiento 2: Formulario con react-hook-form, se limpia después de registrar

import { zodResolver } from "@hookform/resolvers/zod";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import * as z from "zod";
import { useAuth } from "../../context/AuthContext";
import { useAddDishMutation } from "../../hooks/useDishes";

// Esquema de validación del formulario de plato
const dishSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del plato es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
});

type DishForm = z.infer<typeof dishSchema>;

/**
 * Pantalla para agregar un nuevo plato.
 *
 * Requerimiento 3:
 * - Cámara o galería para la foto (ImagePicker)
 * - GPS automático al presionar "Registrar" (expo-location)
 * - Ningún campo puede estar vacío al registrar
 *
 * Requerimiento 4 — Animación con withSpring:
 * - El botón "Registrar" tiene efecto de escala al presionarlo
 */
export default function AddDishScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const addDishMutation = useAddDishMutation(user?.id ?? "");

  // Estado local del formulario
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [locationInfo, setLocationInfo] = useState<{
    latitude: number;
    longitude: number;
    city: string | null;
    country: string | null;
  } | null>(null);

  // Reanimated: valor compartido para la animación de escala del botón
  const buttonScale = useSharedValue(1);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DishForm>({
    resolver: zodResolver(dishSchema),
    defaultValues: { name: "" },
  });

  /**
   * Abre la cámara del dispositivo para tomar una foto.
   * Requerimiento 3: El usuario puede elegir entre cámara o galería.
   */
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "GastroMap necesita acceso a la cámara para fotografiar tus platos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  /**
   * Abre la galería de fotos del dispositivo.
   * Requerimiento 3: El usuario puede elegir entre cámara o galería.
   */
  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "GastroMap necesita acceso a tu galería para seleccionar fotos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  /**
   * Muestra un modal para elegir entre cámara o galería.
   */
  const handlePhotoSelection = () => {
    Alert.alert("Seleccionar foto", "¿Desde dónde quieres tomar la foto?", [
      { text: "📷 Cámara", onPress: openCamera },
      { text: "🖼️ Galería", onPress: openGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  /**
   * Obtiene la ubicación GPS actual del dispositivo.
   * Requerimiento 3: El GPS debe capturar la ubicación al presionar "Registrar".
   */
  const getCurrentLocation = async (): Promise<typeof locationInfo> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso de ubicación denegado",
        "GastroMap necesita tu ubicación para registrar dónde comiste el plato."
      );
      return null;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Geocodificación inversa: coordenadas → ciudad y país
      const [geocoded] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: geocoded?.city ?? geocoded?.district ?? null,
        country: geocoded?.country ?? null,
      };
    } catch (error) {
      console.error("[GPS] Error obteniendo ubicación:", error);
      return null;
    }
  };

  /**
   * Estilo animado del botón "Registrar" (Reanimated).
   * Requerimiento 4 — Animación 3: Efecto de escala con withSpring al presionar.
   */
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  /**
   * Registra el plato con todos sus datos.
   * Requerimiento 3: Ningún campo puede estar vacío.
   * Requerimiento 2: El formulario se limpia después de registrar.
   */
  const onSubmit = async (data: DishForm) => {
    // Validación: foto obligatoria
    if (!photoUri) {
      Alert.alert(
        "Foto requerida",
        "Agrega una foto del plato antes de registrar."
      );
      return;
    }

    // Animación de escala del botón al presionar (withSpring — Requerimiento 4)
    buttonScale.value = withSequence(
      withSpring(0.92, { damping: 6, stiffness: 200 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );

    // Capturar GPS en el momento de registrar (Requerimiento 3)
    const location = await getCurrentLocation();
    setLocationInfo(location);

    // Registrar el plato usando TanStack Query mutation
    addDishMutation.mutate(
      {
        name: data.name.trim(),
        localPhotoUri: photoUri,
        city: location?.city ?? null,
        country: location?.country ?? null,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
      },
      {
        onSuccess: () => {
          // Requerimiento 2: Limpiar formulario después de registrar
          reset();
          setPhotoUri(null);
          setLocationInfo(null);
          Alert.alert("¡Plato registrado!", "Tu plato fue guardado exitosamente.", [
            { text: "Ver lista", onPress: () => router.push("/(app)/home") },
            { text: "Agregar otro", style: "cancel" },
          ]);
        },
        onError: () => {
          Alert.alert("Error", "No se pudo registrar el plato. Intenta de nuevo.");
        },
      }
    );
  };

  const isSubmitting = addDishMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-dominos-cream">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerClassName="pb-10"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            className="bg-dominos-red px-5 pt-4 pb-8"
          >
            <Text className="text-white font-bold text-2xl">
              Nuevo plato 🍽️
            </Text>
            <Text className="text-white opacity-80 text-sm mt-1">
              Registra dónde y qué comiste
            </Text>
          </Animated.View>

          <View className="px-4 -mt-4">
            {/* Card del formulario */}
            <Animated.View
              entering={FadeInDown.delay(150).duration(500)}
              className="bg-white rounded-3xl p-5 shadow-md mb-4"
            >
              {/* Nombre del plato */}
              <View className="mb-5">
                <Text className="text-sm font-bold text-dominos-gray-dark mb-2">
                  Nombre del plato *
                </Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`bg-dominos-gray rounded-xl px-4 py-3 text-dominos-gray-dark text-base border-2 ${
                        errors.name
                          ? "border-dominos-red"
                          : "border-transparent focus:border-dominos-blue"
                      }`}
                      placeholder="Ej: Ceviche de camarón, Pizza hawaiana..."
                      placeholderTextColor="#9CA3AF"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      maxLength={100}
                    />
                  )}
                />
                {errors.name && (
                  <Text className="text-dominos-red text-xs mt-1">
                    {errors.name.message}
                  </Text>
                )}
              </View>

              {/* Sección de foto */}
              <View className="mb-5">
                <Text className="text-sm font-bold text-dominos-gray-dark mb-2">
                  Foto del plato *
                </Text>

                {photoUri ? (
                  /* Vista previa de la foto seleccionada */
                  <View className="rounded-xl overflow-hidden mb-2">
                    <Image
                      source={{ uri: photoUri }}
                      className="w-full h-48"
                      resizeMode="cover"
                    />
                    <Pressable
                      onPress={handlePhotoSelection}
                      className="absolute top-2 right-2 bg-dominos-red rounded-lg px-3 py-1"
                    >
                      <Text className="text-white text-xs font-bold">
                        Cambiar
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  /* Botones de selección de foto */
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={openCamera}
                      className="flex-1 bg-dominos-gray rounded-xl py-5 items-center active:bg-dominos-gray-mid"
                    >
                      <Text className="text-3xl mb-1">📷</Text>
                      <Text className="text-dominos-gray-dark text-xs font-semibold">
                        Cámara
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={openGallery}
                      className="flex-1 bg-dominos-gray rounded-xl py-5 items-center active:bg-dominos-gray-mid"
                    >
                      <Text className="text-3xl mb-1">🖼️</Text>
                      <Text className="text-dominos-gray-dark text-xs font-semibold">
                        Galería
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Info de GPS */}
              <View className="bg-dominos-gray rounded-xl p-3 flex-row items-center">
                <Text className="text-2xl mr-3">📍</Text>
                <View className="flex-1">
                  <Text className="text-dominos-gray-dark text-xs font-bold">
                    Ubicación GPS
                  </Text>
                  <Text className="text-dominos-gray-mid text-xs mt-0.5">
                    Se capturará automáticamente al registrar el plato
                  </Text>
                </View>
                <View className="w-3 h-3 rounded-full bg-dominos-red" />
              </View>
            </Animated.View>

            {/* Botón de registro con animación withSpring (Requerimiento 4) */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(500)}
              style={animatedButtonStyle}
            >
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className={`rounded-2xl py-4 items-center shadow-md ${
                  isSubmitting ? "bg-dominos-red-dark" : "bg-dominos-red"
                }`}
              >
                {isSubmitting ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-bold text-base ml-2">
                      Guardando plato...
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-2">
                    <Text className="text-white font-bold text-base">
                      Registrar plato
                    </Text>
                    <Text className="text-white text-lg">🚀</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(400).duration(400)}
              className="mt-3 items-center"
            >
              <Text className="text-dominos-gray-mid text-xs">
                * Nombre y foto son obligatorios
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
