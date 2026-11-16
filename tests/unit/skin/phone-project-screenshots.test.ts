/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { phoneProjectsCopy } from '@/content/copy/phone-projects';
import { projectsCopy } from '@/content/copy/projects';
import { screenshotItems } from '@/skins/phone/blocks/project-screenshots';

const project = {
  name: 'VenusAI',
  kind: 'freelance' as const,
  images: ['https://example.test/1.webp', 'https://example.test/2.webp'],
  links: [
    {
      label: 'Website',
      url: 'https://apps.apple.com/app/venus',
      kind: 'store' as const,
    },
    { label: 'Website', url: 'https://venus.test', kind: 'site' as const },
  ],
};

const words = (lang: 'en' | 'vi') => ({
  kinds: projectsCopy[lang].kinds,
  links: projectsCopy[lang].links,
  dialog: projectsCopy[lang].dialog,
  screenshotOf: phoneProjectsCopy[lang].screenshotOf,
});

describe('the screenshots of a project in the viewer of the Phone skin', () => {
  it('have one picture for each image, in order, with the Standard words', () => {
    const items = screenshotItems(project, words('en'));
    expect(items.map((item) => item.src)).toEqual(project.images);
    expect(items[1]).toMatchObject({
      title: 'VenusAI',
      subtitle: 'Freelance · screenshot 2 of 2',
      caption: 'VenusAI screenshot 2',
      labels: {
        close: 'Close screenshots',
        previous: 'Previous screenshot',
        next: 'Next screenshot',
      },
    });
  });

  it('carry the links of the project, with the store named by its host', () => {
    const [first] = screenshotItems(project, words('en'));
    expect(first.links).toEqual([
      { label: 'App Store', url: 'https://apps.apple.com/app/venus' },
      { label: 'Visit site', url: 'https://venus.test' },
    ]);
  });

  it('speak Vietnamese when asked', () => {
    const [first] = screenshotItems(project, words('vi'));
    expect(first.subtitle).toBe('Freelance · ảnh chụp màn hình 1 / 2');
    expect(first.labels?.close).toBe('Đóng ảnh chụp màn hình');
  });

  it('have nothing to show for a project without images', () => {
    expect(screenshotItems({ ...project, images: [] }, words('en'))).toEqual(
      [],
    );
  });
});
