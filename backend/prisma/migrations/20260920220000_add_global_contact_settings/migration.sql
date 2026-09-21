INSERT INTO "site_settings" ("id", "key", "value", "label", "group", "type", "updated_at")
VALUES
  ('site-setting-home-social-enabled', 'home_social_enabled', 'true', 'Mostrar sección Nuestras Redes en Inicio', 'general', 'boolean', CURRENT_TIMESTAMP),
  ('site-setting-google-maps-url', 'google_maps_url', '', 'Enlace de Google Maps', 'contact', 'url', CURRENT_TIMESTAMP),
  ('site-setting-donation-url', 'donation_url', '', 'Enlace de donaciones', 'contact', 'url', CURRENT_TIMESTAMP),
  ('site-setting-external-form-url', 'external_form_url', '', 'Enlace de formulario externo', 'contact', 'url', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
