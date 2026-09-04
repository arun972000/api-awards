import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    {
      url: new URL('/', siteUrl).toString(),
      changeFrequency: 'weekly',
      priority: 1,
      images: [new URL('/opengraph-image', siteUrl).toString()],
    },
  ];
}
