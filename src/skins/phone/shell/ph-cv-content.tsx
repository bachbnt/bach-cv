/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { CvSheets } from '@/components/cv/cv-sheets';
import { CvSkeleton } from '@/components/cv/cv-skeleton';
import { useCv } from '@/components/cv/use-cv';
import { DialogDescription } from '@/components/ui/dialog';
import { cvCopy } from '@/content/copy/cv';
import { statesCopy } from '@/content/copy/states';
import { cvFileName } from '@/lib/cv/build-cv';
import { useCopy } from '@/lib/i18n/copy';
import { PhCvDownload } from '@/skins/phone/shell/ph-cv-download';
import { PhCvPages } from '@/skins/phone/shell/ph-cv-pages';
import { PhOverlayBar } from '@/skins/phone/shell/ph-overlay-bar';
import { PhButton } from '@/skins/phone/ui/ph-button';
import { PhStateNotice } from '@/skins/phone/ui/ph-state-notice';

/** The bar and the sheets of the CV. It is mounted only while the sheet is open, so the data is read on demand. */
export function PhCvContent() {
  const copy = useCopy(cvCopy);
  const states = useCopy(statesCopy);
  const { cv, fileName, isError, retry } = useCv();
  const [failed, setFailed] = useState(false);
  const title = cv ? `${cv.name} ${copy.titleSuffix}` : copy.fallbackTitle;

  return (
    <>
      <PhOverlayBar
        title={title}
        actions={
          <PhCvDownload
            cv={cv}
            fileName={cvFileName(
              fileName,
              cv?.name ?? '',
              copy.fallbackFileName,
            )}
            onFailed={setFailed}
          />
        }
        closeLabel={copy.close}
      />
      <DialogDescription className='sr-only'>
        {copy.description}
      </DialogDescription>
      {failed && (
        <p
          role='alert'
          className='m-0 shrink-0 bg-ph-danger/10 px-5 py-2.5 text-[15px] font-semibold text-ph-danger'
        >
          {copy.downloadFailed}
        </p>
      )}
      <div className='flex min-h-0 flex-1 flex-col bg-ph-sheet-2 [&_[role=region]]:bg-transparent'>
        {cv ? (
          <PhCvPages>
            <CvSheets cv={cv} />
          </PhCvPages>
        ) : isError ? (
          <div className='m-auto p-4'>
            <PhStateNotice
              kind='error'
              title={states.error.title(states.subjects.cv)}
              body={states.error.body}
            >
              <PhButton variant='solid' onClick={retry}>
                {states.retry}
              </PhButton>
            </PhStateNotice>
          </div>
        ) : (
          <div className='flex min-h-0 flex-1 overflow-y-auto p-3'>
            <CvSkeleton />
          </div>
        )}
      </div>
    </>
  );
}
