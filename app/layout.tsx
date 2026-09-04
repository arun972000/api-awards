import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import MetaPixel from '@/components/MetaPixel';
import { getSiteUrl, siteDescription, siteName } from '@/lib/site';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#173b5e',
  colorScheme: 'light',
};

export const metadata: Metadata = {
  title: {
    default: 'Nominate | API Excellence Awards 2026',
    template: '%s | API Excellence Awards 2026',
  },
  description: siteDescription,
  metadataBase: getSiteUrl(),
  applicationName: siteName,
  manifest: '/manifest.webmanifest',
  alternates: { canonical: '/' },
  keywords: [
    'API Excellence Awards',
    'API Excellence Awards 2026',
    'publishing awards India',
    'Indian publishing awards',
    'publishing innovation',
    'editorial excellence',
    'publishing sustainability',
    'social impact publishing',
    'young publishing professional',
    'Association of Publishers in India',
  ],
  authors: [{ name: 'Association of Publishers in India' }],
  creator: 'Association of Publishers in India',
  publisher: 'Association of Publishers in India',
  category: 'Publishing awards',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: '/icon', type: 'image/png', sizes: '512x512' }],
    apple: [{ url: '/apple-icon', type: 'image/png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'Nominations open | API Excellence Awards 2026',
    description: siteDescription,
    url: '/',
    siteName,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'API Excellence Awards 2026 nominations',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nominations open | API Excellence Awards 2026',
    description: siteDescription,
    images: [
      {
        url: '/twitter-image',
        width: 1200,
        height: 630,
        alt: 'API Excellence Awards 2026 nominations',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={montserrat.variable}>
      <body>
        <a className='skip-link' href='#main-content'>Skip to main content</a>
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
