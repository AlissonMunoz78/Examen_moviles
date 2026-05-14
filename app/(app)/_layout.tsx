// app/(app)/_layout.tsx
// Layout principal con tabs
// Taller 7: Agregada pantalla dish-detail oculta del tab bar

import { Tabs } from "expo-router";
import { Text, View } from "react-native";

/**
 * Ícono de tab estilo Domino's
 */
function TabIcon({
  emoji,
  focused,
}: {
  emoji: string;
  focused: boolean;
}) {
  return (
    <View
      className={`items-center justify-center w-10 h-10 rounded-full ${
        focused ? "bg-dominos-red" : "bg-transparent"
      }`}
    >
      <Text className="text-xl">{emoji}</Text>
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#1A1A2E",
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
        },

        tabBarActiveTintColor: "#E31837",

        tabBarInactiveTintColor: "#9CA3AF",

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      {/* Pantalla Home */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Mis Platos",

          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🗺️" focused={focused} />
          ),
        }}
      />

      {/* Pantalla Agregar */}
      <Tabs.Screen
        name="add-dish"
        options={{
          title: "Agregar",

          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="➕" focused={focused} />
          ),
        }}
      />

      {/* Taller 7: Pantalla detalle del mapa */}
      <Tabs.Screen
        name="dish-detail"
        options={{
          href: null,
          title: "Detalle",
        }}
      />
      <Tabs.Screen
  name="select-location"
  options={{
    href: null,
    title: "Seleccionar ubicación",
  }}
/>
    </Tabs>
  );
}