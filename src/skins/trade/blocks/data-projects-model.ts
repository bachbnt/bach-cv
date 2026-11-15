/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';
import { techCount } from '@/lib/derive/project-view';

/** How tight the rows and cards of the Projects page are. */
export type Density = 'compact' | 'comfortable';

/** The number the area of a heatmap tile stands for: how many technologies the project lists. */
export const heatValue = (
  project: Doc<'projects'>,
  skills: Map<string, Doc<'skills'>>,
): number => techCount(project, skills);
