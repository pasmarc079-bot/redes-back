export interface Event {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  address: string | null;
  flyerUrl: string | null;
  isFeatured: boolean;
  status: string;
  capacity: number | null;
  registrationUrl: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  author: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
  status: string;
  publishedAt: string | null;
  readTime: number | null;
  tags: { tag: Tag }[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface SocialConfig {
  id?: string;
  platform: string;
  accountUrl: string | null;
  feedUrl: string | null;
  iconName: string | null;
  color: string | null;
  order: number;
  isActive: boolean;
}

export interface SiteSettings {
  [key: string]: string;
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
  parentId: string | null;
  location: string;
  children?: MenuItem[];
}

export interface PageContent {
  id: string;
  key: string;
  title: string | null;
  body: string | null;
  section: string;
  order: number;
  imageUrl: string | null;
  isActive: boolean;
}

export interface ServiceSchedule {
  id: string;
  name: string;
  dayOfWeek: string;
  time: string;
  description: string | null;
  order: number;
  isActive: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
