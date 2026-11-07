/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExternalLink } from 'lucide-react';
import dynamic from 'next/dynamic';
import { formatIssued } from '@/components/certificates/format-issued';
import { certificatesCopy } from '@/content/copy/certificates';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { stepIndex } from '@/skins/stream/config';
import { streamButtonVariants } from '@/skins/stream/ui/stream-button';

// the picture viewer is the Standard one, loaded when a visitor first opens a certificate
const Lightbox = dynamic(
  () => import('@/components/lightbox/lightbox').then((m) => m.Lightbox),
  { ssr: false },
);

/** Standard's picture viewer for the certificates: the same title, issuer line, Open PDF, previous / next and counter. */
export function LibraryCertificateViewer({
  items,
  index,
  onIndex,
}: {
  items: Doc<'certificates'>[];
  /** the open certificate, or null when the viewer is shut */
  index: number | null;
  onIndex: (index: number | null) => void;
}) {
  const copy = useCopy(certificatesCopy);
  const { lang } = useLang();
  const current = index === null ? null : items[index];
  if (index === null || !current) return null;
  const step = (by: number) => onIndex(stepIndex(index, by, items.length));

  return (
    <Lightbox
      open
      onOpenChange={(open) => !open && onIndex(null)}
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
            className={streamButtonVariants({ variant: 'solid' })}
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
              counter: copy.counter(index + 1, items.length),
            }
          : undefined
      }
    />
  );
}
