/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef, useState } from 'react';
import { CvSheets } from '@/components/cv/cv-sheets';
import { CvSkeleton } from '@/components/cv/cv-skeleton';
import { useCv } from '@/components/cv/use-cv';
import { DialogDescription } from '@/components/ui/dialog';
import { cvCopy } from '@/content/copy/cv';
import { devOverlaysCopy } from '@/content/copy/dev-overlays';
import { statesCopy } from '@/content/copy/states';
import { cvFileName } from '@/lib/cv/build-cv';
import { useCopy } from '@/lib/i18n/copy';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { DevCvDownload } from '@/skins/dev/shell/cv/dev-cv-download';
import {
  DevWindow,
  DevWindowBar,
  DevWindowDots,
  DevWindowSub,
  DevWindowTitle,
  DevWindowTools,
} from '@/skins/dev/shell/window-chrome';
import { DevStateNotice } from '@/skins/dev/ui/dev-state-notice';
import { DevButton } from '@/skins/dev/ui/dev-button';

/** The bar and the sheets of the CV window. It is mounted only while the window is open, so the data is read on demand. */
export function DevCvContent({
  maximized,
  onClose,
  onToggleMaximize,
}: {
  maximized: boolean;
  onClose: () => void;
  onToggleMaximize: () => void;
}) {
  const copy = useCopy(cvCopy);
  const states = useCopy(statesCopy);
  const extra = useCopy(devOverlaysCopy).cv;
  const { cv, fileName, isError, retry } = useCv();
  const [failed, setFailed] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const file = cvFileName(fileName, cv?.name ?? '', copy.fallbackFileName);
  const title = cv ? `${cv.name} ${copy.titleSuffix}` : copy.fallbackTitle;

  const scrollToTop = () =>
    body.current?.querySelector('[role="region"]')?.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });

  return (
    <DevWindow
      className={
        maximized
          ? 'h-dvh max-h-none w-full rounded-none'
          : 'w-[min(1000px,100%)] min-[701px]:h-[min(92vh,900px)]'
      }
    >
      <DevWindowBar>
        <DevWindowDots
          onClose={onClose}
          onMinimize={scrollToTop}
          minimizeLabel={extra.backToTop}
          onMaximize={onToggleMaximize}
          maximized={maximized}
        />
        <DevIcon
          name='file-pdf'
          className='flex-none text-sky max-[700px]:hidden'
        />
        <DevWindowTitle>{title}</DevWindowTitle>
        <DevWindowSub>{file}</DevWindowSub>
        <DevWindowTools>
          <DevCvDownload cv={cv} fileName={file} onFailed={setFailed} />
        </DevWindowTools>
      </DevWindowBar>
      <DialogDescription className='sr-only'>
        {copy.description}
      </DialogDescription>
      {failed && (
        <p
          role='alert'
          className='m-0 border-b border-line bg-[color-mix(in_srgb,var(--red)_12%,var(--bg))] px-[14px] py-2 font-sans text-[13px] leading-[normal] font-semibold text-err'
        >
          {copy.downloadFailed}
        </p>
      )}
      <div
        ref={body}
        className='flex min-h-0 flex-1 flex-col overflow-y-auto bg-chrome-2 [&>[role=region]]:bg-chrome-2'
      >
        {cv ? (
          <CvSheets cv={cv} />
        ) : isError ? (
          <DevStateNotice
            kind='error'
            title={states.error.title(states.subjects.cv)}
            body={states.error.body}
            className='m-auto'
          >
            <DevButton size='sm' onClick={retry}>
              {states.retry}
            </DevButton>
          </DevStateNotice>
        ) : (
          <CvSkeleton />
        )}
      </div>
    </DevWindow>
  );
}
