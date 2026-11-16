/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Globe, FolderKanban } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { projectsCopy } from '@/content/copy/projects';
import type { ChoiceView, GroupView } from '@/hooks/use-project-view';
import type { FilterGroup } from '@/lib/derive/project-view';
import {
  activeChoices,
  choiceLabel,
  firstOf,
  metaOf,
  PROJECT_GLYPHS,
} from '@/skins/phone/blocks/project-model';

const en = projectsCopy.en;
const vi = projectsCopy.vi;

const group = (
  selected: string[],
  options: ChoiceView[] = [],
  visible = true,
): GroupView => ({
  visible,
  selected,
  options,
  toggle: () => undefined,
  set: () => undefined,
});

const choice = (value: string, label = value): ChoiceView => ({
  value,
  label,
  count: 1,
});

describe('the name line of a project in the Phone skin', () => {
  it('is the kind, then the platforms', () => {
    expect(metaOf({ kind: 'company', platforms: ['mobile', 'web'] }, en)).toBe(
      'Company · Mobile, Web',
    );
    expect(metaOf({ kind: 'personal', platforms: ['desktop'] }, vi)).toBe(
      'Cá nhân · Máy tính',
    );
  });

  it('is only the kind for a project that names no platform', () => {
    expect(metaOf({ kind: 'academic', platforms: [] }, en)).toBe('Academic');
  });
});

describe('the glyph of a project tile', () => {
  it('is the one of its first platform, or a folder', () => {
    expect(PROJECT_GLYPHS.web).toBe(Globe);
    expect(PROJECT_GLYPHS.none).toBe(FolderKanban);
  });
});

describe('the first of a list', () => {
  it('keeps the first few and counts the rest', () => {
    expect(firstOf([1, 2, 3, 4, 5, 6], 4)).toEqual({
      shown: [1, 2, 3, 4],
      hidden: 2,
    });
    expect(firstOf([1, 2], 4)).toEqual({ shown: [1, 2], hidden: 0 });
  });
});

describe('the words of a choice', () => {
  it('come from the copy of the page, except for a technology, which has its own name', () => {
    expect(choiceLabel('kind', choice('freelance'), en)).toBe('Freelance');
    expect(choiceLabel('platform', choice('ai'), vi)).toBe('AI');
    expect(choiceLabel('status', choice('ongoing'), vi)).toBe('Đang chạy');
    expect(choiceLabel('tech', choice('nextjs', 'Next.js'), en)).toBe(
      'Next.js',
    );
  });
});

describe('the chips of the filters that are on', () => {
  const groups: Record<FilterGroup, GroupView> = {
    tech: group(['react'], [choice('react', 'ReactJS')]),
    platform: group(['mobile', 'ai']),
    kind: group(['company']),
    status: group([]),
  };

  it('go in the order of the sheet, one for each value, with the words of the page', () => {
    expect(activeChoices(groups, en).map((c) => c.label)).toEqual([
      'Company',
      'Mobile',
      'AI',
      'ReactJS',
    ]);
  });

  it('are not drawn for a filter that the visitor cannot change', () => {
    const fixed = { ...groups, platform: group(['mobile'], [], false) };
    expect(activeChoices(fixed, en).map((c) => c.group)).toEqual([
      'kind',
      'tech',
    ]);
  });

  it('keep a technology that is not offered under its id', () => {
    const lost = { ...groups, tech: group(['old-skill']) };
    expect(activeChoices(lost, en).at(-1)).toEqual({
      group: 'tech',
      value: 'old-skill',
      label: 'old-skill',
    });
  });
});
