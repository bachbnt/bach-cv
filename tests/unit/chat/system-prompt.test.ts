/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildSystemPrompt, type ChatContext } from '@/lib/chat/system-prompt';
import {
  COLLECTIONS,
  profileSchema,
  type CollectionName,
  type Doc,
} from '@/lib/content/schema';

const seed = JSON.parse(
  readFileSync('tests/fixtures/seed.json', 'utf8'),
) as Record<string, Record<string, unknown>>;

const docs = <N extends CollectionName>(name: N): Doc<N>[] =>
  Object.entries(seed[name]).map(
    ([id, d]) => ({ ...COLLECTIONS[name].parse(d), id }) as unknown as Doc<N>,
  );

const context: ChatContext = {
  shell: { name: 'Bach', headline: 'Team Lead' },
  profile: profileSchema.parse(seed.site.profile),
  skills: docs('skills'),
  experience: docs('experience'),
  education: docs('education'),
  projects: docs('projects'),
  certificates: docs('certificates'),
  services: docs('services'),
  contacts: docs('contacts'),
};

describe('buildSystemPrompt', () => {
  it('describes the owner and the main sections', () => {
    const prompt = buildSystemPrompt(context);
    expect(prompt).toContain('## Profile');
    expect(prompt).toContain('## Work Experience');
    expect(prompt).toContain('FPT Software');
  });

  it('stays within the Worker limit', () => {
    for (const limit of [8000, 1500, 400]) {
      expect(
        buildSystemPrompt(context, 'en', limit).length,
      ).toBeLessThanOrEqual(limit);
    }
  });

  it('never includes hidden items or payment data', () => {
    const hidden = docs('experience').map((e) => ({ ...e, visible: false }));
    const prompt = buildSystemPrompt({ ...context, experience: hidden });
    expect(prompt).not.toContain('## Work Experience');
    expect(prompt).not.toMatch(/account|payment/i);
  });

  it('works with nothing loaded', () => {
    const prompt = buildSystemPrompt({ shell: { name: 'Bach', headline: '' } });
    expect(prompt).toContain('Bach');
  });

  it('asks for the visitor language', () => {
    expect(buildSystemPrompt(context, 'en')).toContain(
      'same language the visitor uses',
    );
    const vi = buildSystemPrompt(context, 'vi');
    expect(vi).toContain('answer in Vietnamese');
    expect(vi).not.toContain('same language the visitor uses');
  });

  it('quotes the translated documents in Vietnamese and the originals in English', () => {
    const translated = {
      ...context,
      profile: profileSchema.parse({
        ...(seed.site.profile as object),
        summary: 'Original summary',
        l10n: { vi: { summary: 'Tóm tắt tiếng Việt' } },
      }),
    };
    expect(buildSystemPrompt(translated, 'vi')).toContain('Tóm tắt tiếng Việt');
    expect(buildSystemPrompt(translated, 'en')).toContain('Original summary');
    expect(buildSystemPrompt(translated, 'en')).not.toContain('Tóm tắt');
  });
});
