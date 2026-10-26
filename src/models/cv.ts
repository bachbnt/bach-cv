/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { z } from 'zod';

const periodSchema = z.object({
  start: z.string().default(''),
  end: z.string().default(''),
});

const linkSchema = z.object({
  label: z.string().default(''),
  url: z.string().default(''),
});

const cvContactSchema = z.object({
  type: z.string().default(''),
  value: z.string().default(''),
});

const cvProjectSummarySchema = z.object({
  name: z.string().default(''),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
});

const cvExperiencePdfSchema = z
  .object({
    visible: z.boolean().default(true),
    showProjects: z.boolean().default(true),
    showRoleDetails: z.boolean().default(true),
    showTechnologies: z.boolean().default(true),
    showResponsibilities: z.boolean().default(true),
  })
  .default({
    visible: true,
    showProjects: true,
    showRoleDetails: true,
    showTechnologies: true,
    showResponsibilities: true,
  });

const cvExperienceSchema = z.object({
  company: z.string().default(''),
  period: periodSchema.default({ start: '', end: '' }),
  title: z.string().default(''),
  team: z.string().optional(),
  projects: z.array(cvProjectSummarySchema).default([]),
  roleDetails: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  pdf: cvExperiencePdfSchema,
});

const cvEducationSchema = z.object({
  period: periodSchema.default({ start: '', end: '' }),
  degree: z.string().default(''),
  major: z.string().default(''),
  school: z.string().default(''),
  thesis: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  references: z.array(linkSchema).default([]),
});

const cvCertificationSchema = z.object({
  time: z.string().default(''),
  name: z.string().default(''),
});

const cvSkillGroupSchema = z.object({
  group: z.string().default(''),
  items: z.array(z.string()).default([]),
});

const cvProjectSchema = z.object({
  name: z.string().default(''),
  period: periodSchema.default({ start: '', end: '' }),
  role: z.string().default(''),
  description: z.string().default(''),
  technologies: z.array(z.string()).default([]),
  links: z.array(linkSchema).default([]),
});

export const cvSchema = z.object({
  metadata: z
    .object({
      previewTitle: z.string().default(''),
      downloadFileName: z.string().default(''),
    })
    .default({
      previewTitle: '',
      downloadFileName: '',
    }),
  source: z
    .object({
      file: z.string().default(''),
      pageCount: z.number().default(0),
      createdAt: z.string().default(''),
      updatedAt: z.string().default(''),
      purpose: z.string().default(''),
    })
    .default({
      file: '',
      pageCount: 0,
      createdAt: '',
      updatedAt: '',
      purpose: '',
    }),
  candidate: z
    .object({
      name: z.string().default(''),
      headline: z.string().default(''),
      contacts: z.array(cvContactSchema).default([]),
    })
    .default({
      name: '',
      headline: '',
      contacts: [],
    }),
  sections: z
    .object({
      summaryAndObjective: z
        .object({
          summary: z.array(z.string()).default([]),
          objective: z.array(z.string()).default([]),
        })
        .default({
          summary: [],
          objective: [],
        }),
      workExperience: z.array(cvExperienceSchema).default([]),
      education: z.array(cvEducationSchema).default([]),
      certifications: z.array(cvCertificationSchema).default([]),
      skills: z.array(cvSkillGroupSchema).default([]),
      projectsAndResearch: z.array(cvProjectSchema).default([]),
    })
    .default({
      summaryAndObjective: {
        summary: [],
        objective: [],
      },
      workExperience: [],
      education: [],
      certifications: [],
      skills: [],
      projectsAndResearch: [],
    }),
  rawPages: z
    .array(
      z.object({
        page: z.number(),
        text: z.string(),
      }),
    )
    .default([]),
});

export type Cv = z.infer<typeof cvSchema>;
export type CvExperience = z.infer<typeof cvExperienceSchema>;
export type CvEducation = z.infer<typeof cvEducationSchema>;
export type CvProject = z.infer<typeof cvProjectSchema>;
export type CvSkillGroup = z.infer<typeof cvSkillGroupSchema>;

export const parseCv = (data: unknown): Cv => cvSchema.parse(data ?? {});
