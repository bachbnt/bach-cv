/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { PROJECT_GLYPHS } from '@/skins/phone/blocks/project-model';

/** The tile of a project: the glyph of the platform it runs on, in the accent. Decoration (the platform is written beside it), so hidden from readers. */
export function ProjectTile({
  project,
  className,
}: {
  project: Pick<Doc<'projects'>, 'platforms'>;
  className?: string;
}) {
  const Glyph = PROJECT_GLYPHS[project.platforms[0] ?? 'none'];
  return (
    <span
      aria-hidden='true'
      className={cn(
        'inline-grid size-12 shrink-0 place-items-center rounded-ph-inner bg-ph-accent/15 text-ph-accent-ink',
        className,
      )}
    >
      <Glyph className='size-[48%]' strokeWidth={2} />
    </span>
  );
}
