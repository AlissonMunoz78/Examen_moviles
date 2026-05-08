// app/(auth)/_layout.tsx
// Layout del grupo de autenticación (Login y Registro)
// Rutas no protegidas — accesibles sin sesión activa

import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
