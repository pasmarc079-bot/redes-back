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
      flyerUrl: 'https://res.cloudinary.com/dqz0z0z0z/image/upload/v1721952000/exaltando.png',
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
      flyerUrl: 'https://res.cloudinary.com/dqz0z0z0z/image/upload/v1721952000/bautizos.png',
      status: EventStatus.UPCOMING,
      isFeatured: true,
      capacity: 300,
      createdById: admin.id,
    },
  });
  console.log('✅ Events created');

  const tags = [];
  for (const t of [
    { name: 'Adoración', slug: 'adoracion', color: '#C9A84C' },
    { name: 'Familia', slug: 'familia', color: '#4A7C59' },
    { name: 'Reflexión', slug: 'reflexion', color: '#B8860B' },
    { name: 'Eventos', slug: 'eventos', color: '#6B2FA0' },
  ]) {
    tags.push(await prisma.tag.create({ data: t }));
  }
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
      { platform: 'facebook', accountUrl: 'https://www.facebook.com/MinisterioREDESlive', isActive: true },
      { platform: 'tiktok', accountUrl: 'https://www.tiktok.com/@ministerioredes2', isActive: true },
      { platform: 'instagram', accountUrl: 'https://www.instagram.com/ministerioredes_', isActive: true },
    ],
  });
  console.log('✅ Social configs created');

  await prisma.siteSetting.createMany({
    data: [
      { key: 'site_name', value: 'Ministerio REDES', label: 'Nombre del sitio', group: 'general', type: 'text' },
      { key: 'site_tagline', value: 'Una gran red de avivamiento en las familias de nuestro país', label: 'Eslogan', group: 'general', type: 'text' },
      { key: 'site_description', value: 'Ver una gran red de avivamiento en las familias de nuestro país. Con un gran deseo de evangelizar.', label: 'Descripción corta', group: 'general', type: 'textarea' },
      { key: 'logo_url', value: '/logo.svg', label: 'Logo principal', group: 'branding', type: 'image' },
      { key: 'favicon_url', value: '/favicon.ico', label: 'Favicon', group: 'branding', type: 'image' },
      { key: 'address', value: '20 de Junio y Cotopaxi, Lago Agrio, Ecuador', label: 'Dirección', group: 'contact', type: 'text' },
      { key: 'city', value: 'Lago Agrio', label: 'Ciudad', group: 'contact', type: 'text' },
      { key: 'sector', value: 'Centro', label: 'Sector', group: 'contact', type: 'text' },
      { key: 'phone', value: '0990498260', label: 'Teléfono', group: 'contact', type: 'text' },
      { key: 'phone_international', value: '+593990498260', label: 'Teléfono (formato internacional)', group: 'contact', type: 'text' },
      { key: 'email', value: 'ministeriocristianoredes@gmail.com', label: 'Correo electrónico', group: 'contact', type: 'text' },
      { key: 'whatsapp_number', value: '593990498260', label: 'WhatsApp (solo números)', group: 'contact', type: 'text' },
      { key: 'whatsapp_message', value: 'Hola! Quisiera información sobre el Ministerio REDES.', label: 'Mensaje predeterminado WhatsApp', group: 'contact', type: 'textarea' },
      { key: 'mission', value: 'Formar, equipar y empoderar discípulos e influenciadores mediante un modelo de desarrollo integral (espiritual, emocional y físico), capacitándolos para liderar procesos de expansión del Reino de Dios y transformación social.', label: 'Misión', group: 'about', type: 'textarea' },
      { key: 'mission_foundation', value: 'Fundamento Estratégico: Capacitación ministerial y perfeccionamiento de competencias (Efesios 4:12).', label: 'Fundamento de la Misión', group: 'about', type: 'textarea' },
      { key: 'vision', value: 'Consolidar una red global de transformación familiar y comunitaria, impulsando un movimiento de avivamiento integral con impacto territorial y trascendencia generacional.', label: 'Visión', group: 'about', type: 'textarea' },
      { key: 'vision_foundation', value: 'Fundamento Estratégico: Despliegue de red y pesca apostólica (Mateo 4:19).', label: 'Fundamento de la Visión', group: 'about', type: 'textarea' },
      { key: 'purpose', value: 'Consolidarnos como un ministerio cristiano evangelístico global, rompiendo los esquemas de la fe tradicional pasiva para convertirnos en catalizadores de transformación comunitaria.', label: 'Propósito', group: 'about', type: 'textarea' },
      { key: 'church_history', value: 'Hace aproximadamente siete años, nuestra organización nació con un propósito claro y retador: romper los esquemas de la fe tradicional pasiva y convertirnos en un catalizador de transformación comunitaria. Surgimos no para ser una estructura institucional de "puertas adentro", sino para consolidarnos como un ministerio cristiano evangelístico global, caracterizado por el concepto dinámico de una iglesia sin muros.', label: 'Reseña histórica', group: 'about', type: 'textarea' },
      { key: 'pastor_name', value: 'Marco Cárdenas', label: 'Nombre del pastor principal', group: 'pastor', type: 'text' },
      { key: 'pastor_photo_url', value: '', label: 'Foto del pastor', group: 'pastor', type: 'image' },
      { key: 'pastor_bio', value: 'El Pastor Marco Cárdenas ha sido un instrumento de Dios en el Ministerio REDES. Con años de servicio y dedicación a la obra, ha liderado la congregación con pasión por la evangelización y el discipulado. Su formación y experiencia en el ministerio pastoral han sido fundamentales para el crecimiento espiritual de la iglesia y el fortalecimiento de las familias en Lago Agrio y sus alrededores.', label: 'Biografía del pastor', group: 'pastor', type: 'textarea' },
      { key: 'pillars_intro', value: 'Nuestra cultura organizacional se articula bajo tres dimensiones fundamentales:', label: 'Introducción a los pilares', group: 'about', type: 'textarea' },
      { key: 'pillar_a_title', value: 'A. Relacional y Unidad Organizacional', label: 'Pilar A - Título', group: 'about', type: 'text' },
      { key: 'pillar_a_body', value: 'Comunidad Interconectada (Trabajo en Equipo): Operamos bajo una arquitectura de red donde cada nodo es vital. Fomentamos el sentido de pertenencia y cohesión (Salmo 133:1).\nAfecto Colectivo y Empatía: La cultura relacional y el compañerismo representan el cimiento de nuestro clima organizacional.', label: 'Pilar A - Contenido', group: 'about', type: 'textarea' },
      { key: 'pillar_b_title', value: 'B. Excelencia Operativa y Cultura de Alto Rendimiento', label: 'Pilar B - Título', group: 'about', type: 'text' },
      { key: 'pillar_b_body', value: 'Cultura de Milla Doble (Proactividad e Innovación): Superamos los estándares básicos mediante un servicio de alto valor añadido (Mateo 5:41).\nExcelencia y Eficacia Operativa: Desarrollamos nuestros proyectos y procesos con rigor institucional, garantizando un impacto medible y sostenible (Colosenses 3:23).\nDisciplina Estratégica y Esfuerzo Continuo: Sostenemos el crecimiento a través de procesos formativos rigurosos y auto-gestión responsable.\nCarácter sobre Competencia (Fruto vs. Dones): Priorizamos la integridad personal y el desarrollo del carácter ético como requisito previo al despliegue de habilidades o capacidades (Gálatas 5:22-23).', label: 'Pilar B - Contenido', group: 'about', type: 'textarea' },
      { key: 'pillar_c_title', value: 'C. Gobernanza y Sostenibilidad Espiritual', label: 'Pilar C - Título', group: 'about', type: 'text' },
      { key: 'pillar_c_body', value: 'Dependencia Estratégica y Liderazgo Neumatológico: Basamos nuestras decisiones en la dirección y empoderamiento del Espíritu Santo (Hechos 1:8).\nAlineación Institucional y Principio de Autoridad: Mantenemos un orden jerárquico claro, fundamentado en la rendición de cuentas, la responsabilidad compartida y la cobertura institucional (Romanos 13:1).', label: 'Pilar C - Contenido', group: 'about', type: 'textarea' },
      { key: 'objectives_intro', value: 'Para garantizar la efectividad de nuestra red, operamos bajo tres ejes estratégicos de desarrollo:', label: 'Introducción a los objetivos', group: 'about', type: 'textarea' },
      { key: 'objective_1_title', value: 'Despliegue y Expansión Territorial', label: 'Objetivo 1 - Título', group: 'about', type: 'text' },
      { key: 'objective_1_body', value: 'Escalabilidad de la red de discipulado mediante metodologías de evangelismo contextualizado en áreas urbanas y comunitarias.', label: 'Objetivo 1 - Contenido', group: 'about', type: 'textarea' },
      { key: 'objective_2_title', value: 'Desarrollo Integral del Ser (Modelo 3D)', label: 'Objetivo 2 - Título', group: 'about', type: 'text' },
      { key: 'objective_2_body', value: 'Formación holística en tres dimensiones: Física, Emocional y Espiritual (1 Tesalonicenses 5:23).', label: 'Objetivo 2 - Contenido', group: 'about', type: 'textarea' },
      { key: 'objective_3_title', value: 'Sostenibilidad y Mayordomía Ambiental', label: 'Objetivo 3 - Título', group: 'about', type: 'text' },
      { key: 'objective_3_body', value: 'Compromiso activo con la responsabilidad social y ambiental para el cuidado de la creación (Génesis 2:15).', label: 'Objetivo 3 - Contenido', group: 'about', type: 'textarea' },
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
      {
        key: 'hero_subtitle',
        title: 'Subtítulo del Hero',
        body: 'Ministerio Cristiano',
        section: 'hero',
        order: 1,
      },
      {
        key: 'hero_title',
        title: 'Título del Hero',
        body: 'REDES',
        section: 'hero',
        order: 2,
      },
      {
        key: 'hero_tagline',
        title: 'Tagline del Hero',
        body: 'Una gran red de avivamiento en las familias de nuestro país',
        section: 'hero',
        order: 3,
      },
      {
        key: 'hero_location',
        title: 'Ubicación del Hero',
        body: 'Lago Agrio, Ecuador',
        section: 'hero',
        order: 4,
      },
      {
        key: 'about_intro',
        title: 'Introducción - Nosotros',
        body: 'Somos una comunidad de fe comprometida con la transformación de vidas y familias a través del evangelio de Jesucristo.',
        section: 'about',
        order: 1,
      },
      {
        key: 'pastor_section',
        title: 'Nuestro Pastor',
        body: 'El Pastor Marco Cárdenas ha dedicado su vida al servicio de Dios y a la edificación de su iglesia. Con una pasión ardiente por la evangelización y el discipulado, ha sido un pilar fundamental en el crecimiento del Ministerio REDES.',
        section: 'about',
        order: 2,
      },
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
