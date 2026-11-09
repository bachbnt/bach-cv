/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words only the Academic skin has on the Certificates and Services pages: the "reviewer" label of a card, the seal in the margin, the
 * "work package" of a service and its Discuss button. Everything the pages say that Standard says too (titles, dates, form, states) is read
 * from `content/copy/certificates.ts` and `services.ts`.
 */
export const academicCertificatesServicesCopy = defineCopy(
  {
    certificates: {
      /** a small label above each certificate: it is a reviewer's card (decoration, so it is not read out) */
      reviewer: 'Reviewer {n}',
      issuedBy: 'Issued by',
      /** the seal at the end of a proof, in the margin (decoration) */
      seal: 'Q.E.D. ■',
      sealOne: '{n} certificate · latest {date}',
      sealMany: '{n} certificates · latest {date}',
    },
    services: {
      /** the label of a service as a work package of a proposal (decoration) */
      package: 'WP{n}',
      discuss: 'Discuss',
      discussLabel: 'Discuss {name}',
      noteOne: 'work package',
      noteMany: 'work packages',
    },
  },
  {
    certificates: {
      reviewer: 'Phản biện {n}',
      issuedBy: 'Cấp bởi',
      seal: 'Q.E.D. ■',
      sealOne: '{n} chứng chỉ · mới nhất {date}',
      sealMany: '{n} chứng chỉ · mới nhất {date}',
    },
    services: {
      package: 'GV{n}',
      discuss: 'Trao đổi',
      discussLabel: 'Trao đổi về {name}',
      noteOne: 'gói việc',
      noteMany: 'gói việc',
    },
  },
);
