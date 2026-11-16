/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExternalLink } from 'lucide-react';
import { linkLabel } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { phButtonVariants } from '@/skins/phone/ui/ph-button';

/** The links of a project (site, store, GitHub...) as buttons. One that leaves the site opens in a new tab and carries the glyph for it. */
export function ProjectLinks({ links }: { links: Doc<'projects'>['links'] }) {
  const copy = useCopy(projectsCopy);
  return (
    <ul className='m-0 flex list-none flex-wrap gap-2.5 p-0'>
      {links.map((link) => {
        const external = /^https?:\/\//.test(link.url);
        return (
          <li key={link.url}>
            <a
              href={link.url}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className={phButtonVariants({ variant: 'tonal' })}
            >
              {linkLabel(link, copy.links)}
              {external && (
                <ExternalLink aria-hidden='true' className='size-4' />
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
