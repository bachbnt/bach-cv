/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { startTransition, useCallback, useMemo, useRef, useState } from 'react';
import { useLive } from '@/hooks/use-live';
import type { Doc, ProjectSort } from '@/lib/content/schema';
import {
  availableOf,
  facetCounts,
  FILTER_GROUPS,
  filterProjects,
  isFiltering,
  parseProjectQuery,
  parseSavedView,
  projectQueryString,
  resolveProjectView,
  sortProjects,
  splitTechOptions,
  techOptions,
  toggleValue,
  type FilterGroup,
  type RawView,
} from '@/lib/derive/project-view';

type Project = Doc<'projects'>;

/** localStorage key of the last order and filters the visitor chose on the Projects page. */
export const PROJECTS_VIEW_KEY = 'bach-cv-projects';

/** One choice of a filter: its value, the name to show (only the technologies have one; the rest are named by the copy of the skin) and how many projects it would show. */
export interface ChoiceView {
  value: string;
  label: string;
  count: number;
}

export interface GroupView {
  /** the filter is shown: it is on, the owner has not fixed its values and there is more than one thing to choose from */
  visible: boolean;
  selected: string[];
  options: ChoiceView[];
  /** picks or drops one value (the filters that take several) */
  toggle: (value: string) => void;
  /** picks exactly these values: `[]` is everything, `[value]` is that one alone (the chips of the kind, which take one) */
  set: (values: string[]) => void;
}

export interface ProjectView {
  /** the projects to show, filtered and in order */
  shown: Project[];
  /** how many projects there are before any filter */
  total: number;
  /** a filter is on (the owner's fixed ones count too) */
  filtering: boolean;
  /** a filter the visitor can take away is on: "Clear filters" has something to do */
  clearable: boolean;
  sort: {
    value: ProjectSort;
    /** what the visitor can pick, in the order of the site */
    options: ProjectSort[];
    /** the order can be picked: the owner has not fixed it and there is more than one */
    visible: boolean;
    set: (sort: ProjectSort) => void;
  };
  groups: Record<FilterGroup, GroupView>;
  /** the technologies split in the most used and the rest (behind "More"); a picked one is always in the first */
  tech: { top: ChoiceView[]; more: ChoiceView[] };
  search: { visible: boolean; value: string; set: (text: string) => void };
  /** takes every filter the visitor can take away off, and keeps the order */
  clear: () => void;
}

/** What the visitor chose before: the address first (a link can be sent to another), then the last time. A group of the address wins over the same one kept. */
const readChoice = (): RawView => {
  if (typeof window === 'undefined') return {};
  let kept: string | null = null;
  try {
    kept = window.localStorage.getItem(PROJECTS_VIEW_KEY);
  } catch {
    // storage blocked: nothing was kept
  }
  return {
    ...parseSavedView(kept),
    ...parseProjectQuery(window.location.search),
  };
};

/**
 * The Projects page for every skin: the projects the visitor sees (filtered, in order), the controls and what each shows, settled by the
 * owner's `site/live` `projects` settings, the address (`?sort=latest&tech=angular`, so a filtered page can be sent and Back comes to it) and
 * the last choice kept in the browser. What is settled and how is `lib/derive/project-view.ts`; a skin only draws it.
 */
