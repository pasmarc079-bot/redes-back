import prisma from '../repository/prisma';
import { AppError } from '../middleware/errorHandler';
import slugify from 'slugify';
import { EventStatus } from '@prisma/client';
import { isValidEventDate, parseEventDate } from '../utils/eventDate';

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

const ecuadorDateKey = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

export const getAutomaticEventStatus = (event: { startDate: Date; endDate?: Date | null; status?: EventStatus }, now = new Date()): EventStatus => {
  if (event.status === EventStatus.CANCELLED) return EventStatus.CANCELLED;

  const today = ecuadorDateKey(now);
  const startDay = ecuadorDateKey(event.startDate);
  const endDay = event.endDate ? ecuadorDateKey(event.endDate) : startDay;

  // The event remains "ongoing" throughout its calendar day in Ecuador.
  if (today === startDay || today === endDay) return EventStatus.ONGOING;

  if (event.endDate) {
    if (now > event.endDate) return EventStatus.COMPLETED;
    return now < event.startDate ? EventStatus.UPCOMING : EventStatus.ONGOING;
  }

  return now < event.startDate ? EventStatus.UPCOMING : EventStatus.COMPLETED;
};

const withAutomaticStatus = <T extends { startDate: Date; endDate?: Date | null; status: EventStatus }>(event: T) => ({
  ...event,
  status: getAutomaticEventStatus(event),
});

/**
 * Removes internal fields before an event goes to the public site. The id of the user who
 * created the event must not travel: with a weak JWT secret it is enough to forge an admin token.
 */
const toPublicEvent = <T extends { createdById?: string | null }>(event: T) => {
  const { createdById: _ignored, ...rest } = event;
  return rest;
};

export const getPublicEvents = async (page = 1, limit = 12, featured = false, includeCompleted = false) => {
  const skip = (page - 1) * limit;

  const where: any = { status: { notIn: [EventStatus.DRAFT, EventStatus.CANCELLED] } };
  if (featured) where.isFeatured = true;

  const [storedEvents] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
    }),
  ]);

  const events = storedEvents
    .map(withAutomaticStatus)
    .map(toPublicEvent)
    .filter(event => event.status === EventStatus.UPCOMING || event.status === EventStatus.ONGOING || (includeCompleted && event.status === EventStatus.COMPLETED))
    .sort((a, b) => {
      const rank = { ONGOING: 0, UPCOMING: 1, COMPLETED: 2 } as const;
      const statusDifference = rank[a.status as keyof typeof rank] - rank[b.status as keyof typeof rank];
      if (statusDifference !== 0) return statusDifference;
      return a.status === EventStatus.COMPLETED
        ? new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        : new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    })
    .slice(skip, skip + limit);
  const total = storedEvents.filter(event => {
    const status = getAutomaticEventStatus(event);
    return status === EventStatus.UPCOMING || status === EventStatus.ONGOING || (includeCompleted && status === EventStatus.COMPLETED);
  }).length;

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

  return toPublicEvent(withAutomaticStatus(event));
};

export const createEvent = async (input: CreateEventInput, createdById: string) => {
  if (!isValidEventDate(input.startDate)) {
    throw new AppError('La fecha de inicio del evento no es válida.', 400);
  }
  if (input.endDate && !isValidEventDate(input.endDate)) {
    throw new AppError('La fecha de fin del evento no es válida.', 400);
  }

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
      startDate: parseEventDate(input.startDate),
      endDate: input.endDate ? parseEventDate(input.endDate) : null,
      latitude: input.latitude ? parseFloat(input.latitude) : null,
      longitude: input.longitude ? parseFloat(input.longitude) : null,
      createdById,
      status: input.status === EventStatus.CANCELLED
        ? EventStatus.CANCELLED
        : getAutomaticEventStatus({ startDate: parseEventDate(input.startDate), endDate: input.endDate ? parseEventDate(input.endDate) : null }),
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

  if (input.startDate) {
    if (!isValidEventDate(input.startDate)) throw new AppError('La fecha de inicio del evento no es válida.', 400);
    updateData.startDate = parseEventDate(input.startDate);
  }
  if (input.endDate) {
    if (!isValidEventDate(input.endDate)) throw new AppError('La fecha de fin del evento no es válida.', 400);
    updateData.endDate = parseEventDate(input.endDate);
  }
  if (input.title) updateData.slug = slugify(input.title, { lower: true, strict: true });

  const nextStartDate = updateData.startDate || event.startDate;
  const nextEndDate = updateData.endDate || event.endDate;
  updateData.status = input.status === EventStatus.CANCELLED
    ? EventStatus.CANCELLED
    : getAutomaticEventStatus({ startDate: nextStartDate, endDate: nextEndDate });

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

  return toPublicEvent(withAutomaticStatus(event));
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
    events: events.map(withAutomaticStatus),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
