// components/DishCard.tsx
// Requerimiento 4: Card con animaciones Reanimated + swipe para eliminar
// Animación 1: FadeInDown al entrar
// Animación 2: FadeOutLeft al eliminar (swipe)
// Animación 3: useAnimatedStyle con withSpring para el swipe interactivo

import React from "react";
import { Alert, Image, Text, View } from "react-native";
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

const SWIPE_THRESHOLD = -120; // Umbral de desplazamiento para disparar la eliminación

/**
 * DishCard: Componente para mostrar un plato registrado.
 *
 * Animaciones implementadas (Requerimiento 4):
 * 1. FadeInDown: El card entra desde abajo al agregarse a la lista
 * 2. FadeOutLeft: El card sale hacia la izquierda al ser eliminado con swipe
 * 3. useAnimatedStyle + withSpring: El card sigue el dedo al deslizar,
 *    con efecto de resorte al soltar sin completar el swipe
 */
export default function DishCard({ dish, onDelete, index }: DishCardProps) {
  // Valor compartido para la posición horizontal del swipe (Reanimated)
  const translateX = useSharedValue(0);
  // Controla si el card debe animarse con FadeOutLeft
  const [deleting, setDeleting] = React.useState(false);

  /**
   * Inicia el proceso de eliminación:
   * 1. Activa FadeOutLeft (Reanimated)
   * 2. Llama al callback onDelete después de la animación
   */
  const triggerDelete = () => {
    setDeleting(true);
    // Pequeño delay para que la animación de salida sea visible
    setTimeout(() => onDelete(dish.id), 350);
  };

  /**
   * Manejador de gesto de swipe horizontal (react-native-gesture-handler)
   * Requerimiento 4: Swipe implementado con useAnimatedGestureHandler
   */
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: { startX: number }) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      // Solo permite deslizar hacia la izquierda (valores negativos)
      const newValue = ctx.startX + event.translationX;
      translateX.value = Math.min(0, newValue);
    },
    onEnd: () => {
      if (translateX.value < SWIPE_THRESHOLD) {
        // Swipe suficiente: animar fuera de pantalla y eliminar
        translateX.value = withTiming(-500, { duration: 300 });
        runOnJS(triggerDelete)();
      } else {
        // Swipe insuficiente: volver a posición original con efecto resorte
        translateX.value = withSpring(0); // Animación 3: withSpring
      }
    },
  });

  /**
   * Estilo animado del card — se actualiza en el hilo de UI sin pasar por JS
   * Requerimiento 4: useAnimatedStyle
   */
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Indicador de swipe visible detrás del card (fondo rojo con ícono de basura)
  const deleteIndicatorOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / 80),
  }));

  return (
    // Requerimiento 4: FadeInDown al entrar, FadeOutLeft al salir
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400).springify()}
      exiting={deleting ? FadeOutLeft.duration(350) : undefined}
      className="mb-4 mx-4"
    >
      {/* Fondo rojo de eliminación (visible al hacer swipe) */}
      <Animated.View
        style={deleteIndicatorOpacity}
        className="absolute inset-0 bg-dominos-red rounded-2xl items-center justify-center flex-row-reverse pr-6"
      >
        <Text className="text-white text-2xl">🗑️</Text>
        <Text className="text-white font-bold mr-2">Eliminar</Text>
      </Animated.View>

      {/* Card con gesto de swipe */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View
          style={animatedStyle}
          className="bg-white rounded-2xl shadow-sm overflow-hidden flex-row"
        >
          {/* Foto del plato */}
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

          {/* Info del plato */}
          <View className="flex-1 p-3 justify-between">
            <Text
              className="text-dominos-gray-dark font-bold text-base"
              numberOfLines={1}
            >
              {dish.name}
            </Text>

            {/* Ubicación GPS */}
            <View className="flex-row items-center mt-1">
              <Text className="text-sm mr-1">📍</Text>
              <Text
                className="text-dominos-gray-mid text-xs flex-1"
                numberOfLines={1}
              >
                {dish.city
                  ? `${dish.city}${dish.country ? `, ${dish.country}` : ""}`
                  : "Ubicación no disponible"}
              </Text>
            </View>

            {/* Coordenadas */}
            {dish.latitude && dish.longitude && (
              <Text className="text-dominos-gray-mid text-xs mt-1">
                {dish.latitude.toFixed(4)}°, {dish.longitude.toFixed(4)}°
              </Text>
            )}

            {/* Fecha */}
            <Text className="text-dominos-gray-mid text-xs mt-1">
              {new Date(dish.created_at).toLocaleDateString("es-EC", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>

          {/* Indicador de swipe */}
          <View className="justify-center pr-3">
            <Text className="text-dominos-gray-mid text-xl">‹</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
}
