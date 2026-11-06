/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * bach-cv v2 data model (design draft, not wired into src yet).
 *
 * This file is the contract. Firestore stores it today; a SQL database can store it later
 * without touching the UI, because every rule below is also a rule of the relational model:
 *
 *   1. One collection = one table. The document id is a slug and the primary key.
 *   2. A reference to another document is always its id (never a path, never a DocumentReference).
 *   3. A field has one type. No unions, no "boolean or number", no string-or-null mixes.
 *   4. Absent means null for numbers, dates and ranks, and '' for text. Every field is written.
 *   5. An array of ids is a many-to-many table with a position. An array of strings is a child table with a position.
 *      An array of objects is a child table. Nothing nests deeper than that.
 *   6. Dates are strings: 'YYYY-MM' for periods, 'YYYY-MM-DD' for days. No Timestamp in content.
 *   7. Field names are lowerCamelCase and are not SQL reserved words (sort, category, startMonth ...).
 *   8. Translations are an overlay (`l10n`) of the same field names, never a second copy of a document.
 *
 * Delivery: only `site/shell` is embedded at build time (name, headline, avatar, SEO). Everything else is read
 * by the browser with `firebase/firestore/lite` when a page needs it, so editing content never needs a build.
 *
 * Parsing is fail-open: a missing field gets its default instead of breaking the page.
 */

import { z } from 'zod';

// Zod would try `new Function()` to compile faster parsers; the data here is small, and a page with a Content-Security-Policy
// that forbids eval would log a violation for it on every load.
z.config({ jitless: true });

// ---------------------------------------------------------------- primitives

export const LANGS = ['en', 'vi'] as const;
export const langSchema = z.enum(LANGS);
export type Lang = z.infer<typeof langSchema>;

/** Document id and reference key: lowercase words joined by hyphens, e.g. `jetpack-compose`. */
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
/** A period: '2026-01'. Sorting, durations and per-language formatting all derive from it. */
const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const text = z.string().default('');
/** 1 = first. null = not highlighted. */
const rankSchema = z.number().int().positive().nullable().default(null);
/** ids of skill documents */
const skillIds = z.array(slugSchema).default([]);
const endMonth = monthSchema.nullable().default(null);

/** Switches every content document carries. */
const flags = {
  /** remote-config switch for this item. false = never sent to a visitor. */
  visible: z.boolean().default(true),
  /** featured rank (1 = first), used by the Featured blocks and the CV PDF. */
  highlight: rankSchema,
};
/** Collections that are ordered by hand. Dated collections sort by their own date instead. */
const sorted = { ...flags, sort: z.number().int().default(0) };

/**
 * `l10n: { vi: { summary: '...' } }` overrides the same-named field. Built from bare types
 * (no defaults), so a translation that omits a field keeps the English text.
 */
const l10nOf = <S extends z.ZodRawShape>(shape: S) =>
  z.partialRecord(langSchema, z.object(shape).partial()).default({});

// ---------------------------------------------------------------- skills

export const SKILL_CATEGORIES = ['ai', 'mobile', 'web', 'tools'] as const;

/**
 * The shared vocabulary. Experience, projects, education and certificates point at skills by id,
 * which is what makes "Used at FPT · MoMo" a query instead of hand-written text.
 */
export const skillSchema = z.object({
  ...sorted,
  name: text,
  category: z.enum(SKILL_CATEGORIES).default('tools'),
  /** key of a bundled icon; unknown keys fall back to a neutral tile */
  icon: text,
  url: text,
  /** false = only a tag on other items, not a chip in the Skills section */
  listed: z.boolean().default(true),
  l10n: l10nOf({ name: z.string() }),
});
export type Skill = z.output<typeof skillSchema>;

// ---------------------------------------------------------------- experience

export const EXPERIENCE_KINDS = [
  'full-time',
  'part-time',
  'freelance',
  'internship',
] as const;
/** how an entry appears in the generated CV PDF */
export const CV_MODES = ['full', 'compact', 'off'] as const;

