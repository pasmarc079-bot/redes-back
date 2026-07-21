import prisma from '../repository/prisma';
import { AppError } from '../middleware/errorHandler';
import slugify from 'slugify';
import { PostStatus } from '@prisma/client';

export interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string;
  status?: PostStatus;
  seoTitle?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  tagIds?: string[];
}

export interface UpdatePostInput extends Partial<CreatePostInput> {}

export const getPublicPosts = async (page = 1, limit = 12) => {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: {
          select: { firstName: true, lastName: true, avatarUrl: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    }),
    prisma.blogPost.count({ where: { status: PostStatus.PUBLISHED } }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPostBySlug = async (slug: string) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: { firstName: true, lastName: true, avatarUrl: true },
      },
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  return post;
};

export const createPost = async (input: CreatePostInput, authorId: string) => {
  const slug = slugify(input.title, { lower: true, strict: true });

  const { tagIds, ...postData } = input;

  const post = await prisma.blogPost.create({
    data: {
      ...postData,
      slug,
      authorId,
      status: input.status || PostStatus.DRAFT,
      publishedAt: input.status === PostStatus.PUBLISHED ? new Date() : null,
      tags: tagIds
        ? { create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) }
        : undefined,
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  return post;
};

export const updatePost = async (id: string, input: UpdatePostInput) => {
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const { tagIds, ...postData } = input;

  const updateData: any = { ...postData };

  for (const key of Object.keys(updateData)) {
    if (updateData[key] === '' || updateData[key] === null) delete updateData[key];
  }
  if (input.title) updateData.slug = slugify(input.title, { lower: true, strict: true });
  if (input.status === PostStatus.PUBLISHED && !post.publishedAt) {
    updateData.publishedAt = new Date();
  }

  if (tagIds) {
    await prisma.postTag.deleteMany({ where: { postId: id } });
    updateData.tags = {
      create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })),
    };
  }

  return prisma.blogPost.update({
    where: { id },
    data: updateData,
    include: {
      tags: { include: { tag: true } },
    },
  });
};

export const deletePost = async (id: string) => {
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  return prisma.blogPost.delete({ where: { id } });
};

export const getPostById = async (id: string) => {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      author: {
        select: { firstName: true, lastName: true, avatarUrl: true },
      },
      tags: {
        include: { tag: true },
      },
    },
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  return post;
};

export const getAllPosts = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: { select: { firstName: true, lastName: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.blogPost.count(),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getTags = async () => {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });
};
