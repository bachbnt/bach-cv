/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Download, Loader2 } from 'lucide-react';
import { useCallback, useState, type KeyboardEvent } from 'react';
import { downloadCvPdf } from '@/components/cv/download-cv-pdf';
import { useCv } from '@/components/cv/use-cv';
import { cvCopy, pageLabel } from '@/content/copy/cv';
import { statesCopy } from '@/content/copy/states';
import { tradeOverlayCopy } from '@/content/copy/trade-overlay';
import { cvFileName } from '@/lib/cv/build-cv';
import { useCopy } from '@/lib/i18n/copy';
import { TvDialogShell } from '@/skins/trade/shell/overlay-dialog-shell';
import { TvToolbar } from '@/skins/trade/shell/overlay-toolbar';
import { zoomFromKey } from '@/skins/trade/shell/overlay-tools';
import { TvZoomTools } from '@/skins/trade/shell/overlay-zoom-tools';
import { CV_ZOOMS, TvCvSheets } from '@/skins/trade/shell/overlay-cv-sheets';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';
import { TvStateNotice } from '@/skins/trade/ui/tv-state-notice';

/** The step of `CV_ZOOMS` that fits the width of the window. */
const FIT = 1;

/**
 * The CV window: the A4 sheets of the Standard preview inside the dialog of the skin, with a toolbar for Download PDF (the Standard
 * PDF), the page that is in view and the zoom. The data is read when it opens (`useCv`), with the skeleton, the error and Try again.
 */
export function TvCvDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const copy = useCopy(cvCopy);
  const words = useCopy(tradeOverlayCopy).cv;
  const states = useCopy(statesCopy);
  const { cv, fileName, isError, retry } = useCv();
  const [step, setStep] = useState(FIT);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const onPages = useCallback((n: number) => {
    setTotal(n);
    setPage(1);
  }, []);

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
  const last = CV_ZOOMS.length - 1;
  const onKeyDown = (event: KeyboardEvent) => {
    const next = zoomFromKey(event.key, step, last, FIT);
    if (next !== null && cv) setStep(next);
  };
  const percent = Math.round(CV_ZOOMS[step] * 100);

  return (
    <TvDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={cv ? `${cv.name} ${copy.titleSuffix}` : copy.fallbackTitle}
      description={copy.description}
      closeLabel={copy.close}
      size='lg'
      phone='full'
      className='h-[min(92dvh,900px)]'
      onKeyDown={onKeyDown}
    >
      <TvToolbar
        label={words.tools}
        zoom={
          <TvZoomTools
            words={words}
            step={step}
            last={last}
            fit={FIT}
            percent={percent}
            onStep={setStep}
            disabled={!cv}
          />
        }
        actions={
          <>
            <TvButton
              variant='primary'
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
            </TvButton>
            <span role='status' className='sr-only'>
              {busy ? copy.preparing : ''}
            </span>
          </>
        }
        end={
          total > 0 && (
            <span
              aria-live='polite'
              className='min-w-12 px-2 text-center text-xs text-tv-mute tabular-nums'
            >
              {pageLabel(copy, page, total)}
            </span>
          )
        }
      />
      {failed && (
        <p
          role='alert'
          className='border-b border-tv-line bg-tv-down-bg px-4 py-2 text-xs font-semibold text-tv-down'
        >
          {copy.downloadFailed}
        </p>
      )}
      {cv ? (
        <TvCvSheets cv={cv} step={step} onPages={onPages} onPage={setPage} />
      ) : (
        <div className='flex min-h-0 flex-1 overflow-y-auto bg-tv-bg p-4'>
          {isError ? (
            <TvStateNotice
              kind='error'
              title={states.error.title(states.subjects.cv)}
              body={states.error.body}
              className='m-auto'
            >
              <TvButton variant='primary' onClick={retry}>
                {states.retry}
              </TvButton>
            </TvStateNotice>
          ) : (
            <div
              role='status'
              aria-busy='true'
              aria-label={states.loading}
              className='m-auto grid w-[min(794px,100%)] gap-3 bg-tv-panel p-8'
            >
              <TvSkeleton className='h-8 w-1/2' />
              <TvSkeleton className='h-4 w-1/3' />
              <TvSkeleton className='mt-4 h-24' />
              <TvSkeleton className='h-24' />
            </div>
          )}
        </div>
      )}
    </TvDialogShell>
  );
}
