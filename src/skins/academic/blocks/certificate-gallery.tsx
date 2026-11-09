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
import { CertificateCard } from '@/skins/academic/blocks/certificate-card';
import { useAcOverlays } from '@/skins/academic/shell/overlay-context';

/**
 * The certificates as a pile of reviewer cards, newest first (`items` is already in that order, as in Standard). The pictures open in the viewer
 * of the shell, which steps through all the certificates that have one.
 */
export function CertificateGallery({
  items,
}: {
  items: Doc<'certificates'>[];
}) {
  const copy = useCopy(certificatesCopy);
  const { lang } = useLang();
  const { openViewer } = useAcOverlays();
  const { data: skills = [] } = useContentQuery('skills');
  const skillNames = useMemo(
    () => new Map(skills.map((skill) => [skill.id, skill.name])),
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
    <div className='flex flex-col gap-7 pt-3'>
      {items.map((certificate, index) => (
        <CertificateCard
          key={certificate.id}
          certificate={certificate}
          position={index + 1}
          latest={index === 0}
          skills={certificate.skills.flatMap((id) => {
            const name = skillNames.get(id);
            return name ? [name] : [];
          })}
          onOpen={() => open(certificate.id)}
        />
      ))}
    </div>
  );
}
