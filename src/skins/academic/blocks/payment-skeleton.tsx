/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicPaymentCopy } from '@/content/copy/academic-payment';
import { paymentCopy } from '@/content/copy/payment';
import { useCopy } from '@/lib/i18n/copy';
import { PAYMENT_TABLE_HEAD } from '@/skins/academic/blocks/payment-table';
import { AcRow } from '@/skins/academic/ui/ac-note';
import { AcPaper } from '@/skins/academic/ui/ac-paper';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcSkeletonLine } from '@/skins/academic/ui/ac-skeleton-line';

/**
 * The payment methods that are not written yet, in the layout of the loaded page: the note on the sticky slip is the page's own words, then a
 * highlighted method as a card with its QR code and a table with one more method (what the seed has), the margin note blank.
 */
export function PaymentSkeleton() {
  const copy = useCopy(paymentCopy);
  const words = useCopy(academicPaymentCopy);
  const note = (
    <>
      <AcSkeletonLine className='h-[34px]' barClassName='h-7 w-24' />
      <AcSkeletonLine className='mt-[3px] h-[21.45px]' barClassName='w-32' />
      <AcSkeletonLine className='mt-[3px] h-[21.45px]' barClassName='w-28' />
    </>
  );

  return (
    <AcRow tone='d' sticky note={note}>
      <AcPaper kind='sticky' className='mt-1'>
        <p className='m-0'>{copy.note}</p>
      </AcPaper>

      <section aria-hidden='true' className='mt-12'>
        <AcSkeletonLine className='h-10' barClassName='h-6 w-[207px]' />
        <div className='mt-6'>
          <AcPaper
            kind='card'
            wind={false}
            className='flex flex-wrap items-center gap-7 max-[640px]:flex-col max-[640px]:items-stretch'
          >
            <div className='w-[176px] flex-none bg-ac-polaroid px-2 pt-2 pb-9 shadow-ac-photo max-[640px]:self-center'>
              <AcSkeleton className='aspect-square h-auto w-full' />
            </div>
            <div className='min-w-0 flex-1'>
              <AcSkeleton className='h-[23px] w-[52px]' />
              <AcSkeletonLine
                className='mt-1.5 mb-2 h-[38px]'
                barClassName='h-6 w-2/5'
              />
              <div className='grid gap-1'>
                <div className='h-[54px]'>
                  <AcSkeleton className='h-3.5 w-24' />
                  <AcSkeleton className='mt-2 w-3/5' />
                </div>
                <div className='h-[47px]'>
                  <AcSkeleton className='h-3.5 w-28' />
                  <AcSkeleton className='mt-2 h-5 w-1/2' />
                </div>
              </div>
              <div className='mt-4 flex flex-wrap items-center gap-x-4 gap-y-2'>
                <AcSkeleton className='h-[41px] w-[141px]' />
                <AcSkeleton className='h-[41px] w-[153px]' />
              </div>
            </div>
          </AcPaper>
        </div>
      </section>

      <section className='mt-12'>
        <AcSkeletonLine className='h-10' barClassName='h-6 w-[195px]' />
        <div className='mt-5'>
          <table className='w-full table-fixed border-collapse border-y-[2.5px] border-ac-ink/70 max-[760px]:block'>
            <caption className='pb-3 text-left caption-top text-[0.94em]/[1.45] text-ac-mute max-[760px]:block'>
              {words.caption}
            </caption>
            <thead className='max-[760px]:hidden'>
              <tr>
                <th scope='col' className={`${PAYMENT_TABLE_HEAD} w-[30%]`}>
                  {words.columns.method}
                </th>
                <th scope='col' className={`${PAYMENT_TABLE_HEAD} w-[37%]`}>
                  {words.columns.account}
                </th>
                <th scope='col' className={PAYMENT_TABLE_HEAD}>
                  <span className='sr-only'>{words.columns.actions}</span>
                </th>
              </tr>
            </thead>
            <tbody aria-hidden='true' className='max-[760px]:block'>
              <tr className='h-[125px] max-[760px]:grid max-[760px]:h-auto max-[760px]:gap-y-2.5 max-[760px]:py-3.5'>
                <th
                  scope='row'
                  className='py-3 pr-3 text-left align-middle font-normal max-[760px]:block max-[760px]:p-0'
                >
                  <span className='flex items-center gap-3'>
                    <AcSkeleton className='size-10 flex-none' />
                    <span className='min-w-0 flex-1'>
                      <AcSkeleton className='w-3/5' />
                      <AcSkeleton className='mt-2.5 h-[23px] w-14' />
                    </span>
                  </span>
                </th>
                <td className='py-3 pr-3 align-middle max-[760px]:block max-[760px]:p-0'>
                  <AcSkeleton className='h-3.5 w-24' />
                  <AcSkeleton className='mt-2 w-3/5' />
                  <AcSkeleton className='mt-3 h-3.5 w-28' />
                  <AcSkeleton className='mt-2 h-5 w-1/2' />
                </td>
                <td className='py-3 align-middle max-[760px]:block max-[760px]:p-0'>
                  <div className='flex flex-col items-start gap-2 max-[760px]:flex-row max-[760px]:flex-wrap'>
                    <AcSkeleton className='h-9 w-[132px]' />
                    <AcSkeleton className='h-9 w-[91px]' />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </AcRow>
  );
}
