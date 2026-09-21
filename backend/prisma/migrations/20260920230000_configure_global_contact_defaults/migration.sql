UPDATE "site_settings"
SET "value" = CASE "key"
  WHEN 'phone' THEN '099 453 8859'
  WHEN 'phone_international' THEN '+593994538859'
  WHEN 'whatsapp_number' THEN '593994538859'
  WHEN 'email' THEN 'ministeriocristianoredes@gmail.com'
  WHEN 'address' THEN '20 de Junio y Cotopaxi, Lago Agrio, Ecuador'
  WHEN 'whatsapp_message' THEN 'Hola! Quisiera información sobre el Ministerio REDES.'
  WHEN 'google_maps_url' THEN 'https://maps.app.goo.gl/AGmymeUDmonY2a6c7'
  WHEN 'home_social_enabled' THEN 'true'
  ELSE "value"
END
WHERE "key" IN (
  'phone',
  'phone_international',
  'whatsapp_number',
  'email',
  'address',
  'whatsapp_message',
  'google_maps_url',
  'home_social_enabled'
);
