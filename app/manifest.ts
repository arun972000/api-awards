import type { MetadataRoute } from 'next';
import { siteDescription, siteName } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName + ' Nominations',
    short_name: 'API Awards 2026',
    description: siteDescription,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f1f3f5',
    theme_color: '#173b5e',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
