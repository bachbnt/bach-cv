/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';

/** What a scene or a transcript block says about the job in a few lines: the summary, or the tagline when there is no summary (as Standard's Resume does). */
export const introOf = (job: Pick<Doc<'experience'>, 'summary' | 'tagline'>) =>
  job.summary || job.tagline;

/** The key projects of a role, by rank. */
export function keyProjectsOf(
  job: Pick<Doc<'experience'>, 'projects'>,
): Doc<'experience'>['projects'] {
  return job.projects
    .filter((project) => project.highlight !== null)
    .sort((a, b) => (a.highlight ?? 0) - (b.highlight ?? 0));
}

/** The skills of a role that are known, in the order the role lists them. */
export function technologiesOf(
  ids: readonly string[],
  skills: ReadonlyMap<string, { name: string }>,
): { id: string; name: string }[] {
  return ids.flatMap((id) => {
    const skill = skills.get(id);
    return skill ? [{ id, name: skill.name }] : [];
  });
}

/** Fills the `{slot}`s of a copy string. */
export const fill = (
  template: string,
  values: Record<string, string | number>,
): string =>
  template.replace(/\{(\w+)\}/g, (slot, key: string) =>
    key in values ? String(values[key]) : slot,
  );
