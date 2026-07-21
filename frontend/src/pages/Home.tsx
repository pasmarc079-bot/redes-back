import HeroSection from '@/sections/hero/HeroSection';
import FeaturedEvents from '@/sections/featured-events/FeaturedEvents';
import SocialFeed from '@/sections/social-feed/SocialFeed';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedEvents />
      <SocialFeed />
    </>
  );
}
