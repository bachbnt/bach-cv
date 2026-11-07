/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExternalLink } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { formatIssued } from '@/components/certificates/format-issued';
import { certificatesCopy } from '@/content/copy/certificates';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { LazyLightbox } from '@/skins/trade/blocks/lazy-dialogs';
import { tvButton } from '@/skins/trade/ui/tv-button';

/**
 * The Standard preview window of a certificate, stepping through `items` (previous and next, the counter, Open PDF). Returns the function
 * that opens it at an index and the element to render. The window is loaded when it is first opened.
 */
export function useCertPreview(
  items: Doc<'certificates'>[],
): [open: (index: number) => void, dialog: ReactNode] {
  const copy = useCopy(certificatesCopy);
  const { lang } = useLang();
  const [index, setIndex] = useState<number | null>(null);
  const current = index === null ? undefined : items[index];
  const step = (by: number) =>
    setIndex((i) => ((i ?? 0) + by + items.length) % items.length);

  const dialog = current && (
    <LazyLightbox
      open
      onOpenChange={(open) => !open && setIndex(null)}
      title={current.name}
      image={{ src: current.image, alt: copy.imageAlt(current.name) }}
      meta={
        <p>{copy.meta(current.issuer, formatIssued(current.issuedAt, lang))}</p>
      }
      closeLabel={copy.closePreview}
      actions={
        current.pdfUrl ? (
          <a
            href={current.pdfUrl}
            target='_blank'
            rel='noopener noreferrer'
            className={tvButton({ variant: 'outline' })}
          >
            <ExternalLink aria-hidden='true' />
            {copy.openPdfDialog}
          </a>
        ) : null
      }
      nav={
        items.length > 1
          ? {
              onPrev: () => step(-1),
              onNext: () => step(1),
              prevLabel: copy.previousCertificate,
              nextLabel: copy.nextCertificate,
              counter: copy.counter((index ?? 0) + 1, items.length),
            }
          : undefined
      }
    />
  );
  return [setIndex, dialog];
}
