// app/(app)/home.tsx
// Requerimiento 2: Lista de platos con TanStack Query + AsyncStorage
// Requerimiento 4: Animaciones de entrada (FadeInDown en DishCard)
// Requerimiento 1: Cerrar sesión desde esta pantalla

import { useRouter } from "expo-router";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import DishCard from "../../components/DishCard";
import { useAuth } from "../../context/AuthContext";
import { useDishesQuery, useRemoveDishMutation } from "../../hooks/useDishes";
import type { Dish } from "../../types";

/**
 * Pantalla principal — lista de platos del usuario.
 *
 * TanStack Query (Adicional +10pts):
 * - useDishesQuery: carga platos con caché automático
 * - useRemoveDishMutation: elimina con actualización optimista
 *
 * Requerimiento 2: Platos se cargan al abrir la pantalla.
 * Requerimiento 4: Cards con animación FadeInDown (implementada en DishCard).
 */
export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // TanStack Query: obtiene platos del usuario desde AsyncStorage
  const { data: dishes = [], isLoading, refetch } = useDishesQuery(user?.id ?? "");

  // TanStack Query: mutación para eliminar plato con optimistic update
  const removeMutation = useRemoveDishMutation(user?.id ?? "");

  /**
   * Elimina un plato tras confirmar con el usuario.
   * La animación de salida (FadeOutLeft) se maneja en DishCard.
   */
  const handleDelete = (dishId: string) => {
    Alert.alert(
      "Eliminar plato",
      "¿Estás seguro de que deseas eliminar este plato?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => removeMutation.mutate(dishId),
        },
      ]
    );
  };

  /**
   * Cierra sesión en Supabase.
   * Requerimiento 1: Limpia sesión y redirige automáticamente al Login
   * (via NavigationGuard en _layout.tsx).
   */
  const handleSignOut = async () => {
    Alert.alert("Cerrar sesión", "¿Deseas cerrar tu sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-dominos-cream">
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="bg-dominos-red px-5 pt-4 pb-6"
      >
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-white text-xs opacity-80 mb-1">
              Bienvenida 👋
            </Text>
            <Text
              className="text-white font-bold text-xl"
              numberOfLines={1}
            >
              {user?.email?.split("@")[0] ?? "Usuario"}
            </Text>
          </View>
          {/* Botón cerrar sesión */}
          <Pressable
            onPress={handleSignOut}
            className="bg-dominos-red-dark rounded-xl px-3 py-2 active:opacity-70"
          >
            <Text className="text-white text-xs font-semibold">Salir 🚪</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View className="flex-row mt-4 gap-3">
          <View className="flex-1 bg-dominos-red-dark rounded-xl p-3">
            <Text className="text-white text-2xl font-bold">
              {dishes.length}
            </Text>
            <Text className="text-white text-xs opacity-80">
              Platos registrados
            </Text>
          </View>
          <View className="flex-1 bg-dominos-red-dark rounded-xl p-3">
            <Text className="text-white text-2xl">🌎</Text>
            <Text className="text-white text-xs opacity-80">
              Tu mapa gastronómico
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Lista de platos */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-dominos-gray-mid text-base">
            Cargando tus platos...
          </Text>
        </View>
      ) : dishes.length === 0 ? (
        /* Estado vacío */
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          className="flex-1 items-center justify-center px-8"
        >
          <Text className="text-6xl mb-4">🍕</Text>
          <Text className="text-dominos-gray-dark font-bold text-xl text-center mb-2">
            ¡Aún no hay platos!
          </Text>
          <Text className="text-dominos-gray-mid text-center text-sm mb-6">
            Toca el botón "+" para registrar tu primer plato con foto y GPS.
          </Text>
          <Pressable
            onPress={() => router.push("/(app)/add-dish")}
            className="bg-dominos-red rounded-xl px-6 py-3 active:scale-95"
          >
            <Text className="text-white font-bold">Agregar primer plato</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <FlatList
          data={dishes}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            // Requerimiento 4: DishCard con animaciones FadeInDown y swipe FadeOutLeft
            <DishCard
              dish={item}
              onDelete={handleDelete}
              index={index}
            />
          )}
          contentContainerClassName="pt-4 pb-8"
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListHeaderComponent={
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              className="px-4 mb-3"
            >
              <Text className="text-dominos-gray-dark font-bold text-lg">
                Mis platos 🗺️
              </Text>
              <Text className="text-dominos-gray-mid text-xs mt-1">
                Desliza a la izquierda para eliminar
              </Text>
            </Animated.View>
          }
        />
      )}
    </SafeAreaView>
  );
}
