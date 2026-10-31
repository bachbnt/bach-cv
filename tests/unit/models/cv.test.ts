/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import cvBackup from '../../../src/data/my-cv.json';
import { describe, expect, it } from 'vitest';
import { cvSchema, parseCv } from '@models/cv';

describe('cvSchema', () => {
  it('parses the backed-up CV JSON', () => {
    const result = parseCv(cvBackup);

    expect(result.metadata.previewTitle).toBe('Bui Ngo Ton Bach CV');
    expect(result.metadata.downloadFileName).toBe('bui-ngo-ton-bach-cv.pdf');
    expect(result.candidate.name).toBe('Bùi Ngô Tôn Bách');
    expect(result.sections.workExperience).toHaveLength(6);
    expect(result.sections.projectsAndResearch).toHaveLength(6);
    expect(result.sections.certifications).toContainEqual({
      time: 'Oct 2026',
      name: 'Claude Certified Architect - Professional',
    });
  });

  it('fills defaults for an empty CV document', () => {
    const result = parseCv({});

    expect(result.metadata).toEqual({
      previewTitle: '',
      downloadFileName: '',
    });
    expect(result.candidate.contacts).toEqual([]);
    expect(result.sections.summaryAndObjective.summary).toEqual([]);
    expect(result.sections.workExperience).toEqual([]);
  });

  it('rejects malformed CV data', () => {
    const result = cvSchema.safeParse({
      sections: {
        workExperience: 'not-an-array',
      },
    });

    expect(result.success).toBe(false);
  });
});
