# 🔧 FIX: "FAILED TO download remote update" Error

## ¿Por qué ocurría el error?

```
Uncaught error: Java.io.IOException: FAILED TO download remote update
```

**Causa:** El APK estaba configurado para descargar código JavaScript actualizado desde los servidores de Expo, pero falló la conexión.

**Solución:** Deshabilitar las actualizaciones remotas (Expo Updates) para que el APK sea completamente independiente.

---

## ✅ Cambios Realizados

### 1. **app.json** — Deshabilitar actualizaciones remotas

```json
"updates": {
  "enabled": false,
  "fallbackToCacheTimeout": 0,
  "checkAutomatically": "OFF"
}
```

### 2. **eas.json** — Configurar builds sin dependencia remota

```json
"preview": {
  "android": {
    "buildType": "apk",
    "withoutCredentials": true
  },
  "updates": {
    "enabled": false
  }
}
```

---

## 🚀 Regenerar APK Correctamente

### Opción 1: Build en nube (EAS) — RECOMENDADO

```powershell
cd c:\Users\David\Desktop\AA\Examen_moviles

# Limpiar cache
rm -r node_modules
rm package-lock.json
npm install

# Generar APK nuevo
eas build -p android --profile preview
```

✅ El APK descargado de EAS Dashboard **YA no intentará descargar código remoto**

---

### Opción 2: Build local (más rápido)

```powershell
cd c:\Users\David\Desktop\AA\Examen_moviles

# Limpiar e instalar
npm install

# Build local
eas build -p android --profile preview --local
```

El APK estará en: `./dist/` o ruta que indique EAS

---

## 📱 Instalar y Testear APK

```powershell
# Instalar en dispositivo/emulador
adb install -r ./app.apk

# Ver logs (si se abre, verifica que no hay errores)
adb logcat | findstr "GastroMap|Supabase|Error"
```

✅ Espera a que se abra la app y veas:
- Pantalla de Login (no pantalla blanca)
- Icono con colores (no blanco)
- Sin cerrar de golpe
- Sin error "FAILED TO download"

---

## 🆘 Si aún falla

### Paso 1: Verificar que los cambios se guardaron

```powershell
# Verificar app.json
type app.json | findstr "updates"
# Debe mostrar: "enabled": false

# Verificar eas.json  
type eas.json | findstr "updates"
```

### Paso 2: Clean rebuild completo

```powershell
# Limpiar TODOS los caches
rm -r node_modules
rm -r .expo
rm package-lock.json

# Reinstalar todo
npm install

# Build sin cache
eas build -p android --profile preview --clean
```

### Paso 3: Ver logs detallados

```powershell
# Build local con logs verbosos
eas build -p android --profile preview --local --verbose 2>&1 | Tee build.log
```

Comparte `build.log` si hay errores específicos.

---

## 📋 Checklist

- [ ] Verificaste que `app.json` tiene `"updates": { "enabled": false }`
- [ ] Verificaste que `eas.json` tiene `"updates": { "enabled": false }` en preview
- [ ] Borraste `node_modules` e hiciste `npm install` limpio
- [ ] Regeneraste el APK con `eas build -p android --profile preview`
- [ ] Instalaste el APK nuevo con `adb install -r`
- [ ] La app se abre sin "FAILED TO download" error
- [ ] Se ve pantalla de Login
- [ ] Icono tiene colores

---

## ⚡ Resumen de lo arreglado

| Problema | Solución |
|----------|----------|
| APK intenta descargar código remoto | Deshabilitado en `app.json` (`"enabled": false`) |
| Error "FAILED TO download" | Removido sistema de Updates |
| APK depende de servidores Expo | Ahora es standalone/independiente |
| No funcionaba offline | Ahora funciona sin internet |

---

**Ahora el APK debería funcionar sin intentar descargar nada del servidor.**

Si después de esto aún ves el error, run:
```powershell
adb logcat > error_output.txt
```
Y comparte el contenido para debugging específico.
