import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: {
    default: 'GammaScope - Options Gamma Analytics',
    template: '%s | GammaScope',
  },
  description: 'Professional options gamma analytics dashboard for active traders. Analyze gamma exposure, key levels, and positioning for SPX, SPY, QQQ and more.',
  keywords: ['options', 'gamma', 'analytics', 'trading', 'SPX', 'SPY', 'QQQ', 'gamma exposure', 'options analysis'],
  authors: [{ name: 'GammaScope' }],
  creator: 'GammaScope',
  publisher: 'GammaScope',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GammaScope',
    title: 'GammaScope - Options Gamma Analytics',
    description: 'Professional options gamma analytics dashboard for active traders',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GammaScope - Options Gamma Analytics',
    description: 'Professional options gamma analytics dashboard for active traders',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar Navigation */}
          <Sidebar />
          
          {/* Main Content Area */}
          <main className="flex-1 lg:ml-64">
            <div className="min-h-screen">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
