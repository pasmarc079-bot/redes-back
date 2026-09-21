INSERT INTO "site_settings" ("id", "key", "value", "label", "group", "type", "updated_at")
VALUES
  ('site-setting-about-cover', 'about_cover_image_url', '', 'Imagen de portada de Nosotros', 'pages', 'image', CURRENT_TIMESTAMP),
  ('site-setting-events-cover', 'events_cover_image_url', '', 'Imagen de portada de Eventos', 'pages', 'image', CURRENT_TIMESTAMP),
  ('site-setting-blog-cover', 'blog_cover_image_url', '', 'Imagen de portada de Blog', 'pages', 'image', CURRENT_TIMESTAMP),
  ('site-setting-community-cover', 'community_cover_image_url', '', 'Imagen de portada de Comunidad', 'pages', 'image', CURRENT_TIMESTAMP),
  ('site-setting-contact-cover', 'contact_cover_image_url', '', 'Imagen de portada de Contacto', 'pages', 'image', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
