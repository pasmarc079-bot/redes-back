import prisma from '../repository/prisma';
import { AppError } from '../middleware/errorHandler';
import slugify from 'slugify';
import { EventStatus } from '@prisma/client';

export interface CreateEventInput {
  title: string;
  description?: string;
  shortDescription?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  flyerUrl?: string;
  gallery?: object;
  isFeatured?: boolean;
  capacity?: number;
  registrationUrl?: string;
  status?: EventStatus;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {}

export const getPublicEvents = async (page = 1, limit = 12, featured = false) => {
  const skip = (page - 1) * limit;

  const where: any = {
    status: { in: [EventStatus.UPCOMING, EventStatus.ONGOING] },
  };

  if (featured) {
    where.isFeatured = true;
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        startDate: true,
        endDate: true,
        location: true,
        flyerUrl: true,
        isFeatured: true,
        status: true,
      },
    }),
    prisma.event.count({ where }),
  ]);

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getEventBySlug = async (slug: string) => {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  return event;
};

export const createEvent = async (input: CreateEventInput, createdById: string) => {
  const slug = slugify(input.title, { lower: true, strict: true });

  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) {
    throw new AppError('An event with this title already exists', 409);
  }

  const createData: any = { ...input };

  for (const key of Object.keys(createData)) {
    if (createData[key] === '' || createData[key] === null) delete createData[key];
  }

  return prisma.event.create({
    data: {
      ...createData,
      slug,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      latitude: input.latitude ? parseFloat(input.latitude) : null,
      longitude: input.longitude ? parseFloat(input.longitude) : null,
      createdById,
      status: input.status || EventStatus.DRAFT,
    },
  });
};

export const updateEvent = async (id: string, input: UpdateEventInput) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  const updateData: any = { ...input };

  for (const key of Object.keys(updateData)) {
    if (updateData[key] === '' || updateData[key] === null) delete updateData[key];
  }

  if (input.startDate) updateData.startDate = new Date(input.startDate);
  if (input.endDate) updateData.endDate = new Date(input.endDate);
  if (input.title) updateData.slug = slugify(input.title, { lower: true, strict: true });

  return prisma.event.update({
    where: { id },
    data: updateData,
  });
};

export const deleteEvent = async (id: string) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    throw new AppError('Event not found', 404);
  }

  return prisma.event.delete({ where: { id } });
};

export const getEventById = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  return event;
};

export const getAllEvents = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.event.count(),
  ]);

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
