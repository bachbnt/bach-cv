/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  FolderKanban,
  Globe,
  Monitor,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { projectsCopy } from '@/content/copy/projects';
import type { ChoiceView, GroupView } from '@/hooks/use-project-view';
import type { Doc, Platform } from '@/lib/content/schema';
import type { FilterGroup } from '@/lib/derive/project-view';

type ProjectsWords = (typeof projectsCopy)['en'];
type Project = Doc<'projects'>;

/** The glyph on the tile of a project: what it runs on (decoration, the platform is also written beside it), or a folder when it says nothing. */
export const PROJECT_GLYPHS: Record<Platform | 'none', LucideIcon> = {
  mobile: Smartphone,
  web: Globe,
  desktop: Monitor,
  ai: Sparkles,
  none: FolderKanban,
};

/** "Company · Mobile, Web": the kind, then the platforms the project runs on. */
export const metaOf = (
  project: Pick<Project, 'kind' | 'platforms'>,
  words: Pick<ProjectsWords, 'kinds' | 'platforms'>,
): string =>
  [
    words.kinds[project.kind],
    project.platforms.map((platform) => words.platforms[platform]).join(', '),
  ]
    .filter(Boolean)
    .join(' · ');

/** The first `max` of a list, and how many are left out (a row of the list has room for a few technologies, the detail lists them all). */
export const firstOf = <T>(
  items: T[],
  max: number,
): { shown: T[]; hidden: number } => ({
  shown: items.slice(0, max),
  hidden: Math.max(0, items.length - max),
});

/** The word of one choice of a filter: only the technologies carry their own name, the others are named by the copy of the page. */
export const choiceLabel = (
  group: FilterGroup,
  choice: ChoiceView,
  words: Pick<ProjectsWords, 'kinds' | 'platforms' | 'statuses'>,
): string => {
  const names: Record<string, string> | undefined =
    group === 'kind'
      ? words.kinds
      : group === 'platform'
        ? words.platforms
        : group === 'status'
          ? words.statuses
          : undefined;
  return names?.[choice.value] ?? choice.label;
};

interface ActiveChoice {
  group: FilterGroup;
  value: string;
  label: string;
}

const CHIP_ORDER = ['kind', 'platform', 'status', 'tech'] as const;

/**
 * The filters that are on and that the visitor can take away, as the chips under the buttons: in the order of the sheet. A filter the owner has
 * fixed or left out has no control, so it has no chip either.
 */
export const activeChoices = (
  groups: Record<FilterGroup, GroupView>,
  words: Pick<ProjectsWords, 'kinds' | 'platforms' | 'statuses'>,
): ActiveChoice[] =>
  CHIP_ORDER.flatMap((group) =>
    groups[group].visible
      ? groups[group].selected.map((value) => {
          const choice = groups[group].options.find((o) => o.value === value);
          return {
            group,
            value,
            label: choiceLabel(
              group,
              choice ?? { value, label: value, count: 0 },
              words,
            ),
          };
        })
      : [],
  );
