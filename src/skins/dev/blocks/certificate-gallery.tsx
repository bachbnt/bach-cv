/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { formatIssued } from '@/components/certificates/format-issued';
import { toneOf } from '@/components/projects/project-helpers';
import { certificatesCopy } from '@/content/copy/certificates';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { DevCertificateCard } from '@/skins/dev/blocks/certificate-card';
import { useDevOverlays } from '@/skins/dev/shell/dev-overlay-context';

/** The latest certificate large, the rest in a grid; the pictures open in the viewer of the shell, which steps through all of them. */
export function DevCertificateGallery() {
  const copy = useCopy(certificatesCopy);
  const { lang } = useLang();
  const { openViewer } = useDevOverlays();
  const { data: certificates = [] } = useContentQuery('certificates');
  const { data: skills = [] } = useContentQuery('skills');
  const skillById = useMemo(
    () => new Map(skills.map((s) => [s.id, s])),
    [skills],
  );

  const pictured = certificates.filter((c) => c.image);
  const open = (id: string) => {
    openViewer(
      pictured.map((c) => ({
        src: c.image,
        title: c.name,
        subtitle: copy.meta(c.issuer, formatIssued(c.issuedAt, lang)),
        caption: copy.imageAlt(c.name),
        tags: c.skills.flatMap((skillId) => {
          const skill = skillById.get(skillId);
          return skill
            ? [{ label: skill.name, tone: toneOf(skill.category) }]
            : [];
        }),
        links: c.pdfUrl ? [{ label: copy.openPdfDialog, url: c.pdfUrl }] : [],
        labels: {
          close: copy.closePreview,
          previous: copy.previousCertificate,
          next: copy.nextCertificate,
        },
      })),
      pictured.findIndex((c) => c.id === id),
    );
  };

  return (
    <div className='grid grid-cols-[repeat(2,1fr)] gap-[18px] max-[620px]:grid-cols-[1fr]'>
      {certificates.map((certificate, index) => (
        <DevCertificateCard
          key={certificate.id}
          certificate={certificate}
          skills={skillById}
          featured={index === 0}
          index={index}
          onOpen={() => open(certificate.id)}
        />
      ))}
    </div>
  );
}