export const experienceProjectSchema = z.object({
  name: text,
  description: text,
  technologies: skillIds,
  highlight: rankSchema,
  /** optional link to a document in `projects` */
  projectId: z.union([slugSchema, z.literal('')]).default(''),
});
export type ExperienceProject = z.output<typeof experienceProjectSchema>;

export const experienceSchema = z.object({
  ...flags,
  company: text,
  /** short label used in "Used at ..." lines, e.g. `FPT` */
  shortName: text,
  role: text,
  kind: z.enum(EXPERIENCE_KINDS).default('full-time'),
  startMonth: monthSchema,
  /** null = current role, which drives the "Current" pill */
  endMonth,
  summary: text,
  /** one line shown on the Home page and in lists */
  tagline: text,
  team: text,
  logo: text,
  bullets: z.array(z.string()).default([]),
  technologies: skillIds,
  projects: z.array(experienceProjectSchema).default([]),
  cv: z.enum(CV_MODES).default('full'),
  l10n: l10nOf({
    role: z.string(),
    summary: z.string(),
    tagline: z.string(),
    team: z.string(),
    bullets: z.array(z.string()),
    projects: z.array(experienceProjectSchema),
  }),
});
export type Experience = z.output<typeof experienceSchema>;

// ---------------------------------------------------------------- education

export const educationSchema = z.object({
  ...flags,
  degree: text,
  school: text,
  major: text,
  startMonth: monthSchema,
  endMonth,
  logo: text,
  thesisTitle: text,
  thesisUrl: text,
  /** the code of the thesis, shown as "Source code" */
  thesisSourceUrl: text,
  /** skill ids used by the thesis */
  technologies: skillIds,
  cv: z.enum(CV_MODES).default('full'),
  l10n: l10nOf({
    degree: z.string(),
    major: z.string(),
    thesisTitle: z.string(),
  }),
});
export type Education = z.output<typeof educationSchema>;

// ---------------------------------------------------------------- projects

export const PROJECT_KINDS = [
  'personal',
  'freelance',
  'company',
  'academic',
] as const;
export const LINK_KINDS = [
  'site',
  'store',
  'github',
  'releases',
  'pdf',
  'source',
  'other',
] as const;

export const projectLinkSchema = z.object({
  label: text,
  url: text,
  kind: z.enum(LINK_KINDS).default('other'),
});
export type ProjectLink = z.output<typeof projectLinkSchema>;

export const projectSchema = z.object({
  ...sorted,
  name: text,
  kind: z.enum(PROJECT_KINDS).default('personal'),
  summary: text,
  cover: text,
  /** gallery, in order */
  images: z.array(z.string()).default([]),
  startMonth: monthSchema.nullable().default(null),
  endMonth,
  technologies: skillIds,
  links: z.array(projectLinkSchema).default([]),
  l10n: l10nOf({ summary: z.string() }),
});
export type Project = z.output<typeof projectSchema>;

// ---------------------------------------------------------------- certificates

export const certificateSchema = z.object({
  ...flags,
  name: text,
  issuer: text,
  issuedAt: daySchema,
  image: text,
  /** a PDF served as application/pdf, so it opens instead of downloading */
  pdfUrl: text,
  credentialUrl: text,
  /** what the certificate covers, shown as tags */
  skills: skillIds,
  l10n: l10nOf({ name: z.string() }),
});
export type Certificate = z.output<typeof certificateSchema>;

// ---------------------------------------------------------------- services

export const SERVICE_ART = [
  'app',
  'web',
  'oss',
  'teaching',
  'writing',
  'generic',
] as const;

export const serviceSchema = z.object({
  ...sorted,
  name: text,
  description: text,
  /** which CSS-drawn illustration to show */
  art: z.enum(SERVICE_ART).default('generic'),
  /** first sentence put into the contact form when this topic chip is chosen */
  starter: text,
  l10n: l10nOf({
    name: z.string(),
    description: z.string(),
    starter: z.string(),
  }),
});
export type Service = z.output<typeof serviceSchema>;

