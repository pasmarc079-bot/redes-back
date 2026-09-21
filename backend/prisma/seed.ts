import { PrismaClient, UserRole, EventStatus, PostStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.postTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userRoleEnum.deleteMany();
  await prisma.user.deleteMany();
  await prisma.media.deleteMany();
  await prisma.socialConfig.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.pageContent.deleteMany();
  await prisma.serviceSchedule.deleteMany();

  const hashedPassword = await bcrypt.hash('Excelencia079', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'pasmarc079',
      email: 'pasmarc079@ministerioredes.org',
      passwordHash: hashedPassword,
      firstName: 'Marco',
      lastName: 'Cárdenas',
      roles: {
        create: [{ role: UserRole.ADMIN }],
      },
    },
  });
  console.log('✅ Admin user created');

  const editorPassword = await bcrypt.hash('editor123', 10);
  const editor = await prisma.user.create({
    data: {
      username: 'editor',
      email: 'editor@ministerioredes.com',
      passwordHash: editorPassword,
      firstName: 'Editor',
      lastName: 'REDES',
      roles: {
        create: [{ role: UserRole.EDITOR }],
      },
    },
  });
  console.log('✅ Editor user created');

  await prisma.event.create({
    data: {
      title: 'Exaltando al Padre 2026',
      slug: 'exaltando-al-padre-2026',
      shortDescription: 'Noche de adoración que transforma',
      description: 'Una noche especial dedicada a la adoración y alabanza. Ven y experimenta el poder de Dios en su presencia.',
      startDate: new Date('2026-08-15T19:00:00'),
      endDate: new Date('2026-08-15T22:00:00'),
      location: 'Copotaxi',
      address: '20 de Junio y Cotopaxi, Lago Agrio, Ecuador',
      flyerUrl: '/assets/events/exaltando.png',
      status: EventStatus.UPCOMING,
      isFeatured: true,
      capacity: 500,
      createdById: admin.id,
    },
  });

  await prisma.event.create({
    data: {
      title: 'Un Legado de Amor para la Familia',
      slug: 'un-legado-de-amor-para-la-familia',
      shortDescription: 'Evento especial para familias',
      description: 'Fortalece los lazos familiares bajo la guía de Dios. Actividades para toda la familia.',
      startDate: new Date('2026-09-20T10:00:00'),
      endDate: new Date('2026-09-20T16:00:00'),
      location: 'Templo Principal',
      address: '20 de Junio y Cotopaxi, Lago Agrio, Ecuador',
      flyerUrl: '/assets/events/bautizos.png',
      status: EventStatus.UPCOMING,
      isFeatured: true,
      capacity: 300,
      createdById: admin.id,
    },
  });
  console.log('✅ Events created');

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Adoración', slug: 'adoracion', color: '#C9A84C' } }),
    prisma.tag.create({ data: { name: 'Familia', slug: 'familia', color: '#4A7C59' } }),
    prisma.tag.create({ data: { name: 'Reflexión', slug: 'reflexion', color: '#B8860B' } }),
    prisma.tag.create({ data: { name: 'Eventos', slug: 'eventos', color: '#6B2FA0' } }),
  ]);
  console.log('✅ Tags created');

  const post1 = await prisma.blogPost.create({
    data: {
      title: 'El poder de la adoración en comunidad',
      slug: 'el-poder-de-la-adoracion-en-comunidad',
      excerpt: 'Cuando nos reunimos para adorar juntos, algo sobrenatural sucede...',
      content: '<p>Cuando nos reunimos para adorar juntos, algo sobrenatural sucede. La presencia de Dios se manifiesta de una manera especial...</p>',
      authorId: editor.id,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2026-07-01'),
      readTime: 5,
      seoTitle: 'El Poder de la Adoración en Comunidad | Ministerio REDES',
      seoDescription: 'Descubre cómo la adoración en comunidad transforma vidas y familias en Lago Agrio.',
      coverImageUrl: '/assets/blog/adoracion.jpg',
    },
  });

  await prisma.blogPost.create({
    data: {
      title: 'Bautismos: Una decisión que marca un antes y un después',
      slug: 'bautismos-decision-que-marca',
      excerpt: 'El bautismo no es solo un acto simbólico, es una declaración pública de fe.',
      content: '<p>El bautismo no es solo un acto simbólico, es una declaración pública de fe...</p>',
      authorId: editor.id,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2026-04-12'),
      readTime: 7,
      coverImageUrl: '/assets/blog/bautismos.jpg',
    },
  });

  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: tags[0].id },
      { postId: post1.id, tagId: tags[2].id },
    ],
  });
  console.log('✅ Blog posts created');

  await prisma.socialConfig.createMany({
    data: [
      { platform: 'facebook', accountUrl: 'https://www.facebook.com/MinisterioREDESlive', iconName: 'FiFacebook', color: '#1877F2', order: 1, isActive: true },
      { platform: 'youtube', accountUrl: 'https://youtube.com/channel/UClpoz4Olk2soO3Cg2gUKWKA', iconName: 'FiYoutube', color: '#FF0000', order: 2, isActive: true },
      { platform: 'tiktok', accountUrl: 'https://www.tiktok.com/@ministerioredes', iconName: 'FiTiktok', color: '#000000', order: 3, isActive: true },
      { platform: 'instagram', accountUrl: 'https://www.instagram.com/ministerioredes', iconName: 'FiInstagram', color: '#E4405F', order: 4, isActive: true },
      { platform: 'whatsapp', accountUrl: 'https://wa.me/593994538859', iconName: 'FiPhone', color: '#25D366', order: 5, isActive: true },
    ],
  });
  console.log('✅ Social configs created');

  await prisma.siteSetting.createMany({
    data: [
      { key: 'site_name', value: 'Ministerio REDES', label: 'Nombre del sitio', group: 'general', type: 'text' },
      { key: 'site_tagline', value: 'Una gran red de avivamiento en las familias de nuestro país', label: 'Eslogan', group: 'general', type: 'text' },
      { key: 'site_description', value: 'Ver una gran red de avivamiento en las familias de nuestro país. Con un gran deseo de evangelizar.', label: 'Descripción corta', group: 'general', type: 'textarea' },
      { key: 'logo_url', value: '/logo.svg', label: 'Logo principal', group: 'branding', type: 'image' },
      { key: 'hero_image_url', value: '', label: 'Imagen de portada', group: 'general', type: 'image' },
      { key: 'hero_image_mobile_url', value: '', label: 'Imagen de portada para dispositivos móviles', group: 'pages', type: 'image' },
      { key: 'home_social_enabled', value: 'true', label: 'Mostrar sección Nuestras Redes en Inicio', group: 'general', type: 'boolean' },
      { key: 'about_cover_image_url', value: '', label: 'Imagen de portada de Nosotros', group: 'pages', type: 'image' },
      { key: 'about_cover_image_mobile_url', value: '', label: 'Imagen de Nosotros para dispositivos móviles', group: 'pages', type: 'image' },
      { key: 'events_cover_image_url', value: '', label: 'Imagen de portada de Eventos', group: 'pages', type: 'image' },
      { key: 'events_cover_image_mobile_url', value: '', label: 'Imagen de Eventos para dispositivos móviles', group: 'pages', type: 'image' },
      { key: 'blog_cover_image_url', value: '', label: 'Imagen de portada de Blog', group: 'pages', type: 'image' },
      { key: 'blog_cover_image_mobile_url', value: '', label: 'Imagen de Blog para dispositivos móviles', group: 'pages', type: 'image' },
      { key: 'community_cover_image_url', value: '', label: 'Imagen de portada de Comunidad', group: 'pages', type: 'image' },
      { key: 'community_cover_image_mobile_url', value: '', label: 'Imagen de Comunidad para dispositivos móviles', group: 'pages', type: 'image' },
      { key: 'contact_cover_image_url', value: '', label: 'Imagen de portada de Contacto', group: 'pages', type: 'image' },
      { key: 'contact_cover_image_mobile_url', value: '', label: 'Imagen de Contacto para dispositivos móviles', group: 'pages', type: 'image' },
      { key: 'favicon_url', value: '/favicon.ico', label: 'Favicon', group: 'branding', type: 'image' },
      { key: 'address', value: '20 de Junio y Cotopaxi, Lago Agrio, Ecuador', label: 'Dirección', group: 'contact', type: 'text' },
      { key: 'city', value: 'Lago Agrio', label: 'Ciudad', group: 'contact', type: 'text' },
      { key: 'sector', value: 'Centro', label: 'Sector', group: 'contact', type: 'text' },
      { key: 'phone', value: '099 453 8859', label: 'Teléfono', group: 'contact', type: 'text' },
      { key: 'phone_international', value: '+593994538859', label: 'Teléfono (formato internacional)', group: 'contact', type: 'text' },
      { key: 'email', value: 'ministeriocristianoredes@gmail.com', label: 'Correo electrónico', group: 'contact', type: 'text' },
      { key: 'whatsapp_number', value: '593994538859', label: 'WhatsApp (solo números)', group: 'contact', type: 'text' },
      { key: 'whatsapp_message', value: 'Hola! Quisiera información sobre el Ministerio REDES.', label: 'Mensaje predeterminado WhatsApp', group: 'contact', type: 'textarea' },
      { key: 'google_maps_url', value: 'https://maps.app.goo.gl/AGmymeUDmonY2a6c7', label: 'Enlace de Google Maps', group: 'contact', type: 'url' },
      { key: 'donation_url', value: '', label: 'Enlace de donaciones', group: 'contact', type: 'url' },
      { key: 'external_form_url', value: '', label: 'Enlace de formulario externo', group: 'contact', type: 'url' },
      { key: 'mission', value: 'Ver una gran red de avivamiento en las familias de nuestro país. Con un gran deseo de evangelizar.', label: 'Misión', group: 'about', type: 'textarea' },
      { key: 'vision', value: 'Ser una comunidad de fe que transforma vidas, fortalece familias y lleva esperanza a cada rincón de Lago Agrio y más allá.', label: 'Visión', group: 'about', type: 'textarea' },
      { key: 'purpose', value: 'Llevar el evangelio de Jesucristo a cada familia, formando discípulos que transformen su entorno.', label: 'Propósito', group: 'about', type: 'textarea' },
      { key: 'church_history', value: 'El Ministerio REDES nació con la visión de ser una gran red de avivamiento en las familias del Ecuador. Desde sus inicios en Lago Agrio, ha crecido como una comunidad de fe comprometida con la evangelización, la formación de discípulos y el servicio a la comunidad.', label: 'Reseña histórica', group: 'about', type: 'textarea' },
      { key: 'pastor_name', value: 'Marco Cárdenas', label: 'Nombre del pastor principal', group: 'pastor', type: 'text' },
      { key: 'pastor_photo_url', value: '', label: 'Foto del pastor', group: 'pastor', type: 'image' },
      { key: 'pastor_bio', value: 'El Pastor Marco Cárdenas ha sido un instrumento de Dios en el Ministerio REDES. Con años de servicio y dedicación a la obra, ha liderado la congregación con pasión por la evangelización y el discipulado.', label: 'Biografía del pastor', group: 'pastor', type: 'textarea' },
      { key: 'copyright', value: 'Ministerio REDES. Todos los derechos reservados.', label: 'Texto de copyright', group: 'general', type: 'text' },
    ],
  });
  console.log('✅ Site settings created');

  await prisma.menuItem.createMany({
    data: [
      { label: 'Inicio', url: '/', order: 1, location: 'header', isActive: true },
      { label: 'Nosotros', url: '/nosotros', order: 2, location: 'header', isActive: true },
      { label: 'Eventos', url: '/eventos', order: 3, location: 'header', isActive: true },
      { label: 'Blog', url: '/blog', order: 4, location: 'header', isActive: true },
      { label: 'Comunidad', url: '/comunidad', order: 5, location: 'header', isActive: true },
      { label: 'Contacto', url: '/contacto', order: 6, location: 'header', isActive: true },
      { label: 'Inicio', url: '/', order: 1, location: 'footer', isActive: true },
      { label: 'Nosotros', url: '/nosotros', order: 2, location: 'footer', isActive: true },
      { label: 'Eventos', url: '/eventos', order: 3, location: 'footer', isActive: true },
      { label: 'Blog', url: '/blog', order: 4, location: 'footer', isActive: true },
      { label: 'Comunidad', url: '/comunidad', order: 5, location: 'footer', isActive: true },
      { label: 'Contacto', url: '/contacto', order: 6, location: 'footer', isActive: true },
    ],
  });
  console.log('✅ Menu items created');

  await prisma.pageContent.createMany({
    data: [
      { key: 'hero_subtitle', title: 'Subtítulo del Hero', body: 'Ministerio Cristiano', section: 'hero', order: 1 },
      { key: 'hero_title', title: 'Título del Hero', body: 'REDES', section: 'hero', order: 2 },
      { key: 'hero_tagline', title: 'Tagline del Hero', body: 'Una gran red de avivamiento en las familias de nuestro país', section: 'hero', order: 3 },
      { key: 'hero_location', title: 'Ubicación del Hero', body: 'Lago Agrio, Ecuador', section: 'hero', order: 4 },
      { key: 'about_intro', title: 'Introducción - Nosotros', body: 'Somos una comunidad de fe comprometida con la transformación de vidas y familias a través del evangelio de Jesucristo.', section: 'about', order: 1 },
      { key: 'pastor_section', title: 'Nuestro Pastor', body: 'El Pastor Marco Cárdenas ha dedicado su vida al servicio de Dios y a la edificación de su iglesia.', section: 'about', order: 2 },
      { key: 'about_eyebrow', title: 'Texto superior de Nosotros', body: 'Quiénes Somos', section: 'about', order: 3 },
      { key: 'about_page_title', title: 'Título de la página Nosotros', body: 'Nosotros', section: 'about', order: 4 },
      { key: 'about_history_heading', title: 'Título de historia', body: 'Nuestra Historia', section: 'about', order: 5 },
      { key: 'about_mission_heading', title: 'Título de misión', body: 'Nuestra Misión', section: 'about', order: 6 },
      { key: 'about_vision_heading', title: 'Título de visión', body: 'Nuestra Visión', section: 'about', order: 7 },
      { key: 'about_purpose_heading', title: 'Título de propósito', body: 'Nuestro Propósito', section: 'about', order: 8 },
      { key: 'about_services_heading', title: 'Título de servicios', body: 'Nuestros Servicios', section: 'about', order: 9 },
      { key: 'about_visit_heading', title: 'Título de contacto', body: 'Visítanos', section: 'about', order: 10 },
      { key: 'about_address_label', title: 'Etiqueta de dirección', body: 'Dirección:', section: 'about', order: 11 },
      { key: 'about_phone_label', title: 'Etiqueta de teléfono', body: 'Teléfono:', section: 'about', order: 12 },
      { key: 'about_email_label', title: 'Etiqueta de correo', body: 'Email:', section: 'about', order: 13 },
      { key: 'about_map_placeholder', title: 'Texto del mapa', body: 'Mapa interactivo', section: 'about', order: 14 },
      { key: 'events_page_title', title: 'Título de eventos', body: 'Eventos', section: 'events', order: 1 },
      { key: 'events_page_description', title: 'Descripción de eventos', body: 'Únete a nosotros', section: 'events', order: 2 },
      { key: 'blog_page_title', title: 'Título del blog', body: 'Blog', section: 'blog', order: 1 },
      { key: 'blog_page_description', title: 'Descripción del blog', body: 'Reflexiones y Noticias', section: 'blog', order: 2 },
      { key: 'community_page_title', title: 'Título de comunidad', body: 'Únete a Nosotros', section: 'community', order: 1 },
      { key: 'community_page_description', title: 'Descripción de comunidad', body: 'Conéctate con nosotros en nuestras redes sociales y sé parte del avivamiento.', section: 'community', order: 2 },
      { key: 'contact_welcome', title: 'Mensaje de bienvenida de contacto', body: 'Conecta con nosotros', section: 'contact', order: 20 },
    ],
  });
  console.log('✅ Page content created');

  await prisma.serviceSchedule.createMany({
    data: [
      { name: 'Servicio Dominical', dayOfWeek: 'Domingo', time: '9:00 AM', description: 'Servicio principal de adoración y predicación', order: 1, isActive: true },
      { name: 'Servicio de Viernes', dayOfWeek: 'Viernes', time: '7:00 PM', description: 'Noche de oración y estudio bíblico', order: 2, isActive: true },
      { name: 'Jóvenes', dayOfWeek: 'Sábado', time: '6:00 PM', description: 'Reunión de jóvenes y adolescentes', order: 3, isActive: true },
    ],
  });
  console.log('✅ Service schedules created');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
