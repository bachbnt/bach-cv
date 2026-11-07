/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { resumeCopy } from '@/content/copy/resume';
import {
  evidenceLine,
  placeTip,
  tipText,
} from '@/components/skills/skill-text';
import { COLLECTIONS, type Doc } from '@/lib/content/schema';
import { skillEvidence } from '@/lib/derive/skill-use';

const { evidence, tip } = resumeCopy.en.skills;
const vi = resumeCopy.vi.skills;

describe('evidenceLine', () => {
  it('joins the places with a middle dot', () => {
    expect(
      evidenceLine({ usedAt: ['FPT', 'MoMo'], since: 2022 }, evidence),
    ).toBe('Used at FPT · MoMo');
  });

  it('is empty without evidence', () => {
    expect(evidenceLine(undefined, evidence)).toBe('');
    expect(evidenceLine({ usedAt: [], since: null }, evidence)).toBe('');
  });
});

describe('in Vietnamese', () => {
  it('translates the side projects label, the tip and the first year', () => {
    expect(
      evidenceLine(
        { usedAt: ['FPT', 'Side projects'], since: 2022 },
        vi.evidence,
      ),
    ).toBe('Đã dùng tại FPT · Dự án cá nhân');
    expect(
      tipText(
        { usedAt: ['FPT', 'MoMo', 'Side projects'], since: 2022 },
        vi.tip,
      ),
    ).toBe(
      'Đã dùng tại FPT, MoMo và trong các dự án cá nhân. Dùng lần đầu năm 2022.',
    );
    expect(tipText({ usedAt: ['Side projects'], since: null }, vi.tip)).toBe(
      'Đã dùng trong các dự án cá nhân.',
    );
    expect(tipText(undefined, vi.tip)).toBe(vi.tip.none);
  });
});

describe('tipText', () => {
  it('lists roles, then side projects, then the first year', () => {
    expect(tipText({ usedAt: ['FPT', 'MoMo'], since: 2022 }, tip)).toBe(
      'Used at FPT, MoMo. First used 2022.',
    );
    expect(
      tipText(
        { usedAt: ['MoMo', 'Devblock', 'Side projects'], since: 2019 },
        tip,
      ),
    ).toBe('Used at MoMo, Devblock and in side projects. First used 2019.');
    expect(
      tipText({ usedAt: ['FPT', 'Side projects'], since: 2022 }, tip),
    ).toBe('Used at FPT and in side projects. First used 2022.');
  });

  it('handles side projects only, no year, and no evidence', () => {
    expect(tipText({ usedAt: ['Side projects'], since: 2024 }, tip)).toBe(
      'Used in side projects. First used 2024.',
    );
    expect(tipText({ usedAt: ['FPT'], since: null }, tip)).toBe('Used at FPT.');
    expect(tipText(undefined, tip)).toBe(tip.none);
  });
});

describe('placeTip', () => {
  const chip = { left: 100, top: 300, width: 80, bottom: 332 };

  it('centres the tip above the chip', () => {
    expect(placeTip(chip, { width: 200, height: 40 }, 1000)).toEqual({
      left: 40,
      top: 250,
      arrow: 100,
      below: false,
    });
  });

  it('stays 8px inside the viewport and moves the arrow', () => {
    const place = placeTip(
      { left: 0, top: 300, width: 40, bottom: 332 },
      { width: 200, height: 40 },
      390,
    );
    expect(place.left).toBe(8);
    expect(place.arrow).toBe(12);
  });

  it('goes below the chip when there is no room above', () => {
    const place = placeTip(
      { left: 100, top: 20, width: 80, bottom: 52 },
      { width: 200, height: 40 },
      1000,
    );
    expect(place).toMatchObject({ below: true, top: 62 });
  });
});

describe('the seed', () => {
  const seed = JSON.parse(
    readFileSync('tests/fixtures/seed.json', 'utf8'),
  ) as Record<string, Record<string, unknown>>;
  const docs = <N extends keyof typeof COLLECTIONS>(name: N) =>
    Object.entries(seed[name]).map(([id, raw]) => ({
      id,
      ...COLLECTIONS[name].parse(raw),
    })) as unknown as Doc<N>[];

  it('gives the core stack the evidence the mockup shows', () => {
    const map = skillEvidence(docs('experience'), docs('projects'));
    expect(map.get('kotlin')).toEqual({ usedAt: ['FPT', 'MoMo'], since: 2022 });
    expect(map.get('python')?.usedAt).toEqual(['FPT', 'Side projects']);
    expect(map.get('claude-code')?.usedAt).toEqual(['FPT']);
  });
});