// ---------------------------------------------------------------- payments (sensitive)

export const paymentSchema = z.object({
  ...sorted,
  name: text,
  kind: z.enum(['bank', 'wallet']).default('bank'),
  holder: text,
  account: text,
  /** QR image path. Empty = no QR. */
  qr: text,
  logo: text,
});
export type Payment = z.output<typeof paymentSchema>;

// ---------------------------------------------------------------- contacts

export const CONTACT_KINDS = ['email', 'phone', 'address', 'social'] as const;
export const CONTACT_GROUPS = ['professional', 'messaging', 'social'] as const;

export const contactSchema = z.object({
  ...sorted,
  kind: z.enum(CONTACT_KINDS).default('social'),
  /** icon key, e.g. `linkedin` */
  platform: text,
  /** what is shown: an address, a number or a handle */
  label: text,
  url: text,
  /** grouping inside the Connect menu (social items only, '' otherwise) */
  menuGroup: z.union([z.enum(CONTACT_GROUPS), z.literal('')]).default(''),
  l10n: l10nOf({ label: z.string() }),
});
export type Contact = z.output<typeof contactSchema>;

// ---------------------------------------------------------------- site (single documents)

/**
 * `site/shell`: the only document embedded in the page at build time. Tiny on purpose: enough for
 * the metadata and the first paint. Changing it needs a build; everything else is read when the page runs.
 */
export const shellSchema = z.object({
  name: text,
  /** other names people search for (full name, nickname): in the page's schema.org Person and in the footer */
  alternateNames: z.array(z.string()).default([]),
  headline: text,
  avatar: text,
  defaultLanguage: langSchema.default('en'),
  languages: z.array(langSchema).default(['en']),
  seoTitle: text,
  seoDescription: text,
  ogImage: text,
  l10n: l10nOf({
    headline: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
  }),
});
export type Shell = z.output<typeof shellSchema>;

/**
 * `site/profile`: the rest of who I am. Read at run time. Never joined with anything,
 * so a SQL migration keeps it as one JSON row.
 */
export const profileSchema = z.object({
  /** full legal name, used on the CV */
  fullName: text,
  summary: text,
  location: text,
  covers: z.array(z.string()).default([]),
  specialties: z
    .array(
      z.object({
        name: z.string(),
        /** drives the chip colour: ink for the umbrella role, domain colour otherwise */
        tone: z.enum(['primary', 'mobile', 'web', 'ai']).default('primary'),
        visible: z.boolean().default(true),
      }),
    )
    .default([]),
  cvUrl: text,
  cvFileName: text,
  l10n: l10nOf({ summary: z.string() }),
});
export type Profile = z.output<typeof profileSchema>;

/** `site/settings`: how the widgets behave. Read when the chat or the contact form first opens. */
export const settingsSchema = z.object({
  chat: z
    .object({
      botName: z.string().default('BB Bot'),
      maxUserMessages: z.number().int().positive().default(20),
      maxInputLength: z.number().int().positive().default(500),
      suggestions: z
        .array(z.object({ id: slugSchema, text: z.string() }))
        .default([]),
    })
    .prefault({}),
  contactForm: z
    .object({
      nameMax: z.number().int().positive().default(100),
      messageMax: z.number().int().positive().default(1000),
    })
    .prefault({}),
});
export type Settings = z.output<typeof settingsSchema>;

// ---------------------------------------------------------------- site/live (the switches)

export const PAGES = [
  'home',
  'about',
  'resume',
  'projects',
  'certificates',
  'services',
  'payment',
] as const;
export type PageKey = (typeof PAGES)[number];
/**
 * on      in the menu, reachable
 * soon    in the menu as "Soon"; the page shows Coming soon
 * hidden  not in the menu; the URL shows 404
 */
