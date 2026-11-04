/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { AppArt } from '@/components/services/art/app-art';
import { GenericArt } from '@/components/services/art/generic-art';
import { OssArt } from '@/components/services/art/oss-art';
import { TeachingArt } from '@/components/services/art/teaching-art';
import { WebArt } from '@/components/services/art/web-art';
import { WritingArt } from '@/components/services/art/writing-art';
import '@/components/services/service-art.css';
import type { Service } from '@/lib/content/schema';

const DRAWINGS: Record<Service['art'], () => React.JSX.Element> = {
  app: AppArt,
  web: WebArt,
  oss: OssArt,
  teaching: TeachingArt,
  writing: WritingArt,
  generic: GenericArt,
};

/** The CSS-drawn picture at the top of a service card. Decorative: the card's heading names the service. */
export function ServiceArt({ art }: { art: Service['art'] }) {
  const Drawing = DRAWINGS[art];
  return (
    <div className='svc-art' aria-hidden='true'>
      <Drawing />
    </div>
  );
}
