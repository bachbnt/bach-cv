/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { careerCopy } from '@/content/copy/stream-career';
import {
  fill,
  introOf,
  keyProjectsOf,
  technologiesOf,
} from '@/skins/stream/blocks/career-job';

const project = (name: string, highlight: number | null) => ({
  name,
  description: '',
  technologies: [],
  highlight,
  projectId: '',
});

describe('what a role says about itself', () => {
  it('uses the summary, or the tagline when there is none', () => {
    expect(introOf({ summary: 'S', tagline: 'T' })).toBe('S');
    expect(introOf({ summary: '', tagline: 'T' })).toBe('T');
    expect(introOf({ summary: '', tagline: '' })).toBe('');
  });

  it('keeps the key projects, by rank', () => {
    const projects = [project('c', 2), project('x', null), project('a', 1)];
    expect(keyProjectsOf({ projects }).map((p) => p.name)).toEqual(['a', 'c']);
  });

  it('keeps the known skills in the order the role lists them', () => {
    const skills = new Map([
      ['kotlin', { name: 'Kotlin' }],
      ['jira', { name: 'Jira' }],
    ]);
    expect(technologiesOf(['jira', 'gone', 'kotlin'], skills)).toEqual([
      { id: 'jira', name: 'Jira' },
      { id: 'kotlin', name: 'Kotlin' },
    ]);
  });

  it('fills the slots of a string and leaves an unknown slot', () => {
    expect(fill('{a}, {b}, {c}', { a: 'x', b: 2 })).toBe('x, 2, {c}');
  });
});

describe('the words of the career player', () => {
  it('has the same slots in both languages', () => {
    const slots = (text: string) => text.match(/\{\w+\}/g)?.sort() ?? [];
    expect(slots(careerCopy.vi.player.speed)).toEqual(
      slots(careerCopy.en.player.speed),
    );
    expect(slots(careerCopy.vi.chapters.item)).toEqual(
      slots(careerCopy.en.chapters.item),
    );
  });
});
