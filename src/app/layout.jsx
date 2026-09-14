import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'Venthulir — 100% Pure Organic Oils & Heritage Harvest',
  description: 'Authentic Tamil Nadu farm produce, wood cold-pressed oils, single-origin spices, native grains and unadulterated honey delivered fresh to your doorstep.',
  keywords: 'organic oils, cold pressed oil, chekku oil, mara chekku ennai, organic spices, tamil nadu organic harvest, venthulir',
  openGraph: {
    title: 'Venthulir — 100% Pure Organic Oils & Heritage Harvest',
    description: 'Pure, traditional wood cold-pressed oils and organic harvest direct from Tamil Nadu heritage farms.',
    url: 'https://venthulir.com',
    siteName: 'Venthulir',
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Cinzel+Decorative:wght@700;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600;1,700&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
