import { create } from 'zustand';
import { siteApi, socialApi } from '../services/api';
import type { SiteSettings, MenuItem, PageContent, ServiceSchedule, SocialConfig } from '../types';

interface SiteState {
  settings: SiteSettings;
  headerMenu: MenuItem[];
  footerMenu: MenuItem[];
  services: ServiceSchedule[];
  content: Record<string, PageContent[]>;
  socialConfigs: SocialConfig[];
  loading: boolean;
  fetchSettings: () => Promise<void>;
  fetchMenu: (location: string) => Promise<void>;
  fetchServices: () => Promise<void>;
  fetchContent: (section?: string) => Promise<void>;
  fetchSocialConfigs: () => Promise<void>;
}

export const useSiteStore = create<SiteState>((set) => ({
  settings: {},
  headerMenu: [],
  footerMenu: [],
  services: [],
  content: {},
  socialConfigs: [],
  loading: true,

  fetchSettings: async () => {
    const { data } = await siteApi.getSettings();
    set({ settings: data });
  },

  fetchMenu: async (location: string) => {
    const { data } = await siteApi.getMenu(location);
    if (location === 'header') set({ headerMenu: data });
    else if (location === 'footer') set({ footerMenu: data });
  },

  fetchServices: async () => {
    const { data } = await siteApi.getServices();
    set({ services: data });
  },

  fetchContent: async (section?: string) => {
    const { data } = await siteApi.getContent(section);
    const grouped: Record<string, PageContent[]> = {};
    data.forEach((item: PageContent) => {
      if (!grouped[item.section]) grouped[item.section] = [];
      grouped[item.section].push(item);
    });
    set((state) => ({ content: { ...state.content, ...grouped } }));
  },

  fetchSocialConfigs: async () => {
    const { data } = await socialApi.getConfigs();
    set({ socialConfigs: data });
  },
}));
