/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { CvSheets } from '@/components/cv/cv-sheets';
import { CvSkeleton } from '@/components/cv/cv-skeleton';
import { downloadCvPdf } from '@/components/cv/download-cv-pdf';
import { useCv } from '@/components/cv/use-cv';
import { cvCopy } from '@/content/copy/cv';
import { statesCopy } from '@/content/copy/states';
import { travelOverlaysCopy } from '@/content/copy/travel-overlays';
import { travelShellCopy } from '@/content/copy/travel-shell';
import { cvFileName } from '@/lib/cv/build-cv';
import { useCopy } from '@/lib/i18n/copy';
import { CV_TRIGGER_ID } from '@/skins/travel/shell/header';
import { TlButton } from '@/skins/travel/ui/tl-button';
import { TlDialogShell } from '@/skins/travel/ui/tl-dialog-shell';
import { TlStateNotice } from '@/skins/travel/ui/tl-state-notice';

/**
 * The CV window, a boarding pass: the A4 sheets of the Standard preview (`CvSheets`) on a desk inside the dialog of the skin, with the
 * Standard PDF behind a Download PDF button in the title bar. The data is read when it opens (`useCv`), with the skeleton, the error and
 * Try again. Closing it gives the focus back to the Download CV button of the header.
 */
export function TlCvDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const copy = useCopy(cvCopy);
  const words = useCopy(travelOverlaysCopy).cv;
  const states = useCopy(statesCopy);
  const trip = useCopy(travelShellCopy).states;
  const { cv, fileName, isError, retry } = useCv();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const download = async () => {
    if (!cv || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await downloadCvPdf(
        cv,
        copy,
        cvFileName(fileName, cv.name, copy.fallbackFileName),
      );
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <TlDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={cv ? `${cv.name} ${copy.titleSuffix}` : copy.fallbackTitle}
      kicker={words.kicker}
      description={copy.description}
      closeLabel={copy.close}
      size='lg'
      className='h-[min(92dvh,900px)] max-[700px]:h-[calc(100dvh-12px)]'
      bodyClassName='[--paper:var(--tl-chip)]'
      finalFocus={() => document.getElementById(CV_TRIGGER_ID)}
      titleExtra={
        <>
          <TlButton
            variant='solid'
            disabled={!cv}
            aria-busy={busy}
            onClick={() => void download()}
          >
            {busy ? (
              <Loader2 aria-hidden='true' className='animate-spin' />
            ) : (
              <Download aria-hidden='true' />
            )}
            {copy.download}
          </TlButton>
          <span role='status' className='sr-only'>
            {busy ? copy.preparing : ''}
          </span>
        </>
      }
    >
      {failed && (
        <p
          role='alert'
          className='m-0 flex-none border-b border-tl-line bg-tl-coral-2 px-5 py-2 text-[13px] font-semibold text-tl-ink max-[700px]:px-4'
        >
          {copy.downloadFailed}
        </p>
      )}
      {cv ? (
        <CvSheets cv={cv} />
      ) : (
        <div className='flex min-h-0 flex-1 overflow-y-auto bg-tl-chip px-3 py-8 max-[820px]:py-3'>
          {isError ? (
            <TlStateNotice
              kind='error'
              kicker={trip.error}
              title={states.error.title(states.subjects.cv)}
              body={states.error.body}
              className='m-auto bg-tl-solid'
            >
              <TlButton variant='solid' onClick={retry}>
                {states.retry}
              </TlButton>
            </TlStateNotice>
          ) : (
            <CvSkeleton />
          )}
        </div>
      )}
    </TlDialogShell>
  );
}
