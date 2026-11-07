/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { streamChannelCopy } from '@/content/copy/stream-channel';
import {
  careerFacts,
  siteLanguageNames,
  tabTarget,
  yearsSince,
} from '@/skins/stream/blocks/channel-facts';

describe('yearsSince', () => {
  const now = new Date(2026, 10, 6); // 6 Nov 2026

  it('rounds the months to the nearest year', () => {
    expect(yearsSince('2020-03', now)).toBe(7); // 6 years 8 months
    expect(yearsSince('2020-06', now)).toBe(6); // 6 years 5 months
  });

  it('is 0 for a month in the future or text that is not a month', () => {
    expect(yearsSince('2027-05', now)).toBe(0);
    expect(yearsSince('soon', now)).toBe(0);
  });
});

describe('careerFacts', () => {
  const now = new Date(2026, 10, 6);

  it('starts at the earliest role, whatever order they come in', () => {
    expect(careerFacts(['2023-05', '2019-07', '2026-01'], now)).toEqual({
      since: '2019',
      years: 7,
    });
  });

  it('says nothing without a role or with a first month that is not one', () => {
    expect(careerFacts([], now)).toBeNull();
    expect(careerFacts(['present'], now)).toBeNull();
  });
});

describe('siteLanguageNames', () => {
  const names = { en: 'English', vi: 'Tiếng Việt' };

  it('lists the languages the site offers in the order of the site', () => {
    expect(siteLanguageNames(['vi', 'en'], names)).toEqual([
      'English',
      'Tiếng Việt',
    ]);
    expect(siteLanguageNames(['en'], names)).toEqual(['English']);
    expect(siteLanguageNames([], names)).toEqual([]);
  });
});

describe('tabTarget', () => {
  it('moves with the arrows and wraps round at both ends', () => {
    expect(tabTarget('ArrowRight', 0, 2)).toBe(1);
    expect(tabTarget('ArrowRight', 1, 2)).toBe(0);
    expect(tabTarget('ArrowLeft', 0, 2)).toBe(1);
  });

  it('goes to the first and the last with Home and End', () => {
    expect(tabTarget('Home', 2, 3)).toBe(0);
    expect(tabTarget('End', 0, 3)).toBe(2);
  });

  it('leaves every other key alone', () => {
    expect(tabTarget('Enter', 0, 2)).toBeNull();
    expect(tabTarget('ArrowDown', 0, 2)).toBeNull();
    expect(tabTarget('ArrowRight', 0, 0)).toBeNull();
  });
});

describe('the words of the channel page', () => {
  it('say the years in both languages, with the singular in English', () => {
    expect(streamChannelCopy.en.about.yearsValue(1)).toBe('1 year');
    expect(streamChannelCopy.en.about.yearsValue(7)).toBe('7 years');
    expect(streamChannelCopy.vi.about.yearsValue(7)).toBe('7 năm');
  });
});
