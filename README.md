# GastroMap 🗺️🍕

Aplicación móvil desarrollada con **React Native + Expo** para registrar platos de comida con foto y ubicación GPS.

> **Alumna:** Alisson Muñoz  
> **Materia:** Desarrollo de Aplicaciones Móviles  
> **Examen Práctico I**

---

## 🎨 Paleta de Colores

La interfaz sigue la paleta oficial de **Domino's Pizza**:

| Color | Hex | Uso |
|-------|-----|-----|
| Rojo principal | `#E31837` | Botones, header, acentos |
| Rojo oscuro | `#B01229` | Hover/pressed |
| Azul Domino's | `#006491` | Botón de registro, links |
| Fondo crema | `#FFF8F0` | Fondo general de pantallas |
| Dark | `#1A1A2E` | Tab bar |

---

## ⚙️ Configuración inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar el archivo `.env`

El archivo `.env` ya está creado en la raíz. Contiene:

```
EXPO_PUBLIC_SUPABASE_URL=https://lqyccehghqunsoccbmvq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hKbtHz1RboiRrKSVNiTZ9w_EiHv_p2P
```

> ⚠️ El `.env` está en `.gitignore` — **NUNCA** lo subas al repositorio (penalización -10 pts).

---

## 🗄️ Configuración de Supabase

### Paso 1 — Ejecutar el SQL de tablas

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Abre **SQL Editor** (menú lateral)
3. Crea un nuevo query
4. Copia y pega el contenido de `supabase/schema.sql`
5. Presiona **Run**

Esto crea la tabla `dishes` con Row Level Security activado.

### Paso 2 — Crear el bucket `dish-photos`

Sigue estos pasos exactos en el Dashboard de Supabase:

1. En el menú lateral, selecciona **Storage**
2. Haz clic en **New bucket**
3. En el campo **Name** escribe: `dish-photos` (exactamente así, con guión)
4. Activa el toggle **Public bucket** → ON
5. Haz clic en **Save**

### Paso 3 — Configurar política de Storage

Una vez creado el bucket:

1. Haz clic en el bucket `dish-photos`
2. Ve a la pestaña **Policies**
3. Haz clic en **New policy** → **For full customization**
4. Crea esta política:

```sql
-- Política: usuarios autenticados pueden subir sus propias fotos
CREATE POLICY "Usuarios pueden subir sus fotos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'dish-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: acceso público para ver fotos
CREATE POLICY "Fotos son públicas"
ON storage.objects
FOR SELECT
USING (bucket_id = 'dish-photos');
```

### Paso 4 — Configurar autenticación

1. Ve a **Authentication** → **Providers**
2. Asegúrate de que **Email** esté habilitado
3. Opcionalmente desactiva "Confirm email" para desarrollo rápido:
   - Ve a **Authentication** → **Settings**
   - Desactiva **Enable email confirmations**

---

## 📱 Generar el APK con EAS Build

### Pre-requisitos

