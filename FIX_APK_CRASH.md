# 🔧 FIX: APK se abre y se cierra (White Screen + Icon Blanco)

## ¿Cuál era el problema?

El crash ocurría por **errores no capturados** en la inicialización de la app:

1. ❌ **AuthContext sin manejo de errores** → Crash silencioso en `supabase.auth.getSession()`
2. ❌ **Sin ErrorBoundary** → Errores React no capturados → White screen of death
3. ❌ **Credenciales de Supabase sin validación** → Posible fallo silencioso
4. ❌ **Sin logs de error en producción** → Imposible debuggear

---

## ✅ Lo que se corrigió

### 1. **AuthContext.tsx** — Manejo de errores robusto

```typescript
// ANTES: ❌ Sin try-catch, crash silencioso
supabase.auth.getSession().then(({ data: { session } }) => {
  setSession(session);
  // Si hay error, se crashea sin logs
});

// DESPUÉS: ✅ Con error handling
supabase.auth.getSession()
  .then(({ data: { session }, error }) => {
    if (error) console.error("[AuthContext]", error.message);
    setSession(session ?? null);
    setLoading(false);
  })
  .catch((err) => {
    console.error("[AuthContext] Error inesperado:", err);
    setLoading(false);
  });
```

### 2. **ErrorBoundary.tsx** — Nuevo componente

Captura **cualquier error React no manejado** y muestra un mensaje amigable:

```typescript
// En producción: "Algo salió mal — Reintentar"
// En desarrollo: Muestra el error real para debugging
```

### 3. **_layout.tsx** — Integración del ErrorBoundary

```typescript
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView>
        <QueryClientProvider>
          <AuthProvider>
            <NavigationGuard />
          </AuthProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
```

### 4. **supabase.ts** — Validación de variables de entorno

```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Supabase] Variables no configuradas");
}
```

---

## 🚀 Pasos para regenerar y testear la APK

### Paso 1: Limpiar y rebuild

```powershell
cd c:\Users\David\Desktop\AA\Examen_moviles

# Limpiar node_modules y cache
rm -r node_modules
rm package-lock.json
npm install

# Limpiar cache de Expo
rm -r .expo
```

### Paso 2: Testear en emulador primero

```powershell
# En desarrollo (más rápido, con hot reload)
npm start

# En Android emulator
npm run android
```

Asegúrate de que:
- ✅ Se carga sin crash
- ✅ Se ve pantalla de Login
- ✅ No hay pantalla blanca
- ✅ Icono de la app aparece con colores

### Paso 3: Rebuild APK

```powershell
# Regenerar APK en EAS
eas build -p android --profile preview

# O si quieres build local
eas build -p android --local
```

### Paso 4: Instalar y testear APK

```powershell
# Esperar a que termine el build

# Descargar APK de EAS Dashboard: https://expo.dev/builds
# o si usaste --local, estará en ./dist

# Instalar en dispositivo/emulador:
adb install -r ./path/to/app.apk
```

---

## 🧪 Cómo debuggear si sigue fallando

### Opción A: Logcat en Android Studio

```powershell
# Ver logs en tiempo real del dispositivo
adb logcat | findstr "error|Error|ERROR|GastroMap"
```

### Opción B: Build local con logs completos

```powershell
eas build -p android --local --verbose
```

### Opción C: Emulador + expo-dev-client

```powershell
# Instalar dev client para ver errores en tiempo real
eas build -p android --profile development

# Escanear QR en tu dispositivo
npm start
```

---

## 🔍 Qué revisar si AÚN falla

### 1. **Credenciales de Supabase**

```powershell
# Verificar que el .env se copió correctamente a la APK
# En Android logcat buscar:
# "[Supabase] Variables de entorno..."

# Si dice "✗", las variables NO se cargaron
```

**Solución:**
```powershell
# Asegurar que eas.json no ignora .env
# Debería estar en el build pero protegido
```

### 2. **Global.css no se carga**

```powershell
# Si ves estilos rotos, revisar:
cat global.css

# Debe tener:
# @tailwind base;
# @tailwind components;
# @tailwind utilities;
```

### 3. **NativeWind/Tailwind error**

```powershell
# Limpiar cache de Metro
rm -r ~/.expo/cache
npm start -- --reset-cache
```

---

## ✅ Checklist final

- [ ] AuthContext tiene try-catch en useEffect
- [ ] ErrorBoundary importado en _layout.tsx
- [ ] ErrorBoundary envuelve GestureHandlerRootView
- [ ] Supabase valida credenciales
- [ ] `npm run android` funciona sin crash en emulador
- [ ] APK se abre sin pantalla blanca
- [ ] Icono de la app tiene color (no blanco)
- [ ] Pantalla de Login se ve correctamente

---

## 📝 Notas técnicas

| Archivo | Cambio | Razón |
|---------|--------|-------|
| `AuthContext.tsx` | Agregar try-catch + isMounted flag | Evitar memory leaks y crashes |
| `ErrorBoundary.tsx` | Nuevo componente | Capturar errores React no manejados |
| `_layout.tsx` | Envolver con ErrorBoundary | Proteger toda la app |
| `supabase.ts` | Validar credenciales | Debug más fácil |

---

**Si aún falla después de estos pasos, envía los logs de `adb logcat` para debuggear más.**
