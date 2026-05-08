// lib/uploadPhoto.ts
// Requerimiento 3: Subida de fotos a Supabase Storage (bucket: dish-photos)
// Las fotos se almacenan organizadas por user_id para seguridad y organización

import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import { supabase } from "./supabase";

const BUCKET = "dish-photos"; // Nombre del bucket configurado en Supabase

/**
 * Sube una foto al bucket de Supabase Storage.
 * Retorna la URL pública de la imagen o null si falla.
 *
 * Proceso:
 * 1. Lee el archivo local como base64
 * 2. Lo convierte a ArrayBuffer
 * 3. Lo sube a Supabase Storage con ruta única por usuario
 * 4. Retorna la URL pública para guardar en el registro del plato
 */
export const uploadDishPhoto = async (
  userId: string,
  localUri: string
): Promise<string | null> => {
  try {
    // Leer el archivo local como base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convertir base64 a Uint8Array para Supabase
    const byteCharacters = atob(base64);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }

    // Generar nombre único para la foto usando crypto
    const uniqueId = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${userId}-${Date.now()}`
    );
    const fileName = `${userId}/${uniqueId.substring(0, 16)}.jpg`;

    // Subir al bucket dish-photos
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, byteArray, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      const isRlsError = error.message.toLowerCase().includes("row-level security");
      if (isRlsError) {
        console.warn("[Storage] Upload bloqueado por RLS en bucket dish-photos. Se usara foto local.");
      } else {
        console.warn("[Storage] No se pudo subir foto:", error.message);
      }
      return null;
    }

    // Obtener URL pública de la imagen
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  } catch (error) {
    console.warn("[Storage] Error inesperado al subir foto:", error);
    return null;
  }
};
