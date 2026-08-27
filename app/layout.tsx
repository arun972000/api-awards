import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
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
  title: 'API Excellence Awards 2026 | Nominate',
  description: siteDescription,
  metadataBase: getSiteUrl(),
  applicationName: siteName,
  alternates: { canonical: '/' },
  authors: [{ name: 'Association of Publishers in India' }],
  creator: 'Association of Publishers in India',
  publisher: 'Association of Publishers in India',
  openGraph: {
    title: 'Nominations open | API Excellence Awards 2026',
    description: siteDescription,
    url: '/',
    siteName,
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nominations open | API Excellence Awards 2026',
    description: siteDescription,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={montserrat.variable}>
      <body>
        <a className='skip-link' href='#main-content'>Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
