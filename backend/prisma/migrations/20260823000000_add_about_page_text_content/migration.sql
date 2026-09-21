-- Add editable labels and headings for the public Nosotros page.
INSERT INTO "page_contents" ("id", "key", "title", "body", "section", "order", "is_active", "created_at", "updated_at")
VALUES
  ('about-content-eyebrow', 'about_eyebrow', 'Texto superior de Nosotros', 'Quiénes Somos', 'about', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('about-content-page-title', 'about_page_title', 'Título de la página Nosotros', 'Nosotros', 'about', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('about-content-history-heading', 'about_history_heading', 'Título de historia', 'Nuestra Historia', 'about', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('about-content-mission-heading', 'about_mission_heading', 'Título de misión', 'Nuestra Misión', 'about', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('about-content-vision-heading', 'about_vision_heading', 'Título de visión', 'Nuestra Visión', 'about', 7, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('about-content-purpose-heading', 'about_purpose_heading', 'Título de propósito', 'Nuestro Propósito', 'about', 8, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('about-content-services-heading', 'about_services_heading', 'Título de servicios', 'Nuestros Servicios', 'about', 9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('about-content-visit-heading', 'about_visit_heading', 'Título de contacto', 'Visítanos', 'about', 10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('about-content-address-label', 'about_address_label', 'Etiqueta de dirección', 'Dirección:', 'about', 11, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('about-content-phone-label', 'about_phone_label', 'Etiqueta de teléfono', 'Teléfono:', 'about', 12, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('about-content-email-label', 'about_email_label', 'Etiqueta de correo', 'Email:', 'about', 13, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('about-content-map-placeholder', 'about_map_placeholder', 'Texto del mapa', 'Mapa interactivo', 'about', 14, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
