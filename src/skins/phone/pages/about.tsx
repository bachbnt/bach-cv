/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { aboutCopy } from '@/content/copy/about';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { AboutCoreStack } from '@/skins/phone/blocks/about-core-stack';
import { AboutFacts } from '@/skins/phone/blocks/about-facts';
import { AboutHead } from '@/skins/phone/blocks/about-head';
import { HINGE_PANES } from '@/skins/phone/blocks/hinge-panes';
import { AboutPhotos } from '@/skins/phone/blocks/about-photos';
import { PhPage } from '@/skins/phone/ui/ph-page';

/**
 * About as the "About this device" screen of a phone: the card of its owner, the summary, the facts as grouped rows, the core stack and the
 * photos. On a tablet the owner and the photos are at the left and the facts and the stack at the right; on a phone it is one column.
 */
export function AboutPage() {
  const copy = useCopy(aboutCopy);
  return (
    <PhPage page='about' title={copy.title} wide>
      <div
        className={cn(
          'flex flex-col gap-6 @min-[900px]:grid @min-[900px]:grid-cols-2 @min-[900px]:items-start @min-[900px]:gap-x-8',
          HINGE_PANES,
        )}
      >
        <div className='contents @min-[900px]:flex @min-[900px]:flex-col @min-[900px]:gap-6'>
          <div className='flex flex-col gap-6 @max-[899px]:order-1'>
            <AboutHead />
          </div>
          <div className='@max-[899px]:order-4'>
            <AboutPhotos />
          </div>
        </div>
        <div className='contents @min-[900px]:flex @min-[900px]:flex-col @min-[900px]:gap-6'>
          <div className='@max-[899px]:order-2'>
            <AboutFacts />
          </div>
          <div className='@max-[899px]:order-3'>
            <AboutCoreStack />
          </div>
        </div>
      </div>
    </PhPage>
  );
}
