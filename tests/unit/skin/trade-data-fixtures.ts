/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { COLLECTIONS, type Doc } from '@/lib/content/schema';

export const skill = (
  id: string,
  category: Doc<'skills'>['category'] = 'tools',
): Doc<'skills'> => ({
  ...COLLECTIONS.skills.parse({ name: id.toUpperCase(), category, icon: id }),
  id,
});

export const project = (
  id: string,
  extra: Record<string, unknown> = {},
): Doc<'projects'> => ({
  ...COLLECTIONS.projects.parse({ name: id, ...extra }),
  id,
});

export const job = (
  id: string,
  startMonth: string,
  endMonth: string | null,
  extra: Record<string, unknown> = {},
): Doc<'experience'> => ({
  ...COLLECTIONS.experience.parse({
    company: id.toUpperCase(),
    shortName: id.toUpperCase(),
    role: `Role ${id}`,
    startMonth,
    endMonth,
    ...extra,
  }),
  id,
});

export const degree = (
  id: string,
  startMonth: string,
  endMonth: string | null,
): Doc<'education'> => ({
  ...COLLECTIONS.education.parse({
    degree: `Degree ${id}`,
    school: `School ${id}`,
    startMonth,
    endMonth,
  }),
  id,
});

export const certificate = (
  id: string,
  issuedAt: string,
  issuer = 'Issuer',
): Doc<'certificates'> => ({
  ...COLLECTIONS.certificates.parse({ name: id, issuer, issuedAt }),
  id,
});

export const skillMap = (...ids: string[]) =>
  new Map(ids.map((id) => [id, skill(id)]));
