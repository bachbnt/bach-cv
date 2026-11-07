/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';

export interface MediaItem {
  /** `job:<id>` or `degree:<id>` */
  id: string;
  kind: 'job' | 'degree';
  src: string;
  /** the company or the school: the title of the preview */
  title: string;
  /** the role or the degree */
  subtitle: string;
  startMonth: string;
  endMonth: string | null;
  /** the alt text, as Standard writes it */
  alt: string;
}

/**
 * Every picture of the Resume page in the order the preview steps through them: the pictures of the roles (in the order of the
 * statement), then those of the degrees. An item with no picture is not in the list.
 */
export function buildMedia(
  jobs: Pick<
    Doc<'experience'>,
    'id' | 'logo' | 'company' | 'role' | 'startMonth' | 'endMonth'
  >[],
  degrees: Pick<
    Doc<'education'>,
    'id' | 'logo' | 'school' | 'degree' | 'startMonth' | 'endMonth'
  >[],
): MediaItem[] {
  return [
    ...jobs.flatMap((job) =>
      job.logo
        ? [
            {
              id: `job:${job.id}`,
              kind: 'job' as const,
              src: job.logo,
              title: job.company,
              subtitle: job.role,
              startMonth: job.startMonth,
              endMonth: job.endMonth,
              alt: job.company,
            },
          ]
        : [],
    ),
    ...degrees.flatMap((degree) =>
      degree.logo
        ? [
            {
              id: `degree:${degree.id}`,
              kind: 'degree' as const,
              src: degree.logo,
              title: degree.school,
              subtitle: degree.degree,
              startMonth: degree.startMonth,
              endMonth: degree.endMonth,
              alt: `${degree.degree}, ${degree.school}`,
            },
          ]
        : [],
    ),
  ];
}
