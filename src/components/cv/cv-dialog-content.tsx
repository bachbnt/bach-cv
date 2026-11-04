/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { CvDownloadButton } from '@/components/cv/cv-download-button';
import { CvSheets } from '@/components/cv/cv-sheets';
import { useCv } from '@/components/cv/use-cv';
import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cvCopy } from '@/content/copy/cv';
import { cvFileName } from '@/lib/cv/build-cv';
import { useCopy } from '@/lib/i18n/copy';

/** The title bar and the sheets. Mounted only while the dialog is open, so the data is read on demand. */
export function CvDialogContent() {
  const copy = useCopy(cvCopy);
  const { cv, fileName, isError } = useCv();
  const [failed, setFailed] = useState(false);
  const title = cv ? `${cv.name} ${copy.titleSuffix}` : copy.fallbackTitle;

  return (
    <>
      <div className='flex items-center justify-between gap-3 border-b bg-white px-5 py-3.5 max-[720px]:px-3.5 max-[720px]:py-3'>
        <DialogTitle className='min-w-0 truncate text-lg leading-tight font-bold tracking-[-0.02em] max-[720px]:text-base'>
          {title}
        </DialogTitle>
        <div className='flex flex-none items-center gap-2.5'>
          <CvDownloadButton
            cv={cv}
            fileName={cvFileName(
              fileName,
              cv?.name ?? '',
              copy.fallbackFileName,
            )}
            onFailed={setFailed}
          />
          <DialogClose
            aria-label={copy.close}
            render={
              <Button
                variant='outline'
                size='icon'
                className='border border-border active:bg-secondary max-[720px]:size-11'
              />
            }
          >
            <X aria-hidden='true' />
          </DialogClose>
        </div>
      </div>
      <DialogDescription className='sr-only'>
        {copy.description}
      </DialogDescription>
      {failed && (
        <p
          role='alert'
          className='bg-destructive/10 px-5 py-2 text-sm font-semibold text-destructive max-[720px]:px-3.5'
        >
          {copy.downloadFailed}
        </p>
      )}
      {cv ? (
        <CvSheets cv={cv} />
      ) : (
        <div className='flex flex-1 items-center justify-center bg-[#d5d8df] px-4 text-center text-sm text-muted-foreground'>
          <p role={isError ? 'alert' : 'status'}>
            {isError ? copy.loadFailed : copy.loading}
          </p>
        </div>
      )}
    </>
  );
}
