import HeroSection from '@/sections/hero/HeroSection';
import NextEventBanner from '@/sections/next-event/NextEventBanner';
import ChurchSection from '@/sections/church/ChurchSection';
import MetricsSection from '@/sections/metrics/MetricsSection';
import CommunityGallery from '@/sections/community-gallery/CommunityGallery';
import TestimoniesSection from '@/sections/testimonies';
import SocialFeed from '@/sections/social-feed/SocialFeed';
import { useSiteStore } from '@/stores/siteStore';

/**
 * Narrative: who we are (hero) -> what happens next (next event) -> what we believe and who
 * we are as a church -> what that has produced (metrics) -> why people trust us (testimonies) ->
 * our people in photos -> where to follow us.
 */
export default function Home() {
  const showSocial = useSiteStore((state) => state.settings.home_social_enabled !== 'false');

  return (
    <>
      <HeroSection />
      <NextEventBanner />
      <ChurchSection />
      <MetricsSection />
      <TestimoniesSection variant="home" />
      <CommunityGallery variant="home" />
      {showSocial && <SocialFeed />}
    </>
  );
}
