import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'FinFlow v3.0',
  description: 'Personal finance, work and AI operating system'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#12002e'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
