import prisma from '../repository/prisma';
import { AppError } from '../middleware/errorHandler';
import slugify from 'slugify';
import { BadgeType } from '@prisma/client';

export interface CreateBadgeInput {
  name: string;
  description?: string;
  iconUrl?: string;
  type: BadgeType;
  color?: string;
  criteria?: string;
}

export interface UpdateBadgeInput extends Partial<CreateBadgeInput> {}

export const getPublicBadges = async () => {
  return prisma.badge.findMany({
    where: { isActive: true },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });
};

export const getBadgeBySlug = async (slug: string) => {
  const badge = await prisma.badge.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          member: {
            include: {
              user: {
                select: { firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
        },
      },
    },
  });

  if (!badge) {
    throw new AppError('Badge not found', 404);
  }

  return badge;
};

export const createBadge = async (input: CreateBadgeInput) => {
  const slug = slugify(input.name, { lower: true, strict: true });

  const existing = await prisma.badge.findUnique({ where: { slug } });
  if (existing) {
    throw new AppError('A badge with this name already exists', 409);
  }

  return prisma.badge.create({
    data: { ...input, slug },
  });
};

export const updateBadge = async (id: string, input: UpdateBadgeInput) => {
  const badge = await prisma.badge.findUnique({ where: { id } });
  if (!badge) {
    throw new AppError('Badge not found', 404);
  }

  const updateData: any = { ...input };
  if (input.name) updateData.slug = slugify(input.name, { lower: true, strict: true });

  return prisma.badge.update({
    where: { id },
    data: updateData,
  });
};

export const deleteBadge = async (id: string) => {
  const badge = await prisma.badge.findUnique({ where: { id } });
  if (!badge) {
    throw new AppError('Badge not found', 404);
  }

  return prisma.badge.delete({ where: { id } });
};

export const assignBadge = async (memberId: string, badgeId: string, notes?: string, assignedById?: string) => {
  const existing = await prisma.memberBadge.findUnique({
    where: {
      memberId_badgeId: { memberId, badgeId },
    },
  });

  if (existing) {
    throw new AppError('This badge is already assigned to this member', 409);
  }

  return prisma.memberBadge.create({
    data: {
      memberId,
      badgeId,
      notes,
      createdById: assignedById,
    },
    include: {
      badge: true,
      member: {
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });
};

export const getAllBadges = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [badges, total] = await Promise.all([
    prisma.badge.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.badge.count(),
  ]);

  return {
    badges,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
