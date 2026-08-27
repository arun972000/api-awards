const fallbackSiteUrl = 'http://localhost:3000';

export const siteName = 'API Excellence Awards 2026';
export const siteDescription =
  'Nominate an organisation, initiative or individual advancing Indian publishing. Nominations close 10 September 2026.';

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(configuredUrl || fallbackSiteUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}
