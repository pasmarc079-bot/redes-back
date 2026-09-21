import HeroSection from '@/sections/hero/HeroSection';
import FeaturedEvents from '@/sections/featured-events/FeaturedEvents';
import SocialFeed from '@/sections/social-feed/SocialFeed';
import { useSiteStore } from '@/stores/siteStore';

export default function Home() {
  const showSocial = useSiteStore((state) => state.settings.home_social_enabled !== 'false');

  return (
    <>
      <HeroSection />
      <FeaturedEvents />
      {showSocial && <SocialFeed />}
    </>
  );
}
