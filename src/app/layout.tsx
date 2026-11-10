/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Metadata } from 'next';
import { Bricolage_Grotesque, Public_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import { shell } from '@/lib/content/shell';
import { SITE_URL } from '@/lib/seo';
import { SKIN_SCRIPT } from '@/lib/skin/skin-script';
import { THEME_SCRIPT } from '@/lib/theme/theme-script';
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
  alternateName: shell.alternateNames,
  url: SITE_URL,
  image: shell.avatar,
  jobTitle: shell.headline,
  description: shell.seoDescription,
};

/** Where the owner's photo comes from, when it is not this site: the connection is opened while the page is still being read, not when the photo is asked for (it is the biggest thing on the first screen). */
const imageOrigin = (() => {
  try {
    return new URL(shell.avatar).origin;
  } catch {
    return null;
  }
})();

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang={shell.defaultLanguage}
      className={`${publicSans.variable} ${bricolage.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {imageOrigin && <link rel='preconnect' href={imageOrigin} />}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SKIN_SCRIPT }} />
      </head>
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
