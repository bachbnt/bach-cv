/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  COLLECTIONS,
  profileSchema,
  localize,
  type CollectionName,
  type Lang,
  type Doc,
} from '@/lib/content/schema';
import { cvCopy } from '@/content/copy/cv';
import { buildCv, cvFileName, type CvInput } from '@/lib/cv/build-cv';

const seed = JSON.parse(readFileSync('tests/fixtures/seed.json', 'utf8'));

/** What the browser can read: only `visible` documents, parsed with the schema. */
const visible = <N extends CollectionName>(name: N): Doc<N>[] =>
  Object.entries(seed[name] as Record<string, unknown>)
    .map(
      ([id, doc]) =>
        ({ id, ...COLLECTIONS[name].parse(doc) }) as unknown as Doc<N>,
    )
    .filter((d) => d.visible);

const input = (): CvInput => ({
  shell: { name: 'Bach Bui', headline: 'Mobile Software Engineer' },
  profile: profileSchema.parse(seed.site.profile),
  contacts: visible('contacts'),
  experience: visible('experience'),
  education: visible('education'),
  skills: visible('skills'),
  projects: visible('projects'),
  certificates: visible('certificates'),
});

const build = (data: CvInput, lang: Lang = 'en') =>
  buildCv(data, cvCopy[lang], lang);

describe('buildCv', () => {
  it('takes the name from the profile and the headline from the shell', () => {
    const cv = build(input());
    expect(cv.name).toBe('Bùi Ngô Tôn Bách');
    expect(cv.headline).toBe('Mobile Software Engineer');
    expect(cv.summary).toContain('Master of Science');
  });

  it('lists phone, email and location', () => {
    const cv = build(input());
    expect(cv.contacts.map((c) => c.kind)).toEqual([
      'phone',
      'email',
      'location',
    ]);
    expect(cv.contacts[1].value).toBe('bachbnt@gmail.com');
    expect(cv.contacts[2].value).toBe('Ho Chi Minh City, Vietnam');
  });

  it('lists roles newest first and leaves out entries whose cv mode is off', () => {
    const cv = build(input());
    expect(cv.experience.map((r) => r.company)).toEqual([
      'FPT Software',
      'MoMo (M_Service)',
      'Devblock Vietnam',
    ]);
    // American Code Lab is visible but `cv: off`
    expect(cv.experience.some((r) => r.id === 'american-code-lab')).toBe(false);
  });

  it('prints a full entry with its summary, technologies, projects and bullets', () => {
    const fpt = build(input()).experience[0];
    expect(fpt.period).toBe('Jan 2026 – Present');
    expect(fpt.summary).toMatch(/FPT-scope functions/);
    expect(fpt.technologies).toContain('Jetpack Compose');
    expect(fpt.describedProjects.map((p) => p.name)).toEqual([
      '9PP - Yamato Transport',
    ]);
    expect(fpt.bullets).toHaveLength(7);
  });

  it('names a project that has no description in one line', () => {
    const momo = build(input()).experience[1];
    expect(momo.plainProjects).toEqual(['MoMo Super App']);
    expect(momo.describedProjects).toEqual([]);
    expect(momo.team).toBe('App Payment / App Platform Team');
  });

  it('prints a compact entry without summary and bullets, describing only highlighted projects', () => {
    const data = input();
    data.experience = data.experience.map((e) =>
      e.id === 'devblock-vietnam'
        ? {
            ...e,
            cv: 'compact',
            projects: e.projects.map((p, i) => ({
              ...p,
              highlight: i === 2 ? 1 : null,
            })),
          }
        : e,
    );
    const role = build(data).experience.find(
      (r) => r.id === 'devblock-vietnam',
    )!;
    expect(role.summary).toBe('');
    expect(role.bullets).toEqual([]);
    expect(role.describedProjects.map((p) => p.name)).toEqual(['HydroAssist']);
    expect(role.plainProjects).toEqual(['AppZocial', 'Evolve1', 'Zera']);
  });

  it('puts highlighted projects first in a full entry', () => {
    const data = input();
    data.experience = data.experience.map((e) =>
      e.id === 'devblock-vietnam'
        ? {
            ...e,
            projects: e.projects.map((p) => ({
              ...p,
              highlight: p.name === 'Zera' ? 1 : null,
            })),
          }
        : e,
    );
    const role = build(data).experience.find(
      (r) => r.id === 'devblock-vietnam',
    )!;
    expect(role.describedProjects[0].name).toBe('Zera');
  });

  it('skips hidden entries even if one slips in', () => {
    const data = input();
    data.experience = [
      ...data.experience,
      {
        ...data.experience[0],
        id: 'secret',
        company: 'Secret',
        visible: false,
      },
    ];
    expect(build(data).experience.some((r) => r.company === 'Secret')).toBe(
      false,
    );
  });

  it('writes education with the thesis and the technologies of the thesis', () => {
    const [master, bachelor] = build(input()).education;
    expect(master.degree).toBe('Master of Science');
    expect(master.period).toBe('Dec 2020 – Jun 2023');
    expect(master.thesis).toBe(
      'Stock Price Trend Prediction using Machine Learning',
    );
    expect(master.technologies).toEqual([
      'Python',
      'Keras',
      'LSTM',
      'Matplotlib',
    ]);
    expect(bachelor.thesis).toBe('Internal Social Network Application');
  });

  it('drops the thesis of a compact education entry and an off one', () => {
    const data = input();
    data.education = data.education.map((e) =>
      e.id === 'master' ? { ...e, cv: 'compact' } : { ...e, cv: 'off' },
    );
    const cv = build(data);
    expect(cv.education).toHaveLength(1);
    expect(cv.education[0].thesis).toBe('');
  });

  it('formats certificates as month and year, newest first', () => {
    const cv = build(input());
    expect(cv.certificates.map((c) => c.date)).toEqual([
      'Oct 2026',
      'May 2026',
      'Apr 2026',
    ]);
    expect(cv.certificates[0].name).toBe(
      'Claude Certified Architect - Professional',
    );
  });

  it('groups only listed skills by category, in sort order', () => {
    const groups = build(input()).skills;
    expect(groups.map((g) => g.id)).toEqual(['mobile', 'web', 'ai', 'tools']);
    const all = groups.flatMap((g) => g.skills);
    expect(all).toContain('Kotlin');
    expect(all).not.toContain('SQLite'); // listed: false
    expect(groups[0].skills[0]).toBe('Kotlin');
  });

  it('lists projects with a period only when they are dated', () => {
    const projects = build(input()).projects;
    const devcmd = projects.find((p) => p.id === 'devcmd')!;
    expect(devcmd.period).toBe('Feb 2024 – Present');
    expect(devcmd.technologies).toEqual(['NodeJS', 'MCP']);
    expect(projects.find((p) => p.id === 'beli-coffee')!.period).toBe('');
  });

  it('falls back to the shell name when the profile is missing', () => {
    const data = { ...input(), profile: undefined };
    const cv = build(data);
    expect(cv.name).toBe('Bach Bui');
    expect(cv.summary).toBe('');
  });
});

