import type { MetadataRoute } from 'next';
import { siteDescription, siteName } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName + ' Nominations',
    short_name: 'API Awards 2026',
    description: siteDescription,
    id: '/',
    start_url: '/',
    scope: '/',
    lang: 'en-IN',
    display: 'standalone',
    orientation: 'any',
    background_color: '#f1f3f5',
    theme_color: '#173b5e',
    categories: ['business', 'education', 'publishing'],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Nominate now',
        short_name: 'Nominate',
        description: 'Start an API Excellence Awards 2026 nomination.',
        url: '/#nominate',
      },
    ],
  };
}
