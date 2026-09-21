INSERT INTO "site_settings" ("id", "key", "value", "label", "group", "type", "updated_at")
VALUES
  ('site-setting-hero-cover-mobile', 'hero_image_mobile_url', '', 'Imagen de portada para dispositivos móviles', 'pages', 'image', CURRENT_TIMESTAMP),
  ('site-setting-about-cover-mobile', 'about_cover_image_mobile_url', '', 'Imagen de Nosotros para dispositivos móviles', 'pages', 'image', CURRENT_TIMESTAMP),
  ('site-setting-events-cover-mobile', 'events_cover_image_mobile_url', '', 'Imagen de Eventos para dispositivos móviles', 'pages', 'image', CURRENT_TIMESTAMP),
  ('site-setting-blog-cover-mobile', 'blog_cover_image_mobile_url', '', 'Imagen de Blog para dispositivos móviles', 'pages', 'image', CURRENT_TIMESTAMP),
  ('site-setting-community-cover-mobile', 'community_cover_image_mobile_url', '', 'Imagen de Comunidad para dispositivos móviles', 'pages', 'image', CURRENT_TIMESTAMP),
  ('site-setting-contact-cover-mobile', 'contact_cover_image_mobile_url', '', 'Imagen de Contacto para dispositivos móviles', 'pages', 'image', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
