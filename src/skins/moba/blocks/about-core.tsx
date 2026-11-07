/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { aboutCopy } from '@/content/copy/about';
import { mobaAboutCopy } from '@/content/copy/moba-about';
import { useCopy } from '@/lib/i18n/copy';
import { ResumeCoreStack } from '@/skins/moba/blocks/resume-core-stack';
import { MbSection } from '@/skins/moba/ui/mb-section';

/** The core stack as the four key skills Q W E R (and any more, in rank order), with the link to every skill on Resume. */
export function AboutCore() {
  const { core } = useCopy(aboutCopy);
  const mb = useCopy(mobaAboutCopy);
  return (
    <MbSection
      id='core'
      kicker={mb.kickers.core}
      title={core.title}
      lead={core.lead}
      order={1}
      aside={
        <Link
          href='/resume#skills'
          className='inline-flex min-h-9 items-center gap-1.5 text-sm font-bold text-mb-gold-ink underline underline-offset-4 hover:text-mb-gold-lo dark:hover:text-mb-title pointer-coarse:min-h-11'
        >
          {core.all}
          <ArrowRight aria-hidden='true' className='size-4' />
        </Link>
      }
    >
      <ResumeCoreStack />
    </MbSection>
  );
}
