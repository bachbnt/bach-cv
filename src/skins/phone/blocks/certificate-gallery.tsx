/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { formatIssued } from '@/components/certificates/format-issued';
import { certificatesCopy } from '@/content/copy/certificates';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { HINGE_PANES } from '@/skins/phone/blocks/hinge-panes';
import { CertificateCard } from '@/skins/phone/blocks/certificate-card';
import { CERTIFICATE_GRID } from '@/skins/phone/blocks/certificate-layout';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';

/**
 * The certificates as the cards of a Wallet, newest first (`items` is already in that order, as in Standard). The pictures open in the viewer
 * of the shell, which steps through all the certificates that have one. With an odd number of cards the first spans the width of a tablet, so
 * the last row is never half empty.
 */
export function CertificateGallery({
  items,
}: {
  items: Doc<'certificates'>[];
}) {
  const copy = useCopy(certificatesCopy);
  const { lang } = useLang();
  const { openViewer } = usePhOverlays();
  const { data: skills = [] } = useContentQuery('skills');
  const skillsById = useMemo(
    () => new Map(skills.map((skill) => [skill.id, skill])),
    [skills],
  );

  const pictured = items.filter((certificate) => certificate.image);
  const open = (id: string) =>
    openViewer(
      pictured.map((certificate) => ({
        src: certificate.image,
        title: certificate.name,
        subtitle: copy.meta(
          certificate.issuer,
          formatIssued(certificate.issuedAt, lang),
        ),
        caption: copy.imageAlt(certificate.name),
        links: certificate.pdfUrl
          ? [{ label: copy.openPdfDialog, url: certificate.pdfUrl }]
          : [],
        labels: {
          close: copy.closePreview,
          previous: copy.previousCertificate,
          next: copy.nextCertificate,
        },
      })),
      pictured.findIndex((certificate) => certificate.id === id),
    );

  return (
    <div className={cn(CERTIFICATE_GRID, HINGE_PANES)}>
      {items.map((certificate, index) => (
        <CertificateCard
          key={certificate.id}
          certificate={certificate}
          latest={index === 0}
          tone={index}
          wide={index === 0 && items.length % 2 === 1}
          skills={certificate.skills.flatMap((id) => skillsById.get(id) ?? [])}
          onOpen={() => open(certificate.id)}
        />
      ))}
    </div>
  );
}
