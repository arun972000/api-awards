import { awardCeremony, awardsContactEmail } from '@/lib/awardContent';
import { getSiteUrl, siteDescription, siteName } from '@/lib/site';

export default function AwardStructuredData() {
  const siteUrl = getSiteUrl();
  const homeUrl = new URL('/', siteUrl).toString();
  const organisationId = new URL('/#organisation', siteUrl).toString();
  const websiteId = new URL('/#website', siteUrl).toString();
  const eventId = new URL('/#awards-event', siteUrl).toString();

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organisationId,
        name: 'Association of Publishers in India',
        url: homeUrl,
        email: awardsContactEmail,
        logo: {
          '@type': 'ImageObject',
          url: new URL('/BLUE LOGO.png', siteUrl).toString(),
          width: 612,
          height: 139,
        },
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: homeUrl,
        name: siteName,
        description: siteDescription,
        inLanguage: 'en-IN',
        publisher: { '@id': organisationId },
      },
      {
        '@type': 'Event',
        '@id': eventId,
        name: 'API Excellence Awards 2026',
        description: siteDescription,
        url: homeUrl,
        image: [new URL('/opengraph-image', siteUrl).toString()],
        startDate: awardCeremony.startIso,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
          '@type': 'Place',
          name: `${awardCeremony.hall}, ${awardCeremony.building}`,
          address: {
            '@type': 'PostalAddress',
            streetAddress: awardCeremony.street,
            addressLocality: awardCeremony.city,
            addressCountry: awardCeremony.country,
          },
        },
        organizer: { '@id': organisationId },
      },
    ],
  };

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</gu, '\\u003c'),
      }}
    />
  );
}
