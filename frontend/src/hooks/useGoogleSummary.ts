import { useEffect, useState } from 'react';
import { testimonialsApi } from '@/services/api';
import type { GoogleReviewSummary } from '@/types';

/** Shared across components: one request per page load, however many components read it. */
let shared: Promise<GoogleReviewSummary | null> | null = null;

const fetchSummary = () => {
  shared ??= testimonialsApi
    .getReviewSummary()
    .then((res) => res.data as GoogleReviewSummary)
    .catch(() => null);
  return shared;
};

/** Google's own profile data (name, address, rating). Null while loading or when unavailable. */
export function useGoogleSummary() {
  const [summary, setSummary] = useState<GoogleReviewSummary | null>(null);
  useEffect(() => {
    let active = true;
    fetchSummary().then((value) => { if (active) setSummary(value); });
    return () => { active = false; };
  }, []);
  return summary;
}
