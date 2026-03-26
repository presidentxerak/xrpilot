import type { Metadata, Viewport } from 'next';
import { Providers } from '@/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pilot - Your Digital Wallet',
  description:
    'Send, receive, and manage your digital objects and value with Pilot. Simple, secure, and fast.',
  keywords: ['digital wallet', 'digital objects', 'send money', 'receive payments'],
  openGraph: {
    title: 'Pilot - Your Digital Wallet',
    description: 'Send, receive, and manage your digital objects and value.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