export const pageStateSchema = z.enum(['on', 'soon', 'hidden']).default('on');

export const COLLECTION_NAMES = [
  'skills',
  'experience',
  'education',
  'projects',
  'certificates',
  'services',
  'payments',
  'contacts',
] as const;
export type CollectionName = (typeof COLLECTION_NAMES)[number];

/**
 * `site/live`: the first thing the browser reads. Small on purpose: switches only, never content.
 * Everything here takes effect on the next read, with no build.
 */
export const liveSchema = z.object({
  maintenance: z
    .object({
      enabled: z.boolean().default(false),
      /** shown on the maintenance screen; empty uses the default wording */
      message: text,
      l10n: l10nOf({ message: z.string() }),
    })
    .prefault({}),
  pages: z
    .object(
      Object.fromEntries(PAGES.map((p) => [p, pageStateSchema])) as Record<
        PageKey,
        typeof pageStateSchema
      >,
    )
    .prefault({}),
  features: z
    .object({
      chat: z.boolean().default(true),
      cvDownload: z.boolean().default(true),
      contactForm: z.boolean().default(true),
      connectMenu: z.boolean().default(true),
    })
    .prefault({}),
});
export type Live = z.output<typeof liveSchema>;

// ---------------------------------------------------------------- messages

/** `messages/{autoId}`: create-only from the browser. `createdAt` is the server time. */
export const messageSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z
    .string()
    .trim()
    .max(254)
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
  topic: z.string().trim().max(40).default(''),
  message: z.string().trim().min(1).max(1000),
  locale: langSchema.default('en'),
});
export type MessageInput = z.input<typeof messageSchema>;

// ---------------------------------------------------------------- registry

export const COLLECTIONS = {
  skills: skillSchema,
  experience: experienceSchema,
  education: educationSchema,
  projects: projectSchema,
  certificates: certificateSchema,
  services: serviceSchema,
  payments: paymentSchema,
  contacts: contactSchema,
} as const satisfies Record<CollectionName, z.ZodType>;

export type Doc<N extends CollectionName> = z.output<
  (typeof COLLECTIONS)[N]
> & { id: string };

/** Every content collection as arrays. Used by the integrity check, the seed and the SQL loader. */
export interface Content {
  skills: Doc<'skills'>[];
  experience: Doc<'experience'>[];
  education: Doc<'education'>[];
  projects: Doc<'projects'>[];
  certificates: Doc<'certificates'>[];
  services: Doc<'services'>[];
  payments: Doc<'payments'>[];
  contacts: Doc<'contacts'>[];
}

// ---------------------------------------------------------------- resolve helpers

export type Orderable = {
  id: string;
  visible: boolean;
  sort?: number;
  highlight: number | null;
};

/**
 * Items to render: visible, in `sort` order, featured first when asked.
 * Rendering is never decided anywhere else, so remote config has a single place to apply.
 * Sorting happens here, in memory: a Firestore query with `where` and `orderBy` on different fields
 * would need a composite index, and a few dozen items do not.
 */
export const resolveItems = <T extends Orderable>(
  items: T[],
  options: { featuredFirst?: boolean } = {},
): T[] => {
  const rank = (item: T) => item.highlight ?? Number.POSITIVE_INFINITY;
  return items
    .filter((item) => item.visible)
    .sort((a, b) =>
      options.featuredFirst && rank(a) !== rank(b)
        ? rank(a) - rank(b)
        : (a.sort ?? 0) - (b.sort ?? 0) || a.id.localeCompare(b.id),
    );
};

/** Overlay a language. A missing translation falls back to the base text. */
export const localize = <
  T extends { l10n: Partial<Record<Lang, Record<string, unknown>>> },
>(
  item: T,
  lang: Lang,
): T => ({ ...item, ...(item.l10n[lang] ?? {}) }) as T;

// ---------------------------------------------------------------- integrity

