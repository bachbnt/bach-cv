/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { formatIssued } from '@/components/certificates/format-issued';
import { academicCertificatesServicesCopy } from '@/content/copy/academic-certificates-services';
import type { Doc } from '@/lib/content/schema';
import { latestCertificate } from '@/lib/derive/recency';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { AcNoteCap } from '@/skins/academic/ui/ac-note';

/** The margin note of the page: a Q.E.D. seal (decoration) and the count of certificates with the date of the latest, which are real. */
export function CertificateSeal({ items }: { items: Doc<'certificates'>[] }) {
  const copy = useCopy(academicCertificatesServicesCopy).certificates;
  const { lang } = useLang();
  const latest = latestCertificate(items);
  if (!latest) return null;
  return (
    <>
      <span
        aria-hidden='true'
        className='inline-block -rotate-[7deg] rounded-[18px_7px_20px_8px/8px_20px_7px_18px] border-[3px] border-current px-4 pt-1 pb-[5px] font-ac-chalk text-[36px]/none'
      >
        {copy.seal}
      </span>
      <AcNoteCap>
        {fill(items.length === 1 ? copy.sealOne : copy.sealMany, {
          n: items.length,
          date: formatIssued(latest.issuedAt, lang),
        })}
      </AcNoteCap>
    </>
  );
}
