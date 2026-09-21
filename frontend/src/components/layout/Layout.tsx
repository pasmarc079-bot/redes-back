import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../social/WhatsAppButton';
import { useSiteStore } from '../../stores/siteStore';
import Seo from '../Seo';

export default function Layout() {
  const { fetchSettings, fetchMenu, fetchServices, fetchContent, fetchSocialConfigs } = useSiteStore();

  useEffect(() => {
    Promise.allSettled([
      fetchSettings(),
      fetchMenu('header'),
      fetchMenu('footer'),
      fetchServices(),
      fetchContent(),
      fetchSocialConfigs(),
    ]).finally(() => useSiteStore.setState({ loading: false }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo title="Ministerio REDES | Lago Agrio, Ecuador" />
      <Navbar />
      <main id="main-content" className="flex-1 pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
