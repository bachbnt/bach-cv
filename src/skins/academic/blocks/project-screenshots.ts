/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { linkLabel } from '@/components/projects/project-helpers';
import type { Doc } from '@/lib/content/schema';
import type { ViewerItem } from '@/skins/academic/shell/overlay-context';
import { fill } from '@/lib/chat/fill';

/** The words the pictures of a project need (the Standard copy of the page plus the one line of the skin). */
interface ScreenshotWords {
  kinds: Record<Doc<'projects'>['kind'], string>;
  links: Parameters<typeof linkLabel>[1];
  dialog: {
    close: string;
    previous: string;
    next: string;
    alt: string;
  };
  /** `{kind} · screenshot {current} of {total}` */
  screenshotOf: string;
}

/** The screenshots of a project as the pictures of the viewer, in order, with the project's links under each. */
export function screenshotItems(
  project: Pick<Doc<'projects'>, 'name' | 'kind' | 'images' | 'links'>,
  words: ScreenshotWords,
): ViewerItem[] {
  const total = project.images.length;
  const links = project.links.map((link) => ({
    label: linkLabel(link, words.links),
    url: link.url,
  }));
  return project.images.map((src, index) => ({
    src,
    title: project.name,
    subtitle: fill(words.screenshotOf, {
      kind: words.kinds[project.kind],
      current: index + 1,
      total,
    }),
    caption: fill(words.dialog.alt, {
      name: project.name,
      current: index + 1,
    }),
    links,
    labels: {
      close: words.dialog.close,
      previous: words.dialog.previous,
      next: words.dialog.next,
    },
  }));
}
