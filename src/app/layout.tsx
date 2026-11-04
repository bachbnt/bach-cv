/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Metadata } from 'next';
import { Bricolage_Grotesque, Public_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';
import { shell } from '@/lib/content/shell';
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
  title: shell.seoTitle,
  description: shell.seoDescription,
  openGraph: {
    title: shell.seoTitle,
    description: shell.seoDescription,
    images: shell.ogImage ? [shell.ogImage] : [],
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang={shell.defaultLanguage}
      className={`${publicSans.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className='flex min-h-full flex-col'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