describe('cvFileName', () => {
  it('uses the configured name', () => {
    expect(cvFileName('bui-ngo-ton-bach-cv.pdf', 'x', 'cv.pdf')).toBe(
      'bui-ngo-ton-bach-cv.pdf',
    );
  });

  it('adds the extension when the configured name has none', () => {
    expect(cvFileName('My CV', 'x', 'cv.pdf')).toBe('My CV.pdf');
  });

  it('builds a slug from the name without accents', () => {
    expect(cvFileName('', 'Bùi Ngô Tôn Bách', 'cv.pdf')).toBe(
      'bui-ngo-ton-bach-cv.pdf',
    );
    expect(cvFileName('  ', 'Đào Văn', 'cv.pdf')).toBe('dao-van-cv.pdf');
  });

  it('has a last resort when nothing is known', () => {
    expect(cvFileName('', '', 'tep-cv.pdf')).toBe('tep-cv.pdf');
  });
});

describe('buildCv in Vietnamese', () => {
  /** Lays a Vietnamese overlay over the documents, the way `useContentQuery` does. */
  const vietnamese = (): CvInput => {
    const data = input();
    return {
      ...data,
      profile: localize(
        {
          ...data.profile!,
          l10n: { vi: { summary: 'Kỹ sư phần mềm di động.' } },
        },
        'vi',
      ),
      // only FPT is translated here, whatever the seed holds
      experience: data.experience.map((e) =>
        localize(
          {
            ...e,
            l10n:
              e.id === 'fpt-software' ? { vi: { role: 'Trưởng nhóm' } } : {},
          },
          'vi',
        ),
      ),
    };
  };

  it('writes the groups, dates and present in Vietnamese', () => {
    const cv = build(vietnamese(), 'vi');
    expect(cv.skills.map((g) => g.title)).toEqual([
      'Di động',
      'Frontend và backend',
      'AI & tự động hóa',
      'Công cụ',
    ]);
    expect(cv.experience[0].period).toBe('Thg 1 2026 – Nay');
    expect(cv.experience[1].period).toBe('Thg 5 2022 – Thg 1 2026');
    expect(cv.education[0].period).toBe('Thg 12 2020 – Thg 6 2023');
    expect(cv.certificates.map((c) => c.date)).toEqual([
      'Thg 10 2026',
      'Thg 5 2026',
      'Thg 4 2026',
    ]);
    expect(cv.projects.find((p) => p.id === 'devcmd')!.period).toBe(
      'Thg 2 2024 – Nay',
    );
  });

  it('uses the translated documents and keeps English where there is no translation', () => {
    const cv = build(vietnamese(), 'vi');
    expect(cv.summary).toBe('Kỹ sư phần mềm di động.');
    expect(cv.experience[0].role).toBe('Trưởng nhóm');
    expect(cv.experience[1].role).toBe('Senior Mobile App Developer');
  });

  it('keeps the same entries in both languages', () => {
    const en = build(input(), 'en');
    const vi = build(vietnamese(), 'vi');
    expect(vi.experience.map((r) => r.id)).toEqual(
      en.experience.map((r) => r.id),
    );
    expect(vi.projects).toHaveLength(en.projects.length);
  });
});
