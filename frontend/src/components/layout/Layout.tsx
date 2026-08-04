import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from '../social/WhatsAppButton';
import { useSiteStore } from '../../stores/siteStore';

export default function Layout() {
  const { fetchSettings, fetchMenu, fetchServices, fetchContent } = useSiteStore();

  useEffect(() => {
    Promise.all([
      fetchSettings(),
      fetchMenu('header'),
      fetchMenu('footer'),
      fetchServices(),
      fetchContent(),
    ]).finally(() => useSiteStore.setState({ loading: false }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
