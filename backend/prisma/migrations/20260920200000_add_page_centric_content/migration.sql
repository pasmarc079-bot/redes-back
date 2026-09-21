INSERT INTO "site_settings" ("id", "key", "value", "label", "group", "type", "updated_at")
VALUES
  ('page-setting-hero-image', 'hero_image_url', '', 'Imagen de portada', 'general', 'image', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "page_contents" ("id", "key", "title", "body", "section", "order", "is_active", "created_at", "updated_at")
VALUES
  ('page-content-events-title', 'events_page_title', 'Título de eventos', 'Eventos', 'events', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('page-content-events-description', 'events_page_description', 'Descripción de eventos', 'Únete a nosotros', 'events', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('page-content-blog-title', 'blog_page_title', 'Título del blog', 'Blog', 'blog', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('page-content-blog-description', 'blog_page_description', 'Descripción del blog', 'Reflexiones y Noticias', 'blog', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('page-content-community-title', 'community_page_title', 'Título de comunidad', 'Únete a Nosotros', 'community', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('page-content-community-description', 'community_page_description', 'Descripción de comunidad', 'Conéctate con nosotros en nuestras redes sociales y sé parte del avivamiento.', 'community', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('page-content-contact-welcome', 'contact_welcome', 'Mensaje de bienvenida de contacto', 'Conecta con nosotros', 'contact', 20, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