/**
 * Firestore does not enforce references and SQL would, so check them the same way in both:
 * every id in a reference field must be a document that exists. Run before seeding and by the tests.
 */
export const findBrokenRefs = (
  s: Pick<
    Content,
    'skills' | 'experience' | 'education' | 'projects' | 'certificates'
  >,
): string[] => {
  const skills = new Set(s.skills.map((x) => x.id));
  const projects = new Set(s.projects.map((x) => x.id));
  const broken: string[] = [];
  const need = (where: string, ids: string[]) =>
    ids
      .filter((id) => !skills.has(id))
      .forEach((id) => broken.push(`${where} -> skills/${id}`));
  for (const e of s.experience) {
    need(`experience/${e.id}.technologies`, e.technologies);
    e.projects.forEach((p, i) => {
      need(`experience/${e.id}.projects[${i}].technologies`, p.technologies);
      if (p.projectId && !projects.has(p.projectId))
        broken.push(
          `experience/${e.id}.projects[${i}].projectId -> projects/${p.projectId}`,
        );
    });
  }
  for (const x of s.education)
    need(`education/${x.id}.technologies`, x.technologies);
  for (const x of s.projects)
    need(`projects/${x.id}.technologies`, x.technologies);
  for (const x of s.certificates) need(`certificates/${x.id}.skills`, x.skills);
  return broken;
};

// ---------------------------------------------------------------- derived: skill evidence

export interface SkillEvidence {
  /** short names of the places it was used, newest first; `Side projects` last */
  usedAt: string[];
  /** first year it appears in any dated item */
  since: number | null;
}

export const SIDE_PROJECTS = 'Side projects';

/**
 * "Used at FPT · MoMo", derived and never stored. In SQL it is the `skill_usage` view; the two must agree.
 * Only items that are visible count, so switching a role off also removes it from the evidence.
 */
export const skillEvidence = (
  experience: Pick<
    Doc<'experience'>,
    | 'id'
    | 'visible'
    | 'shortName'
    | 'company'
    | 'startMonth'
    | 'technologies'
    | 'projects'
  >[],
  projects: Pick<Project, 'visible' | 'kind' | 'startMonth' | 'technologies'>[],
): Map<string, SkillEvidence> => {
  const rows: { skill: string; label: string; month: string | null }[] = [];
  for (const e of experience) {
    if (!e.visible) continue;
    const used = new Set([
      ...e.technologies,
      ...e.projects.flatMap((p) => p.technologies),
    ]);
    used.forEach((skill) =>
      rows.push({
        skill,
        label: e.shortName || e.company,
        month: e.startMonth,
      }),
    );
  }
  for (const p of projects) {
    if (!p.visible || p.kind !== 'personal') continue;
    p.technologies.forEach((skill) =>
      rows.push({ skill, label: SIDE_PROJECTS, month: p.startMonth }),
    );
  }
  const out = new Map<string, SkillEvidence>();
  const bySkill = new Map<string, typeof rows>();
  rows.forEach((r) =>
    bySkill.set(r.skill, [...(bySkill.get(r.skill) ?? []), r]),
  );
  for (const [skill, list] of bySkill) {
    const months = list
      .map((r) => r.month)
      .filter((m): m is string => m !== null);
    const labels = new Map<string, string>(); // label -> newest start month
    list.forEach((r) => {
      const prev = labels.get(r.label);
      if (prev === undefined || (r.month ?? '') > prev)
        labels.set(r.label, r.month ?? '');
    });
    const usedAt = [...labels.keys()].sort((a, b) =>
      a === SIDE_PROJECTS
        ? 1
        : b === SIDE_PROJECTS
          ? -1
          : labels.get(b)!.localeCompare(labels.get(a)!) || a.localeCompare(b),
    );
    out.set(skill, {
      usedAt,
      since: months.length ? Number(months.sort()[0].slice(0, 4)) : null,
    });
  }
  return out;
};