- Tener cuenta en [expo.dev](https://expo.dev)
- Node.js instalado
- EAS CLI instalado

### Paso 1 — Instalar EAS CLI

```bash
npm install -g eas-cli
```

### Paso 2 — Login en tu cuenta Expo

```bash
eas login
```

### Paso 3 — Vincular el proyecto

```bash
eas init
```

(Selecciona tu cuenta y crea o vincula el proyecto)

### Paso 4 — Generar el APK

```bash
# Genera un APK instalable directamente (perfil "preview")
eas build -p android --profile preview
```

- El build tarda aproximadamente **10-15 minutos** en los servidores de EAS
- Al terminar recibirás un enlace para descargar el `.apk`
- Descarga e instala el APK en tu dispositivo Android

> **Nota:** Habilita "Instalar apps de fuentes desconocidas" en Android para instalar el APK.

---

## 🏃 Ejecutar en desarrollo

```bash
# Con Expo Go (para desarrollo)
npx expo start

# Directo en Android (con emulador o dispositivo)
npx expo start --android
```

---

## 🏗️ Arquitectura del proyecto

```
gastromap/
├── app/
│   ├── _layout.tsx          # Layout raíz: TanStack Query + Auth + NavigationGuard
│   ├── (auth)/
│   │   ├── _layout.tsx      # Layout de autenticación
│   │   ├── login.tsx        # Pantalla de Login (Req. 1)
│   │   └── register.tsx     # Pantalla de Registro (Req. 1)
│   └── (app)/
│       ├── _layout.tsx      # Tab Navigator
│       ├── home.tsx         # Lista de platos (Req. 2, 4)
│       └── add-dish.tsx     # Agregar plato (Req. 3, 4)
├── components/
│   └── DishCard.tsx         # Card con swipe + animaciones (Req. 4)
├── context/
│   └── AuthContext.tsx      # Contexto de autenticación Supabase
├── hooks/
│   └── useDishes.ts         # TanStack Query hooks (Adicional +10pts)
├── lib/
│   ├── supabase.ts          # Cliente Supabase configurado
│   ├── queryClient.ts       # TanStack Query client
│   ├── storage.ts           # AsyncStorage por namespace de usuario
│   └── uploadPhoto.ts       # Subida a Supabase Storage
├── types/
│   └── index.ts             # Tipo Dish (requerido por examen)
├── supabase/
│   └── schema.sql           # SQL para crear tablas en Supabase
├── .env                     # Credenciales (en .gitignore)
├── .gitignore               # Excluye .env del repositorio
├── eas.json                 # Configuración EAS Build
├── tailwind.config.js       # Paleta Domino's en NativeWind
├── babel.config.js          # Babel con NativeWind + Reanimated
└── metro.config.js          # Metro con NativeWind v4
```

---

## ✅ Requisitos cumplidos

### Requerimiento 1 — Autenticación Supabase (35 pts)
- ✅ Login con email y contraseña
- ✅ Registro con email, contraseña y confirmación
- ✅ Validación de que las contraseñas coinciden (zod + react-hook-form)
- ✅ Redirección automática al Home al iniciar sesión (NavigationGuard)
- ✅ Redirección automática al Login al cerrar sesión

### Requerimiento 2 — Gestión de platos (35 pts)
- ✅ Tipo `Dish` con todos los campos requeridos
- ✅ Platos se cargan al abrir Home (TanStack Query + AsyncStorage)
- ✅ Nuevos platos aparecen al inicio de la lista
- ✅ Platos guardados en AsyncStorage con namespace `dishes:<user_id>`
- ✅ Platos persisten al cerrar y reabrir la app
- ✅ Formulario se limpia después de registrar (react-hook-form `reset()`)
- ✅ Controles con react-hook-form + zod

### Requerimiento 3 — Registro de plato (en pts combinados)
- ✅ Cámara o galería para la foto (ImagePicker)
- ✅ GPS captura latitud, longitud, ciudad y país al presionar "Registrar"
- ✅ Ningún campo vacío permitido (validación con zod)

### Requerimiento 4 — Interfaz y animaciones (20 pts)
- ✅ Todos los estilos con NativeWind (sin StyleSheet)
- ✅ **Animación 1:** `FadeInDown` al agregar cards a la lista
- ✅ **Animación 2:** `FadeOutLeft` al eliminar con swipe
- ✅ **Animación 3:** `withSpring` en botón de registro + swipe con `useAnimatedStyle`
- ✅ Swipe implementado con `react-native-gesture-handler` + `useAnimatedGestureHandler`

### Adicional — TanStack Query (+10 pts)
- ✅ `useDishesQuery`: carga platos con caché y staleTime
- ✅ `useAddDishMutation`: agrega plato con invalidación de caché
- ✅ `useRemoveDishMutation`: elimina con **optimistic update** (UI actualiza antes de confirmar)
- ✅ `QueryClient` configurado con `gcTime`, `staleTime` y `retry`

### Adicional — Paleta Domino's (+5 pts)
- ✅ Colores personalizados en `tailwind.config.js`: `dominos-red`, `dominos-blue`, etc.
- ✅ Aplicados consistentemente en toda la UI

### Entrega
- ✅ Credenciales en `.env`
- ✅ `.env` en `.gitignore`
- ✅ `eas.json` configurado para APK
- ✅ Comentarios en código explicando cada requerimiento
