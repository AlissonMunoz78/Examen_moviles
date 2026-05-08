// app/(app)/_layout.tsx
// Layout del grupo protegido — solo accesible con sesión activa
// Contiene navegación por tabs: Home y Agregar Plato

import { Tabs } from "expo-router";
import { Text, View } from "react-native";

/** Ícono de tab con indicador de activo al estilo Domino's */
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
          backgroundColor: "#1A1A2E", // dominos-dark
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#E31837",   // dominos-red
        tabBarInactiveTintColor: "#9CA3AF", // dominos-gray-mid
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Mis Platos",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🗺️" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-dish"
        options={{
          title: "Agregar",
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="➕" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
