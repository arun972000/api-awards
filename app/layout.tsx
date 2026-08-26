import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#173b5e',
};

export const metadata: Metadata = {
  title: 'API Excellence Awards 2026 | Nominations',
  description:
    'Nominate outstanding work and people shaping the future of Indian publishing for the API Excellence Awards 2026.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'API Excellence Awards 2026',
    description: 'Celebrating innovation, impact, and craft in Indian publishing.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
