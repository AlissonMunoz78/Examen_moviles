# 🔥 FIX RÁPIDO: "FAILED TO download remote update"

## El Problema
```
❌ APK se abre
❌ Dice: "Uncaught error: Java.io.IOException: FAILED TO download remote update"
```

**Causa:** El APK estaba intentando descargar código JavaScript desde los servidores de Expo y falló.

---

## La Solución (2 cambios)

### 1️⃣ app.json — Deshabilitar actualizaciones

```json
"updates": {
  "enabled": false,
  "fallbackToCacheTimeout": 0,
  "checkAutomatically": "OFF"
}
```

### 2️⃣ eas.json — Configurar build sin remote updates

```json
"updates": {
  "enabled": false
}
```

✅ **YA HECHO** — Los cambios están aplicados

---

## 🚀 Regenerar APK (AHORA)

### Opción A: Script automatizado (RECOMENDADO)

```powershell
cd c:\Users\David\Desktop\AA\Examen_moviles
.\rebuild-apk.ps1 -Clean
```

### Opción B: Manual

```powershell
cd c:\Users\David\Desktop\AA\Examen_moviles

# Limpiar
rm -r node_modules
rm package-lock.json

# Instalar
npm install

# Build
eas build -p android --profile preview
```

---

## 📱 Instalar APK

```powershell
# Descargar desde https://expo.dev/builds
# Luego instalar:
adb install -r ./app.apk
```

✅ Ahora debería abrirse **sin error "FAILED TO download"**

---

## 🧪 Verificar que funciona

```powershell
adb logcat | findstr "FAILED"
# Si NO sale nada → ✅ Funcionó el fix

adb logcat | findstr "GastroMap"
# Si ves logs de la app → ✅ App arrancó correctamente
```

---

## 📊 Archivos Modificados

```
✅ app.json        — Agregado sección "updates": { "enabled": false }
✅ eas.json        — Agregado "updates": { "enabled": false } en preview
✨ rebuild-apk.ps1 — Nuevo script para rebuilds fáciles
ℹ️  FIX_DOWNLOAD_ERROR.md — Documentación detallada
```

---

**¿Listo?** Ejecuta:

```powershell
.\rebuild-apk.ps1 -Clean
```

Si sigue fallando, corre:
```powershell
adb logcat > logs.txt
```
Y comparte el contenido de `logs.txt`.
