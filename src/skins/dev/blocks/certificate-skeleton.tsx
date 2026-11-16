/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { CERTIFICATE_GRID } from '@/skins/dev/blocks/certificate-gallery';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevSkeletonBar } from '@/skins/dev/ui/dev-skeleton-bar';

/** The latest certificate large (picture at the left, text at the right) and two in the grid under it, in the sizes of the loaded cards. */
export function DevCertificateSkeleton() {
  return (
    <div className={CERTIFICATE_GRID}>
      <DevSkeleton
        data-skeleton='item'
        className='col-[1/-1] grid h-[338px] grid-cols-[1.1fr_1fr] max-[1279px]:h-[411px] max-[900px]:h-[571px] max-[900px]:grid-cols-[1fr] max-[620px]:h-[658px]'
      >
        <DevSkeletonBar className='h-full min-h-[320px] rounded-none border-r border-line-2' />
        <div className='grid content-start gap-3 px-[22px] pt-[18px] pb-[22px]'>
          <DevSkeletonBar className='h-[18px] w-16 rounded-full' />
          <DevSkeletonBar className='h-[33px] w-4/5' />
          <DevSkeletonBar className='h-[33px] w-3/5' />
          <DevSkeletonBar className='h-[17px] w-36' />
          <DevSkeletonBar className='h-[23px] w-28' />
        </div>
      </DevSkeleton>
      {[0, 1].map((n) => (
        <DevSkeleton
          key={n}
          className='flex h-[542px] flex-col max-[1279px]:h-[525px] max-[900px]:h-[534px] max-[620px]:h-[521px]'
        >
          <DevSkeletonBar className='aspect-[16/11] w-full rounded-none border-b border-line-2' />
          <div className='grid content-start gap-3 px-[22px] pt-[18px] pb-[22px]'>
            <DevSkeletonBar className='h-[26px] w-4/5' />
            <DevSkeletonBar className='h-[26px] w-3/5' />
            <DevSkeletonBar className='h-[17px] w-36' />
            <DevSkeletonBar className='h-[23px] w-28' />
          </div>
        </DevSkeleton>
      ))}
    </div>
  );
}
