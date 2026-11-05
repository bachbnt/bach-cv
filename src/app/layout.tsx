/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Metadata } from 'next';
import { Bricolage_Grotesque, Public_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import { shell } from '@/lib/content/shell';
import { SITE_URL } from '@/lib/seo';
import './globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin', 'vietnamese'],
});
const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: shell.seoTitle,
  description: shell.seoDescription,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: shell.name,
    url: '/',
    title: shell.seoTitle,
    description: shell.seoDescription,
    images: shell.ogImage ? [shell.ogImage] : [],
  },
  twitter: {
    card: 'summary_large_image',
    title: shell.seoTitle,
    description: shell.seoDescription,
  },
};

/** Who the site is about, for search engines (schema.org Person). */
const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: shell.name,
  url: SITE_URL,
  image: shell.avatar,
  jobTitle: shell.headline,
  description: shell.seoDescription,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang={shell.defaultLanguage}
      className={`${publicSans.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className='flex min-h-full flex-col'>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
