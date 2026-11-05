/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Metadata } from 'next';
import { shell } from '@/lib/content/shell';

/** The public address of the site, used for canonical links and social previews. */
export const SITE_URL = 'https://bachbntdev.web.app';

/**
 * Metadata of one page: tab title, description, canonical link and the social preview.
 * The pages are exported statically, so these are the English ones; the tab title is translated in the browser
 * (see `DocumentTitle`). Search engines and link previews read this HTML.
 */
export function pageMetadata(
  path: string,
  label: string,
  description: string,
): Metadata {
  const title = `${label} - ${shell.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: shell.name,
      url: path,
      title,
      description,
      images: shell.ogImage ? [shell.ogImage] : [],
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}
