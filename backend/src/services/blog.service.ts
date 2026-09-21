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

const versionPayload = (input: CreatePostInput | UpdatePostInput, fallback: any = {}) => ({
  title: input.title ?? fallback.title,
  content: input.content ?? fallback.content,
  excerpt: input.excerpt ?? fallback.excerpt ?? null,
  coverImageUrl: input.coverImageUrl ?? fallback.coverImageUrl ?? null,
  seoTitle: input.seoTitle ?? fallback.seoTitle ?? null,
  seoDescription: input.seoDescription ?? fallback.seoDescription ?? null,
  ogImageUrl: input.ogImageUrl ?? fallback.ogImageUrl ?? null,
  tagIds: input.tagIds ?? fallback.tagIds ?? [],
});

const latestDraft = (post: any) => post.versions?.find((version: any) => version.status === PostStatus.DRAFT);

export const getPublicPosts = async (page = 1, limit = 12) => {
  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: PostStatus.PUBLISHED }, orderBy: { publishedAt: 'desc' }, skip, take: limit,
      include: { author: { select: { firstName: true, lastName: true, avatarUrl: true } }, tags: { include: { tag: true } } },
    }),
    prisma.blogPost.count({ where: { status: PostStatus.PUBLISHED } }),
  ]);
  return { posts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getPostBySlug = async (slug: string) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { author: { select: { firstName: true, lastName: true, avatarUrl: true } }, tags: { include: { tag: true } } },
  });
  if (!post) throw new AppError('Post not found', 404);
  return post;
};

export const createPost = async (input: CreatePostInput, authorId: string) => {
  const slug = slugify(input.title, { lower: true, strict: true });
  const { tagIds, ...postData } = input;
  return prisma.$transaction(async (tx) => {
    const post = await tx.blogPost.create({
      data: { ...postData, slug, authorId, status: PostStatus.DRAFT, publishedAt: null, tags: tagIds ? { create: tagIds.map(tagId => ({ tag: { connect: { id: tagId } } })) } : undefined },
      include: { tags: { include: { tag: true } } },
    });
    await tx.blogPostVersion.create({ data: { postId: post.id, version: 1, ...versionPayload(input), status: PostStatus.DRAFT, isCurrent: true } });
    return post;
  });
};

export const updatePost = async (id: string, input: UpdatePostInput) => {
  const post = await prisma.blogPost.findUnique({ where: { id }, include: { tags: true, versions: { orderBy: { version: 'desc' } } } });
  if (!post) throw new AppError('Post not found', 404);
  const latest = post.versions[0];
  const fallback = latest || { ...post, tagIds: post.tags.map(tag => tag.tagId) };
  const payload = versionPayload(input, fallback);
  const versionNumber = latest?.status === PostStatus.DRAFT ? latest.version : (latest?.version || 0) + 1;

  return prisma.$transaction(async (tx) => {
    await tx.blogPostVersion.updateMany({ where: { postId: id }, data: { isCurrent: false } });
    const editingVersion = latest?.status === PostStatus.DRAFT
      ? await tx.blogPostVersion.update({ where: { id: latest.id }, data: { ...payload, status: PostStatus.DRAFT, isCurrent: true } })
      : await tx.blogPostVersion.create({ data: { postId: id, version: versionNumber, ...payload, status: PostStatus.DRAFT, isCurrent: true } });
    return { ...post, editingVersion, status: PostStatus.DRAFT, version: editingVersion.version };
  });
};

export const publishPost = async (id: string) => {
  const post = await prisma.blogPost.findUnique({ where: { id }, include: { versions: { orderBy: { version: 'desc' } } } });
  if (!post) throw new AppError('Post not found', 404);
  const version = latestDraft(post) || post.versions[0];
  if (!version) throw new AppError('No version found', 400);

  return prisma.$transaction(async (tx) => {
    const publishedAt = new Date();
    await tx.blogPostVersion.updateMany({ where: { postId: id }, data: { isCurrent: false } });
    const publishedVersion = await tx.blogPostVersion.update({ where: { id: version.id }, data: { status: PostStatus.PUBLISHED, publishedAt, isCurrent: true } });
    await tx.postTag.deleteMany({ where: { postId: id } });
    const tagIds = Array.isArray(publishedVersion.tagIds) ? publishedVersion.tagIds as string[] : [];
    if (tagIds.length) await tx.postTag.createMany({ data: tagIds.map(tagId => ({ postId: id, tagId })) });
    return tx.blogPost.update({ where: { id }, data: { title: publishedVersion.title, content: publishedVersion.content, excerpt: publishedVersion.excerpt, coverImageUrl: publishedVersion.coverImageUrl, seoTitle: publishedVersion.seoTitle, seoDescription: publishedVersion.seoDescription, ogImageUrl: publishedVersion.ogImageUrl, status: PostStatus.PUBLISHED, publishedAt } });
  });
};

export const unpublishPost = async (id: string) => {
  const post = await prisma.blogPost.findUnique({ where: { id }, include: { versions: { where: { isCurrent: true }, take: 1 } } });
  if (!post) throw new AppError('Post not found', 404);
  return prisma.$transaction([
    ...(post.versions[0] ? [prisma.blogPostVersion.update({ where: { id: post.versions[0].id }, data: { status: PostStatus.DRAFT } })] : []),
    prisma.blogPost.update({ where: { id }, data: { status: PostStatus.DRAFT, publishedAt: null } }),
  ]);
};

export const deletePost = async (id: string) => {
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) throw new AppError('Post not found', 404);
  return prisma.blogPost.delete({ where: { id } });
};

export const getPostById = async (id: string) => {
  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: { author: { select: { firstName: true, lastName: true, avatarUrl: true } }, tags: { include: { tag: true } }, versions: { orderBy: { version: 'desc' } } },
  });
  if (!post) throw new AppError('Post not found', 404);
  const editingVersion = latestDraft(post) || post.versions[0];
  return { ...post, editingVersion, version: editingVersion?.version || 1 };
};

export const getAllPosts = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit, include: { author: { select: { firstName: true, lastName: true } }, tags: { include: { tag: true } }, versions: { orderBy: { version: 'desc' }, take: 1 } } }),
    prisma.blogPost.count(),
  ]);
  return { posts: posts.map((post: any) => ({ ...post, status: post.versions[0]?.status || post.status, version: post.versions[0]?.version || 1 })), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getTags = async () => prisma.tag.findMany({ orderBy: { name: 'asc' } });
