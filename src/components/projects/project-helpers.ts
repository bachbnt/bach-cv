/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { TagTone } from '@/components/tag';
import type { Doc, ProjectLink } from '@/lib/content/schema';

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
};

/** The link names of one language: the kind names plus the two stores worth naming. */
type LinkNames = Record<
  ProjectLink['kind'] | 'appStore' | 'googlePlay',
  string
>;

/**
 * The words on a project link. A known store host wins, then the generic name for the link kind.
 * The stored `label` is only a fallback: the seed has "Website" for every site and store link.
 */
export const linkLabel = (
  link: Pick<ProjectLink, 'kind' | 'url' | 'label'>,
  names: LinkNames,
) => {
  const host = hostOf(link.url);
  if (host === 'apps.apple.com') return names.appStore;
  if (host === 'play.google.com') return names.googlePlay;
  return link.kind === 'other' && link.label ? link.label : names[link.kind];
};

/** Puts values into the `{name}` slots of a copy string. */
export const fillCopy = (
  template: string,
  values: Record<string, string | number>,
) =>
  template.replace(/\{(\w+)\}/g, (slot, key: string) =>
    key in values ? String(values[key]) : slot,
  );

/** The order of the filter chips, as on the mockup. */
export const KIND_ORDER = [
  'personal',
  'freelance',
  'company',
  'academic',
] as const satisfies readonly Doc<'projects'>['kind'][];

/** Kinds that have at least one project, in the order the chips use. */
export const kindsPresent = (projects: Pick<Doc<'projects'>, 'kind'>[]) =>
  KIND_ORDER.filter((kind) => projects.some((p) => p.kind === kind));

/** Technology ids -> the skill documents, in the project's order. An id with no visible skill is left out. */
export const skillsOf = (
  technologies: string[],
  skills: Map<string, Doc<'skills'>>,
) =>
  technologies
    .map((id) => skills.get(id))
    .filter((s): s is Doc<'skills'> => s !== undefined);

/** The tag colour of a skill category, as on the mockup: mobile green, web blue, AI violet, tools amber. */
export const toneOf = (category: Doc<'skills'>['category']): TagTone =>
  category;
