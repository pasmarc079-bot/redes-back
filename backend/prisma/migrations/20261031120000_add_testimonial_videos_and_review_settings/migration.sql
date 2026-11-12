-- CreateTable
CREATE TABLE "testimonial_videos" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "source_type" VARCHAR(20) NOT NULL,
    "video_url" TEXT NOT NULL,
    "poster_url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonial_videos_pkey" PRIMARY KEY ("id")
);

-- Settings required by the admin "Enlaces Externos y Contacto" form.
-- Inserted here so PUT /site/settings (which updates by key) never fails in production.
-- Reviews are read from the Google Business Profile API at runtime, so no reviews table is needed.
INSERT INTO "site_settings" ("id", "key", "value", "label", "group", "type", "updated_at")
VALUES
  ('site-setting-google-review-url', 'google_review_url', 'https://g.page/r/CX17kcn76YnmEBM/review', 'Enlace para dejar reseña en Google', 'contact', 'url', CURRENT_TIMESTAMP),
  ('site-setting-google-business-name', 'google_business_name', 'Ministerio REDES', 'Nombre del negocio en Google (para el mapa)', 'contact', 'text', CURRENT_TIMESTAMP),
  ('site-setting-hero-slides', 'hero_slides', '', 'Diapositivas de la portada (JSON)', 'general', 'json', CURRENT_TIMESTAMP),
  ('site-setting-hero-slides-interval', 'hero_slides_interval', '6', 'Segundos entre mensajes de la portada', 'general', 'number', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
