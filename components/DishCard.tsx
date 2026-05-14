// components/DishCard.tsx
// Requerimiento 4: Card con animaciones Reanimated + swipe para eliminar
// Taller 7: Agregado botón "Ver ubicación" con Leaflet + OpenStreetMap

import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import Animated, {
  FadeInDown,
  FadeOutLeft,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { PanGestureHandler } from "react-native-gesture-handler";

import type { Dish } from "../types";

interface DishCardProps {
  dish: Dish;
  onDelete: (id: string) => void;
  index: number;
}

const SWIPE_THRESHOLD = -120;

export default function DishCard({
  dish,
  onDelete,
  index,
}: DishCardProps) {
  const router = useRouter();

  // Valor compartido para swipe
  const translateX = useSharedValue(0);

  // Controla animación de salida
  const [deleting, setDeleting] = React.useState(false);

  // Eliminar plato
  const triggerDelete = () => {
    setDeleting(true);

    setTimeout(() => {
      onDelete(dish.id);
    }, 350);
  };

  // Gesto swipe
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: { startX: number }) => {
      ctx.startX = translateX.value;
    },

    onActive: (event, ctx) => {
      const newValue = ctx.startX + event.translationX;

      // Solo izquierda
      translateX.value = Math.min(0, newValue);
    },

    onEnd: () => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withTiming(-500, {
          duration: 300,
        });

        runOnJS(triggerDelete)();
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  // Estilo animado del card
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Opacidad fondo eliminar
  const deleteIndicatorOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / 80),
  }));

  // Verifica si el plato tiene coordenadas
  const tieneUbicacion =
    dish.latitude !== undefined &&
    dish.longitude !== undefined;

  // Navegar al mapa
  const handleVerUbicacion = () => {
    if (!tieneUbicacion) return;

    router.push({
      pathname: "/(app)/dish-detail",
      params: {
        latitude: dish.latitude!.toString(),
        longitude: dish.longitude!.toString(),
        name: dish.name,
      },
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400).springify()}
      exiting={deleting ? FadeOutLeft.duration(350) : undefined}
      className="mb-4 mx-4"
    >
      {/* Fondo rojo al hacer swipe */}
      <Animated.View
        style={deleteIndicatorOpacity}
        className="absolute inset-0 bg-dominos-red rounded-2xl items-center justify-center flex-row-reverse pr-6"
      >
        <Text className="text-white text-2xl">🗑️</Text>

        <Text className="text-white font-bold mr-2">
          Eliminar
        </Text>
      </Animated.View>

      {/* Swipe */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={animatedStyle}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Contenido principal */}
          <View className="flex-row">
            {/* Foto */}
            <View className="w-24 h-24 bg-dominos-gray">
              {dish.photo_uri ? (
                <Image
                  source={{ uri: dish.photo_uri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Text className="text-4xl">🍽️</Text>
                </View>
              )}
            </View>

            {/* Información */}
            <View className="flex-1 p-3 justify-between">
              <Text
                className="text-dominos-gray-dark font-bold text-base"
                numberOfLines={1}
              >
                {dish.name}
              </Text>

              {/* Ubicación */}
              <View className="flex-row items-center mt-1">
                <Text className="text-sm mr-1">📍</Text>

                <Text
                  className="text-dominos-gray-mid text-xs flex-1"
                  numberOfLines={1}
                >
                  {dish.city
                    ? `${dish.city}${
                        dish.country ? `, ${dish.country}` : ""
                      }`
                    : "Ubicación no disponible"}
                </Text>
              </View>

              {/* Coordenadas */}
              {tieneUbicacion && (
                <Text className="text-dominos-gray-mid text-xs mt-1">
                  {dish.latitude!.toFixed(4)}°,{" "}
                  {dish.longitude!.toFixed(4)}°
                </Text>
              )}

              {/* Fecha */}
              <Text className="text-dominos-gray-mid text-xs mt-1">
                {new Date(dish.created_at).toLocaleDateString(
                  "es-EC",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </Text>
            </View>

            {/* Indicador swipe */}
            <View className="justify-center pr-3">
              <Text className="text-dominos-gray-mid text-xl">
                ‹
              </Text>
            </View>
          </View>

          {/* Botón ver ubicación */}
          {tieneUbicacion && (
            <Pressable
              onPress={handleVerUbicacion}
              className="border-t border-dominos-gray py-3 items-center active:bg-dominos-gray"
            >
              <Text className="text-dominos-blue font-bold">
                🗺️ Ver ubicación
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
}