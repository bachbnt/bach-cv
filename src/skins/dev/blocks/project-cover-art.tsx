/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cva } from 'class-variance-authority';
import Image from 'next/image';
import { initialsOf } from '@/lib/derive/initials';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { COVER_IMAGE } from '@/skins/dev/blocks/cover-styles';
import { fill } from '@/lib/chat/fill';

const SIZES = '(max-width: 900px) 100vw, 360px';

/** The initials tile, tinted by the category of the first technology (the mobile green, the web blue, the AI violet, the tools amber). */
const tileVariants = cva(
  'absolute inset-0 grid place-items-center font-code text-[56px] font-bold tracking-[-0.03em]',
  {
    variants: {
      tone: {
        none: 'bg-chrome-2 text-mute',
        mobile:
          'bg-[color:color-mix(in_srgb,var(--dv-accent)_12%,var(--chrome-2))] text-signal',
        web: 'bg-[color:color-mix(in_srgb,var(--blue)_12%,var(--chrome-2))] text-sky',
        ai: 'bg-[color:color-mix(in_srgb,var(--fn)_12%,var(--chrome-2))] text-fn',
        tools:
          'bg-[color:color-mix(in_srgb,var(--field)_12%,var(--chrome-2))] text-field',
      },
    },
    defaultVariants: { tone: 'none' },
  },
);

/** The picture of a project: its cover, or a tile with the initials tinted by the category of its first technology. */
export function ProjectCoverArt({
  project,
  firstSkill,
}: {
  project: Doc<'projects'>;
  firstSkill?: Doc<'skills'>;
}) {
  const copy = useCopy(projectsCopy);
  if (project.cover) {
    return (
      <Image
        src={project.cover}
        alt={fill(copy.coverAlt, { name: project.name })}
        fill
        sizes={SIZES}
        loading='lazy'
        className={COVER_IMAGE}
      />
    );
  }
  return (
    <span
      aria-hidden='true'
      className={tileVariants({ tone: firstSkill?.category })}
    >
      {initialsOf(project.name)}
    </span>
  );
}
