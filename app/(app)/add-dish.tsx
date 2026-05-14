// app/(app)/add-dish.tsx
// Requerimiento 3: Registro de plato con cámara/galería + GPS
// Requerimiento 4: Animaciones Reanimated
// Taller 7: Selección manual de ubicación usando Leaflet + OpenStreetMap

import { zodResolver } from "@hookform/resolvers/zod";

import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useState } from "react";

import {
  Controller,
  useForm,
} from "react-hook-form";

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

// ===============================
// Validación Zod
// ===============================

const dishSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del plato es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
});

type DishForm = z.infer<typeof dishSchema>;

// ===============================
// Pantalla principal
// ===============================

export default function AddDishScreen() {

  const { user } = useAuth();

  const addDishMutation = useAddDishMutation(
    user?.id ?? ""
  );

  // ===============================
  // Coordenadas manuales desde Leaflet
  // ===============================

  const params = useLocalSearchParams();

  const manualLatitude = params.manualLatitude
    ? Number(params.manualLatitude)
    : null;

  const manualLongitude = params.manualLongitude
    ? Number(params.manualLongitude)
    : null;

  // ===============================
  // Estados
  // ===============================

  const [photoUri, setPhotoUri] =
    useState<string | null>(null);

  const [locationInfo, setLocationInfo] =
    useState<{
      latitude: number;
      longitude: number;
      city: string | null;
      country: string | null;
    } | null>(null);

  // ===============================
  // Animación botón
  // ===============================

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: buttonScale.value,
        },
      ],
    }));

  // ===============================
  // React Hook Form
  // ===============================

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DishForm>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      name: "",
    },
  });

  // ===============================
  // Cámara
  // ===============================

  const openCamera = async () => {

    const { status } =
      await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Debes permitir acceso a la cámara."
      );

      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // ===============================
  // Galería
  // ===============================

  const openGallery = async () => {

    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Debes permitir acceso a la galería."
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  // ===============================
  // GPS automático
  // ===============================

  const getCurrentLocation = async () => {

    const { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {

      Alert.alert(
        "Permiso denegado",
        "Debes permitir acceso al GPS."
      );

      return null;
    }

    try {

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const [geocoded] =
        await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city:
          geocoded?.city ??
          geocoded?.district ??
          null,
        country: geocoded?.country ?? null,
      };

    } catch (error) {

      console.error(error);

      return null;
    }
  };

  // ===============================
  // Registrar plato
  // ===============================

  const onSubmit = async (
    data: DishForm
  ) => {

    // Foto obligatoria
    if (!photoUri) {

      Alert.alert(
        "Foto requerida",
        "Debes agregar una foto."
      );

      return;
    }

    // Animación botón
    buttonScale.value = withSequence(
      withSpring(0.92),
      withSpring(1)
    );

    // ===============================
    // GPS automático
    // ===============================

    let location = null;

    // Si NO hay coordenadas manuales
    // usar GPS automático

    if (
      manualLatitude === null ||
      manualLongitude === null
    ) {

      location =
        await getCurrentLocation();

      setLocationInfo(location);
    }

    // ===============================
    // Registrar en BD
    // ===============================

    addDishMutation.mutate(
      {
        name: data.name.trim(),

        localPhotoUri: photoUri,

        city: location?.city ?? null,

        country: location?.country ?? null,

        // Coordenadas manuales o GPS
        latitude:
          manualLatitude ??
          location?.latitude ??
          null,

        longitude:
          manualLongitude ??
          location?.longitude ??
          null,
      },
      {
        onSuccess: () => {

          reset();

          setPhotoUri(null);

          setLocationInfo(null);

          Alert.alert(
            "¡Plato registrado!",
            "El plato fue guardado correctamente.",
            [
              {
                text: "Ver lista",
                onPress: () =>
                  router.push("/(app)/home"),
              },
              {
                text: "Agregar otro",
                style: "cancel",
              },
            ]
          );
        },

        onError: () => {

          Alert.alert(
            "Error",
            "No se pudo registrar el plato."
          );
        },
      }
    );
  };

  // ===============================
  // Estado loading
  // ===============================

  const isSubmitting =
    addDishMutation.isPending;

  // ===============================
  // Render
  // ===============================

  return (
    <SafeAreaView className="flex-1 bg-dominos-cream">

      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
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

            {/* Card formulario */}
            <Animated.View
              entering={FadeInDown.delay(150).duration(500)}
              className="bg-white rounded-3xl p-5 shadow-md mb-4"
            >

              {/* Nombre */}
              <View className="mb-5">

                <Text className="text-sm font-bold text-dominos-gray-dark mb-2">
                  Nombre del plato *
                </Text>

                <Controller
                  control={control}
                  name="name"
                  render={({
                    field: {
                      onChange,
                      onBlur,
                      value,
                    },
                  }) => (
                    <TextInput
                      className={`bg-dominos-gray rounded-xl px-4 py-3 text-dominos-gray-dark text-base border-2 ${
                        errors.name
                          ? "border-dominos-red"
                          : "border-transparent"
                      }`}
                      placeholder="Ej: Pizza hawaiana"
                      placeholderTextColor="#9CA3AF"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />

                {errors.name && (
                  <Text className="text-dominos-red text-xs mt-1">
                    {errors.name.message}
                  </Text>
                )}

              </View>

              {/* Foto */}
              <View className="mb-5">

                <Text className="text-sm font-bold text-dominos-gray-dark mb-2">
                  Foto del plato *
                </Text>

                {photoUri ? (

                  <View className="rounded-xl overflow-hidden mb-2">

                    <Image
                      source={{ uri: photoUri }}
                      className="w-full h-48"
                      resizeMode="cover"
                    />

                  </View>

                ) : (

                  <View className="flex-row gap-3">

                    <Pressable
                      onPress={openCamera}
                      className="flex-1 bg-dominos-gray rounded-xl py-5 items-center"
                    >
                      <Text className="text-3xl mb-1">
                        📷
                      </Text>

                      <Text className="text-dominos-gray-dark text-xs font-semibold">
                        Cámara
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={openGallery}
                      className="flex-1 bg-dominos-gray rounded-xl py-5 items-center"
                    >
                      <Text className="text-3xl mb-1">
                        🖼️
                      </Text>

                      <Text className="text-dominos-gray-dark text-xs font-semibold">
                        Galería
                      </Text>
                    </Pressable>

                  </View>
                )}

              </View>

              {/* GPS */}
              <View className="bg-dominos-gray rounded-xl p-3 flex-row items-center mb-4">

                <Text className="text-2xl mr-3">
                  📍
                </Text>

                <View className="flex-1">

                  <Text className="text-dominos-gray-dark text-xs font-bold">
                    Ubicación GPS
                  </Text>

                  <Text className="text-dominos-gray-mid text-xs mt-0.5">
                    Puedes usar GPS automático o seleccionar un punto manualmente
                  </Text>

                </View>

                <View className="w-3 h-3 rounded-full bg-dominos-red" />

              </View>

              {/* Botón ubicación manual */}
              <Pressable
                onPress={() => {
                  router.push(
                    "/(app)/select-location"
                  );
                }}
                className="bg-dominos-blue rounded-xl py-3 items-center mb-4"
              >

                <Text className="text-white font-bold">
                  🗺️ Seleccionar ubicación manual
                </Text>

              </Pressable>

              {/* Coordenadas seleccionadas */}
              {manualLatitude &&
                manualLongitude && (

                <View className="bg-dominos-gray rounded-xl p-3">

                  <Text className="text-dominos-gray-dark font-bold text-xs">
                    Ubicación manual seleccionada
                  </Text>

                  <Text className="text-dominos-gray-mid text-xs mt-1">
                    Lat: {manualLatitude.toFixed(4)}
                  </Text>

                  <Text className="text-dominos-gray-mid text-xs">
                    Lng: {manualLongitude.toFixed(4)}
                  </Text>

                </View>
              )}

            </Animated.View>

            {/* Botón registrar */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(500)}
            >

              <Animated.View
                style={animatedButtonStyle}
              >

                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className={`rounded-2xl py-4 items-center shadow-md ${
                    isSubmitting
                      ? "bg-dominos-red-dark"
                      : "bg-dominos-red"
                  }`}
                >

                  {isSubmitting ? (

                    <View className="flex-row items-center gap-2">

                      <ActivityIndicator
                        color="white"
                        size="small"
                      />

                      <Text className="text-white font-bold text-base ml-2">
                        Guardando plato...
                      </Text>

                    </View>

                  ) : (

                    <View className="flex-row items-center gap-2">

                      <Text className="text-white font-bold text-base">
                        Registrar plato
                      </Text>

                      <Text className="text-white text-lg">
                        🚀
                      </Text>

                    </View>
                  )}

                </Pressable>

              </Animated.View>

            </Animated.View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}