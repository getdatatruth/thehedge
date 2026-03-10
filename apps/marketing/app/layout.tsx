import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://thehedge.ie'),
  title: { default: 'The Hedge — Family Learning Platform for Irish Families', template: '%s | The Hedge' },
  description: "Personalised, screen-free activities for Irish families — shaped by your children's ages, today's weather, and your world. Inspired by Ireland's hedge schools.",
  keywords: ['family activities Ireland','homeschool Ireland','children activities Cork','family learning platform','hedge school Ireland','NCCA curriculum','AEARS homeschool'],
  authors: [{ name: 'The Hedge', url: 'https://thehedge.ie' }],
  openGraph: { type: 'website', locale: 'en_IE', url: 'https://thehedge.ie', siteName: 'The Hedge', title: 'The Hedge — Family Learning Platform', description: "Personalised activities for Irish families, inspired by Ireland's hedge schools." },
  twitter: { card: 'summary_large_image', title: 'The Hedge', description: "Screen-free family activities for Irish families." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IE">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context':'https://schema.org','@type':'Organization',name:'The Hedge',url:'https://thehedge.ie',description:"Family learning platform for Irish families, inspired by Ireland's hedge schools.",address:{'@type':'PostalAddress',addressRegion:'Cork',addressCountry:'IE'} }) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
