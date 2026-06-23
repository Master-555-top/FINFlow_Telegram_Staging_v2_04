import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import './finflow-ui-overrides.css';
import './finflow-design-system.css';
import './finflow-redesign-v2-51.css';
import './finflow-redesign-v2-56.css';
import './finflow-ux-copy-v2-57.css';
import './finflow-declutter-v2-58.css';
import './finflow-baseline-v2-59.css';

export const metadata: Metadata = {
  title: 'FinFlow',
  description: 'Личный план денег, работы, сна и дня',
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
      <body className="finflow-app" data-design-version="v2.60-template-first-sync-baseline">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
