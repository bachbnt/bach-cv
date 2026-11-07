/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Briefcase,
  Building2,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { MbChip } from '@/skins/moba/ui/mb-chip';

type Kind = Doc<'projects'>['kind'];

/** The emblem of each kind of project, the way an objective shows its type. */
const ICONS: Record<Kind, LucideIcon> = {
  personal: Sparkles,
  freelance: Briefcase,
  company: Building2,
  academic: GraduationCap,
};

/** The kind of a project as the type of its objective: an emblem and the Standard name of the kind. */
export function ProjectKind({ kind }: { kind: Kind }) {
  const copy = useCopy(projectsCopy);
  const Icon = ICONS[kind];
  return (
    <MbChip tone='gold'>
      <Icon aria-hidden='true' className='size-3.5' />
      {copy.kinds[kind]}
    </MbChip>
  );
}