export function useProjectView(
  projects: Project[],
  skills: Map<string, Doc<'skills'>>,
  /** the order the skin opens in when the owner has not said */
  fallbackSort?: ProjectSort,
  /** the list changes in a transition, which a skin that animates the swap can use (`<ViewTransition>`); a skin that does not asks for plain updates, so a checkbox is checked at once */
  { transition = true }: { transition?: boolean } = {},
): ProjectView {
  const config = useLive().projects;
  const [choice, setChoice] = useState<RawView>(readChoice);
  // the newest choice, also while a transition has not rendered it yet: two choices one after the other (a chip, then the order) must both count
  const latest = useRef(choice);
  const available = useMemo(
    () => availableOf(projects, skills),
    [projects, skills],
  );
  const defaults = useMemo(
    () => resolveProjectView({ config, available, fallbackSort }),
    [config, available, fallbackSort],
  );
  const view = useMemo(
    () => resolveProjectView({ config, available, url: choice, fallbackSort }),
    [config, available, choice, fallbackSort],
  );

  /**
   * A choice is kept in the browser and in the address (the other keys of the address, `?skin=`, stay). The list changes in a transition, which
   * a skin can animate (`<ViewTransition>`); the words of the search are urgent, so the box never lags behind the keys.
   */
  const choose = useCallback(
    (patch: RawView | ((latest: RawView) => RawView), urgent = !transition) => {
      const next = {
        ...latest.current,
        ...(typeof patch === 'function' ? patch(latest.current) : patch),
      };
      latest.current = next;
      if (urgent) setChoice(next);
      else startTransition(() => setChoice(next));
      const nextView = resolveProjectView({
        config,
        available,
        url: next,
        fallbackSort,
      });
      try {
        window.localStorage.setItem(PROJECTS_VIEW_KEY, JSON.stringify(next));
      } catch {
        // storage blocked: the choice lasts until the page is left
      }
      const { pathname, search, hash } = window.location;
      const query = projectQueryString(search, nextView, defaults);
      if (query !== search)
        window.history.replaceState(null, '', `${pathname}${query}${hash}`);
    },
    [config, available, defaults, fallbackSort, transition],
  );

  const counts = useMemo(
    () => facetCounts(projects, view.filters, skills),
    [projects, view.filters, skills],
  );

  const groups = useMemo(() => {
    const techNames = techOptions(projects, skills);
    const choicesOf = (group: FilterGroup): ChoiceView[] => {
      const offered = view.groups[group].options;
      const ordered =
        group === 'tech'
          ? techNames.filter((o) => offered.includes(o.id)).map((o) => o.id)
          : offered;
      return ordered.map((value) => ({
        value,
        label: group === 'tech' ? (skills.get(value)?.name ?? value) : value,
        count: counts[group].get(value) ?? 0,
      }));
    };
    return Object.fromEntries(
      FILTER_GROUPS.map((group) => [
        group,
        {
          visible: view.groups[group].visible,
          selected: view.groups[group].values,
          options: choicesOf(group),
          // from the newest choice, not from what is on the page: two clicks before the page has caught up must both count
          toggle: (value: string) =>
            choose((newest) => ({
              [group]: toggleValue(
                newest[group] ?? view.groups[group].values,
                value,
              ),
            })),
          set: (values: string[]) => choose({ [group]: values }),
        } satisfies GroupView,
      ]),
    ) as Record<FilterGroup, GroupView>;
  }, [projects, skills, view.groups, counts, choose]);

  const tech = useMemo(() => {
    const options = groups.tech.options;
    const { top, more } = splitTechOptions(
      options.map((o) => ({ id: o.value, name: o.label, count: o.count })),
      groups.tech.selected,
    );
    const back = (o: { id: string; name: string; count: number }) => ({
      value: o.id,
      label: o.name,
      count: o.count,
    });
    return { top: top.map(back), more: more.map(back) };
  }, [groups.tech]);

  const shown = useMemo(
    () =>
      sortProjects(
        filterProjects(projects, view.filters, skills),
        view.sort.value,
        skills,
      ),
    [projects, view.filters, view.sort.value, skills],
  );

  const clear = useCallback(
    () =>
      choose({
        tech: view.groups.tech.forced ? undefined : [],
        platform: view.groups.platform.forced ? undefined : [],
        kind: view.groups.kind.forced ? undefined : [],
        status: view.groups.status.forced ? undefined : [],
        q: '',
      }),
    [choose, view.groups],
  );

  const clearable =
    view.filters.text !== '' ||
    FILTER_GROUPS.some(
      (group) =>
        !view.groups[group].forced && view.groups[group].values.length > 0,
    );

  return {
    shown,
    total: projects.length,
    filtering: isFiltering(view.filters),
    clearable,
    sort: {
      value: view.sort.value,
      options: view.sort.options,
      visible: !view.sort.locked,
      set: (sort) => choose({ sort }),
    },
    groups,
    tech,
    search: {
      visible: view.search.visible,
      value: view.search.value,
      set: (text) => choose({ q: text }, true),
    },
    clear,
  };
}
