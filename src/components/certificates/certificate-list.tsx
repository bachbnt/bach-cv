/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CertificateCard,
  type CertificateSkill,
} from '@/components/certificates/certificate-card';
import { formatIssued } from '@/components/certificates/format-issued';
import { Lightbox } from '@/components/lightbox/lightbox';
import { buttonVariants } from '@/components/ui/button';
import { certificatesCopy } from '@/content/copy/certificates';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from 'cn';
import { useContentQuery } from '@/lib/query/use-content';

/** The latest certificate large, the rest in a grid, and the preview dialog that steps through all of them. */
export function CertificateList() {
  const copy = useCopy(certificatesCopy);
  const { lang } = useLang();
  const certificates = useContentQuery('certificates');
  const { data: skills = [] } = useContentQuery('skills');
  const [index, setIndex] = useState<number | null>(null);

  const skillById = useMemo(
    () => new Map(skills.map((s) => [s.id, s])),
    [skills],
  );
  const items = certificates.data ?? [];
  const skillsOf = (ids: string[]): CertificateSkill[] =>
    ids.flatMap((id) => {
      const s = skillById.get(id);
      return s ? [{ id, name: s.name, tone: s.category }] : [];
    });

  if (certificates.isPending) {
    return (
      <div
        aria-busy='true'
        aria-label={copy.loading}
        className='h-[420px] animate-pulse rounded-3xl bg-muted'
      />
    );
  }
  if (certificates.isError) {
    return <p className='text-muted-foreground'>{copy.error}</p>;
  }
  if (!items.length) {
    return <p className='text-muted-foreground'>{copy.empty}</p>;
  }

  const [latest, ...rest] = items;
  const current = index === null ? null : items[index];
  const step = (by: number) =>
    setIndex((i) => ((i ?? 0) + by + items.length) % items.length);

  return (
    <>
      <CertificateCard
        featured
        certificate={latest}
        skills={skillsOf(latest.skills)}
        onOpen={() => setIndex(0)}
      />
      {rest.length > 0 && (
        <div className='mt-6 grid grid-cols-1 gap-6 min-[721px]:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]'>
          {rest.map((c, i) => (
            <CertificateCard
              key={c.id}
              certificate={c}
              skills={skillsOf(c.skills)}
              onOpen={() => setIndex(i + 1)}
            />
          ))}
        </div>
      )}

      {current && (
        <Lightbox
          open
          onOpenChange={(open) => !open && setIndex(null)}
          title={current.name}
          image={{ src: current.image, alt: copy.imageAlt(current.name) }}
          meta={
            <p>
              {copy.meta(current.issuer, formatIssued(current.issuedAt, lang))}
            </p>
          }
          closeLabel={copy.closePreview}
          actions={
            current.pdfUrl ? (
              <a
                href={current.pdfUrl}
                target='_blank'
                rel='noopener noreferrer'
                className={cn(buttonVariants(), 'pointer-coarse:h-11')}
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
      )}
    </>
  );
}
