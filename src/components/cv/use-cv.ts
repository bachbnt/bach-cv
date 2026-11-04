/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { cvCopy } from '@/content/copy/cv';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { buildCv, type CvModel } from '@/lib/cv/build-cv';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';

/**
 * Reads everything the CV is made of, in the visitor's language, and builds it. Only the dialog calls this,
 * so nothing is fetched until it opens. The CV is built again when the language changes.
 */
export function useCv(): {
  cv: CvModel | null;
  fileName: string;
  isError: boolean;
} {
  const { lang } = useLang();
  const copy = useCopy(cvCopy);
  const profile = useProfileQuery();
  const contacts = useContentQuery('contacts');
  const experience = useContentQuery('experience');
  const education = useContentQuery('education');
  const skills = useContentQuery('skills');
  const projects = useContentQuery('projects');
  const certificates = useContentQuery('certificates');

  const cv = useMemo(
    () =>
      contacts.data &&
      experience.data &&
      education.data &&
      skills.data &&
      projects.data &&
      certificates.data &&
      profile.data
        ? buildCv(
            {
              shell: localize(shell, lang),
              profile: profile.data,
              contacts: contacts.data,
              experience: experience.data,
              education: education.data,
              skills: skills.data,
              projects: projects.data,
              certificates: certificates.data,
            },
            copy,
            lang,
          )
        : null,
    [
      lang,
      copy,
      profile.data,
      contacts.data,
      experience.data,
      education.data,
      skills.data,
      projects.data,
      certificates.data,
    ],
  );

  return {
    cv,
    fileName: profile.data?.cvFileName ?? '',
    isError: [
      profile,
      contacts,
      experience,
      education,
      skills,
      projects,
      certificates,
    ].some((q) => q.isError),
  };
}
