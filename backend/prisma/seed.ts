import { PrismaClient, UserRole, BadgeType, EventStatus, PostStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
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

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.create({
    data: {
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@ministerioredes.org',
      passwordHash: hashedPassword,
      firstName: 'Administrador',
      lastName: 'REDES',
      roles: {
        create: [{ role: UserRole.ADMIN }],
      },
    },
  });
  console.log('✅ Admin user created');


  // Create badges
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

  // Assign badge to member
  const member = await prisma.member.findUnique({
    where: { userId: memberUser.id },
  });
  if (member) {
    await prisma.memberBadge.create({
      data: {
        memberId: member.id,
        badgeId: badges[0].id,
        notes: 'Voluntario en Exaltando al Padre 2024',
        createdById: admin.id,
      },
    });
    console.log('✅ Badge assigned to member');
  }

  // Create events
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
      status: EventStatus.UPCOMING,
      isFeatured: true,
      capacity: 300,
      createdById: admin.id,
    },
  });
  console.log('✅ Events created');

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Adoración', slug: 'adoracion', color: '#C9A84C' } }),
    prisma.tag.create({ data: { name: 'Familia', slug: 'familia', color: '#4A7C59' } }),
    prisma.tag.create({ data: { name: 'Reflexión', slug: 'reflexion', color: '#B8860B' } }),
    prisma.tag.create({ data: { name: 'Eventos', slug: 'eventos', color: '#6B2FA0' } }),
  ]);
  console.log('✅ Tags created');

  // Create blog posts
  const post1 = await prisma.blogPost.create({
    data: {
      title: 'El poder de la adoración en comunidad',
      slug: 'el-poder-de-la-adoracion-en-comunidad',
      excerpt: 'Cuando nos reunimos para adorar juntos, algo sobrenatural sucede...',
      content: '<p>Cuando nos reunimos para adorar juntos, algo sobrenatural sucede. La presencia de Dios se manifiesta de una manera especial...</p>',
      authorId: admin.id,
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
      authorId: admin.id,
      status: PostStatus.PUBLISHED,
      publishedAt: new Date('2026-04-12'),
      readTime: 7,
    },
  });

  // Link tags to post
  await prisma.postTag.createMany({
    data: [
      { postId: post1.id, tagId: tags[0].id },
      { postId: post1.id, tagId: tags[2].id },
    ],
  });
  console.log('✅ Blog posts created');

  // Social configs
  await prisma.socialConfig.createMany({
    data: [
      {
        platform: 'facebook',
        accountUrl: 'https://www.facebook.com/MinisterioREDESlive',
        isActive: true,
      },
      {
        platform: 'youtube',
        accountUrl: 'https://youtube.com/channel/UClpoz4Olk2soO3Cg2gUKWKA',
        isActive: true,
      },
      {
        platform: 'tiktok',
        accountUrl: 'https://www.tiktok.com/@ministerioredes',
        isActive: true,
      },
    ],
  });
  console.log('✅ Social configs created');

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
