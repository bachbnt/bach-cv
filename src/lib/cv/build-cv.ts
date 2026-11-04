/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CvCopy } from '@/content/copy/cv';
import type { Doc, Lang, Profile, Shell } from '@/lib/content/schema';
import { formatMonth, formatPeriod } from '@/lib/format';

/**
 * The CV as plain data. The preview sheets and the PDF both render this one model,
 * so what you see is what you download.
 */
export interface CvContact {
  kind: 'phone' | 'email' | 'location';
  value: string;
}

export interface CvProjectLine {
  name: string;
  description: string;
}

export interface CvRole {
  id: string;
  company: string;
  role: string;
  team: string;
  period: string;
  summary: string;
  technologies: string[];
  /** projects shown by name only, in one line */
  plainProjects: string[];
  /** projects shown with their description */
  describedProjects: CvProjectLine[];
  bullets: string[];
}

export interface CvEducationItem {
  id: string;
  period: string;
  degree: string;
  school: string;
  major: string;
  thesis: string;
  technologies: string[];
}

export interface CvCertificate {
  id: string;
  date: string;
  name: string;
}

export interface CvSkillGroup {
  id: string;
  title: string;
  skills: string[];
}

export interface CvProjectItem {
  id: string;
  name: string;
  period: string;
  description: string;
  technologies: string[];
}

export interface CvModel {
  name: string;
  headline: string;
  contacts: CvContact[];
  summary: string;
  experience: CvRole[];
  education: CvEducationItem[];
  certificates: CvCertificate[];
  skills: CvSkillGroup[];
  projects: CvProjectItem[];
}

export interface CvInput {
  shell: Pick<Shell, 'name' | 'headline'>;
  profile: Pick<Profile, 'fullName' | 'summary' | 'location'> | undefined;
  contacts: Doc<'contacts'>[];
  experience: Doc<'experience'>[];
  education: Doc<'education'>[];
  skills: Doc<'skills'>[];
  projects: Doc<'projects'>[];
  certificates: Doc<'certificates'>[];
}

const SKILL_GROUP_ORDER = ['mobile', 'web', 'ai', 'tools'] as const;

/** A role with no end comes first, then the latest end, then the latest start. */
const recency = (d: { startMonth: string; endMonth: string | null }) =>
  `${d.endMonth ?? '9999-12'} ${d.startMonth}`;
const newestFirst = <T extends { startMonth: string; endMonth: string | null }>(
  items: T[],
): T[] => [...items].sort((a, b) => recency(b).localeCompare(recency(a)));

const rank = (highlight: number | null) =>
  highlight ?? Number.POSITIVE_INFINITY;

/**
 * Builds the CV from visible documents, already laid over with the visitor's language (`l10n`).
 * `copy` and `lang` give the interface words and the date format. The browser can only read documents marked `visible`,
 * so anything hidden in the data never reaches the CV either.
 * `experience.cv` and `education.cv` decide how much of an entry is printed: full, compact (no summary,
 * no responsibilities, only highlighted projects described) or off.
 */
export const buildCv = (input: CvInput, copy: CvCopy, lang: Lang): CvModel => {
  const skillName = new Map(input.skills.map((s) => [s.id, s.name]));
  const names = (ids: string[]) =>
    ids.map((id) => skillName.get(id)).filter((n): n is string => !!n);

  const contacts: CvContact[] = [];
  const phone = input.contacts.find((c) => c.kind === 'phone' && c.label);
  if (phone) contacts.push({ kind: 'phone', value: phone.label });
  const email = input.contacts.find((c) => c.kind === 'email' && c.label);
  if (email) contacts.push({ kind: 'email', value: email.label });
  const location =
    input.profile?.location ||
    input.contacts.find((c) => c.kind === 'address')?.label;
  if (location) contacts.push({ kind: 'location', value: location });

  const experience = newestFirst(
    input.experience.filter((e) => e.visible && e.cv !== 'off'),
  ).map((e): CvRole => {
    const compact = e.cv === 'compact';
    const ordered = e.projects
      .map((p, index) => ({ p, index }))
      .sort(
        (a, b) =>
          rank(a.p.highlight) - rank(b.p.highlight) || a.index - b.index,
      )
      .map(({ p }) => p);
    const described: CvProjectLine[] = [];
    const plain: string[] = [];
    for (const p of ordered) {
      const featured = p.highlight !== null;
      if (p.description && (!compact || featured))
        described.push({ name: p.name, description: p.description });
      else plain.push(p.name);
    }
    return {
      id: e.id,
      company: e.company,
      role: e.role,
      team: e.team,
      period: formatPeriod(e.startMonth, e.endMonth, lang),
      summary: compact ? '' : e.summary,
      technologies: names(e.technologies),
      plainProjects: plain,
      describedProjects: described,
      bullets: compact ? [] : e.bullets,
    };
  });

  const education = newestFirst(
    input.education.filter((e) => e.visible && e.cv !== 'off'),
  ).map((e): CvEducationItem => ({
    id: e.id,
    period: formatPeriod(e.startMonth, e.endMonth, lang),
    degree: e.degree,
    school: e.school,
    major: e.major,
    thesis: e.cv === 'compact' ? '' : e.thesisTitle,
    technologies: e.cv === 'compact' ? [] : names(e.technologies),
  }));

  const certificates = [...input.certificates]
    .filter((c) => c.visible)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))
    .map((c) => ({
      id: c.id,
      date: formatMonth(c.issuedAt, lang),
      name: c.name,
    }));

  const skills = SKILL_GROUP_ORDER.map((category) => ({
    id: category,
    title: copy.skillGroups[category],
    skills: input.skills
      .filter((s) => s.visible && s.listed && s.category === category)
      .sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id))
      .map((s) => s.name),
  })).filter((group) => group.skills.length > 0);

  const projects = input.projects
    .filter((p) => p.visible)
    .sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id))
    .map((p): CvProjectItem => ({
      id: p.id,
      name: p.name,
      period: p.startMonth ? formatPeriod(p.startMonth, p.endMonth, lang) : '',
      description: p.summary,
      technologies: names(p.technologies),
    }));

  return {
    name: input.profile?.fullName || input.shell.name,
    headline: input.shell.headline,
    contacts,
    summary: input.profile?.summary ?? '',
    experience,
    education,
    certificates,
    skills,
    projects,
  };
};

/** The configured `cvFileName`, or the name as a slug ('bui-ngo-ton-bach-cv.pdf'). Always ends in .pdf. */
export const cvFileName = (
  configured: string,
  name: string,
  fallback: string,
): string => {
  const given = configured.trim();
  const base =
    given ||
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/(^-+|-+$)/g, '')
      .toLowerCase();
  if (!base) return fallback;
  const named = given ? base : `${base}-cv`;
  return named.toLowerCase().endsWith('.pdf') ? named : `${named}.pdf`;
};
