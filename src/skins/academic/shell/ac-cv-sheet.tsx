/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { CvSheets } from '@/components/cv/cv-sheets';
import { CvSkeleton } from '@/components/cv/cv-skeleton';
import { downloadCvPdf } from '@/components/cv/download-cv-pdf';
import { useCv } from '@/components/cv/use-cv';
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { cvCopy } from '@/content/copy/cv';
import { statesCopy } from '@/content/copy/states';
import { cvFileName, type CvModel } from '@/lib/cv/build-cv';
import { useCopy } from '@/lib/i18n/copy';
import { useAcOverlays } from '@/skins/academic/shell/overlay-context';
import { AcButton } from '@/skins/academic/ui/ac-button';
import { AC_FONT_VARS } from '@/skins/academic/ui/ac-fonts';
import { AcStateNotice } from '@/skins/academic/ui/ac-state-notice';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

/**
 * Creates the PDF on click. The label never changes (so the bar does not shift): the pen turns into a spinner and a polite status
 * announces the wait. A failure is reported through `onFailed`. Same function and same file name as Standard's button.
 */
function AcCvDownload({
  cv,
  fileName,
  onFailed,
}: {
  cv: CvModel | null;
  fileName: string;
  onFailed: (failed: boolean) => void;
}) {
  const copy = useCopy(cvCopy);
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (!cv || busy) return;
    setBusy(true);
    onFailed(false);
    try {
      await downloadCvPdf(cv, copy, fileName);
    } catch {
      onFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AcButton
        size='sm'
        disabled={!cv}
        aria-busy={busy}
        onClick={() => void download()}
      >
        {busy && <Loader2 aria-hidden='true' className='size-4 animate-spin' />}
        {copy.download}
      </AcButton>
      <span role='status' className='sr-only'>
        {busy ? copy.preparing : ''}
      </span>
    </>
  );
}

/** The bar and the sheets of the CV. It is mounted only while the sheet is open, so the data is read on demand. */
function AcCvContent() {
  const copy = useCopy(cvCopy);
  const states = useCopy(statesCopy);
  const { closeCv } = useAcOverlays();
  const { cv, fileName, isError, retry } = useCv();
  const [failed, setFailed] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const file = cvFileName(fileName, cv?.name ?? '', copy.fallbackFileName);
  const title = cv ? `${cv.name} ${copy.titleSuffix}` : copy.fallbackTitle;

  return (
    <>
      <div className='flex items-center justify-between gap-3 border-b-2 border-dashed border-ac-rule px-5 py-3 max-[720px]:px-3.5'>
        <DialogTitle className='ac-line min-w-0 font-ac-chalk break-words text-[30px]/[1.1] font-normal [--ul:var(--ac-accent)] [--ac-line-y:-3px] max-[720px]:text-[24px]'>
          {title}
        </DialogTitle>
        <div className='flex flex-none items-center gap-2.5'>
          <AcCvDownload cv={cv} fileName={file} onFailed={setFailed} />
          <DialogPrimitive.Close
            aria-label={copy.close}
            onClick={closeCv}
            className='grid size-9 cursor-pointer place-items-center rounded-full border-2 border-transparent text-ac-mute transition-colors hover:border-ac-mute pointer-coarse:size-11'
          >
            <AcIcon name='close' className='size-5' />
          </DialogPrimitive.Close>
        </div>
      </div>
      <DialogDescription className='sr-only'>
        {copy.description}
      </DialogDescription>
      {failed && (
        <p
          role='alert'
          className='m-0 bg-ac-accent/10 px-5 py-2 font-ac-note text-[17px] font-bold text-ac-accent max-[720px]:px-3.5'
        >
          {copy.downloadFailed}
        </p>
      )}
      <div
        ref={body}
        className='flex min-h-0 flex-1 flex-col overflow-y-auto bg-ac-stage/20 shadow-[inset_0_3px_10px_rgba(0,0,0,0.16)] [&>[role=region]]:bg-transparent'
      >
        {cv ? (
          <CvSheets cv={cv} />
        ) : isError ? (
          <div className='m-auto p-4'>
            <AcStateNotice
              kind='error'
              title={states.error.title(states.subjects.cv)}
              body={states.error.body}
            >
              <AcButton size='sm' onClick={retry}>
                {states.retry}
              </AcButton>
            </AcStateNotice>
          </div>
        ) : (
          <CvSkeleton />
        )}
      </div>
    </>
  );
}

/**
 * The CV: its A4 sheets (they stay white in both themes, as paper does) on the desk of a sheet of paper, with the Download PDF button, the
 * same CV and the same PDF as Standard. Esc, the close button or a click outside close it and focus goes back to the button that opened it.
 */
export function AcCvSheet() {
  const { cvOpen, closeCv } = useAcOverlays();
  return (
    <Dialog
      open={cvOpen}
      onOpenChange={(open) => {
        if (!open) closeCv();
      }}
    >
      <DialogPortal>
        <DialogOverlay className='bg-black/65 supports-backdrop-filter:backdrop-blur-none' />
        <DialogPrimitive.Popup
          data-slot='ac-cv-sheet'
          className={`ac-scope font-ac-serif fixed top-1/2 left-1/2 z-50 w-[min(1000px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 outline-none max-[720px]:top-auto max-[720px]:bottom-0 max-[720px]:left-0 max-[720px]:w-full max-[720px]:translate-x-0 max-[720px]:translate-y-0 ${AC_FONT_VARS}`}
        >
          <div className='ac-paper ac-tape flex h-[min(92vh,900px)] animate-[ac-lift_0.34s_cubic-bezier(0.2,0.8,0.25,1)] flex-col rounded-[2px] max-[720px]:h-[calc(100dvh-12px)]'>
            <AcCvContent />
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
