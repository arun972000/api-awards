import { awardCeremony, awardDates } from '@/lib/awardContent';

const productionSiteUrl = 'https://apiexcellenceawards.co.in';
const developmentSiteUrl = 'http://localhost:3000';

export const siteName = 'API Excellence Awards 2026';
// Read from awardDates so the description cannot drift from the dates.
export const siteDescription =
  `Nominations closed at ${awardDates.nominationsCloseLong}. ` +
  `Winners will be announced on ${awardDates.ceremony} in ${awardCeremony.city}.`;

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  // A production build must never fall back to localhost: this value becomes
  // the canonical metadata base, the sitemap host and the robots host.
  const fallbackSiteUrl =
    process.env.NODE_ENV === 'production' ? productionSiteUrl : developmentSiteUrl;

  try {
    return new URL(configuredUrl || fallbackSiteUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}
