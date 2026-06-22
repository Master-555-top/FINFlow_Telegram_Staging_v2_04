import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import './finflow-ui-overrides.css';
import './finflow-design-system.css';

export const metadata: Metadata = {
  title: 'FinFlow',
  description: 'Personal finance, work, sleep and AI operating system',
  applicationName: 'FinFlow',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinFlow'
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  themeColor: '#070910',
  colorScheme: 'dark'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="finflow-app" data-design-version="2.42-baseline-merged-v2.45">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
