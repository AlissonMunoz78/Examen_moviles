-- ============================================================
-- GastroMap — Script SQL para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- TABLA: dishes
-- Almacena los platos registrados por cada usuario.
-- Aunque la app usa AsyncStorage como persistencia principal,
-- esta tabla puede usarse como respaldo en Supabase.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.dishes (
  id           TEXT PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  photo_uri    TEXT,              -- URL pública de Supabase Storage
  city         TEXT,              -- Ciudad obtenida por geocodificación inversa
  country      TEXT,              -- País obtenido por geocodificación inversa
  latitude     DOUBLE PRECISION,  -- Coordenada GPS al momento del registro
  longitude    DOUBLE PRECISION,  -- Coordenada GPS al momento del registro
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas por usuario (optimización de queries)
CREATE INDEX IF NOT EXISTS idx_dishes_user_id ON public.dishes(user_id);

-- ============================================================
-- RLS (Row Level Security)
-- Cada usuario solo puede ver y modificar sus propios platos.
-- IMPORTANTE: Habilitar RLS para seguridad multi-usuario.
-- ============================================================
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- Política: SELECT — solo ver tus propios platos
CREATE POLICY "Usuarios pueden ver sus propios platos"
  ON public.dishes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: INSERT — solo crear platos propios
CREATE POLICY "Usuarios pueden crear sus propios platos"
  ON public.dishes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: DELETE — solo eliminar tus propios platos
CREATE POLICY "Usuarios pueden eliminar sus propios platos"
  ON public.dishes
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- NOTA SOBRE EL BUCKET DE STORAGE
-- Configurar manualmente en Supabase Dashboard:
-- Storage > New Bucket > Nombre: "dish-photos" > Public: ON
-- Ver README.md para instrucciones paso a paso.
-- ============================================================
