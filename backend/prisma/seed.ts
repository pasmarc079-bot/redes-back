import { PrismaClient, UserRole, BadgeType, EventStatus, PostStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.memberBadge.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.event.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.member.deleteMany();
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

  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'Voluntario del Evento',
        slug: 'voluntario-del-evento',
        description: 'Otorgado a quienes sirvieron como voluntarios en un evento',
        type: BadgeType.VOLUNTEER,
        color: '#C9A84C',
        criteria: 'Participar como voluntario en al menos 1 evento',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Líder de Grupo',
        slug: 'lider-de-grupo',
        description: 'Otorgado a los líderes de grupos celulares',
        type: BadgeType.LEADER,
        color: '#B8860B',
        criteria: 'Ser asignado como líder de un grupo celular',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Primer Bautismo',
        slug: 'primer-bautismo',
        description: 'Otorgado al momento del bautismo',
        type: BadgeType.MILESTONE,
        color: '#4A7C59',
        criteria: 'Haber sido bautizado',
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Coro de Adoración',
        slug: 'coro-de-adoracion',
        description: 'Miembro del equipo de adoración y alabanza',
        type: BadgeType.SERVICE,
        color: '#6B2FA0',
        criteria: 'Ser parte del equipo de adoración',
      },
    }),
  ]);
  console.log('✅ Badges created');

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
      { platform: 'youtube', accountUrl: 'https://youtube.com/channel/UClpoz4Olk2soO3Cg2gUKWKA', isActive: true },
      { platform: 'tiktok', accountUrl: 'https://www.tiktok.com/@ministerioredes', isActive: true },
      { platform: 'instagram', accountUrl: 'https://www.instagram.com/ministerioredes', isActive: true },
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
      { key: 'phone', value: '099 453 8859', label: 'Teléfono', group: 'contact', type: 'text' },
      { key: 'phone_international', value: '+593994538859', label: 'Teléfono (formato internacional)', group: 'contact', type: 'text' },
      { key: 'email', value: 'ministeriocristianoredes@gmail.com', label: 'Correo electrónico', group: 'contact', type: 'text' },
      { key: 'whatsapp_number', value: '593994538859', label: 'WhatsApp (solo números)', group: 'contact', type: 'text' },
      { key: 'whatsapp_message', value: 'Hola! Quisiera información sobre el Ministerio REDES.', label: 'Mensaje predeterminado WhatsApp', group: 'contact', type: 'textarea' },
      { key: 'mission', value: 'Ver una gran red de avivamiento en las familias de nuestro país. Con un gran deseo de evangelizar.', label: 'Misión', group: 'about', type: 'textarea' },
      { key: 'vision', value: 'Ser una comunidad de fe que transforma vidas, fortalece familias y lleva esperanza a cada rincón de Lago Agrio y más allá.', label: 'Visión', group: 'about', type: 'textarea' },
      { key: 'purpose', value: 'Llevar el evangelio de Jesucristo a cada familia, formando discípulos que transformen su entorno.', label: 'Propósito', group: 'about', type: 'textarea' },
      { key: 'church_history', value: 'El Ministerio REDES nació con la visión de ser una gran red de avivamiento en las familias del Ecuador. Desde sus inicios en Lago Agrio, ha crecido como una comunidad de fe comprometida con la evangelización, la formación de discípulos y el servicio a la comunidad. A lo largo de los años, ha impactado miles de vidas a través de sus programas de jóvenes, adultos, familias y ministerios de adoración.', label: 'Reseña histórica', group: 'about', type: 'textarea' },
      { key: 'pastor_name', value: 'Marco Cárdenas', label: 'Nombre del pastor principal', group: 'pastor', type: 'text' },
      { key: 'pastor_photo_url', value: '', label: 'Foto del pastor', group: 'pastor', type: 'image' },
      { key: 'pastor_bio', value: 'El Pastor Marco Cárdenas ha sido un instrumento de Dios en el Ministerio REDES. Con años de servicio y dedicación a la obra, ha liderado la congregación con pasión por la evangelización y el discipulado. Su formación y experiencia en el ministerio pastoral han sido fundamentales para el crecimiento espiritual de la iglesia y el fortalecimiento de las familias en Lago Agrio y sus alrededores.', label: 'Biografía del pastor', group: 'pastor', type: 'textarea' },
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
