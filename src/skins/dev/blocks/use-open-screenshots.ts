/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  fillCopy,
  linkLabel,
  skillsOf,
  toneOf,
} from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { devProjectsPaymentCopy } from '@/content/copy/dev-projects-payment';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { useDevOverlays } from '@/skins/dev/shell/dev-overlay-context';

/** Returns the function that opens a project's screenshots in the picture viewer, starting at the first. */
export function useOpenScreenshots(skills: Map<string, Doc<'skills'>>) {
  const copy = useCopy(projectsCopy);
  const dev = useCopy(devProjectsPaymentCopy);
  const { openViewer } = useDevOverlays();

  return (project: Doc<'projects'>) => {
    const total = project.images.length;
    const technologies = skillsOf(project.technologies, skills).map(
      (skill) => ({ label: skill.name, tone: toneOf(skill.category) }),
    );
    const links = project.links.map((link) => ({
      label: linkLabel(link, copy.links),
      url: link.url,
    }));
    openViewer(
      project.images.map((src, i) => ({
        src,
        title: project.name,
        subtitle: `${copy.kinds[project.kind]} · ${fillCopy(dev.screenshotOf, { current: i + 1, total })}`,
        caption: fillCopy(copy.dialog.alt, {
          name: project.name,
          current: i + 1,
        }),
        tags: technologies,
        links,
        labels: copy.dialog,
      })),
      0,
    );
  };
}
