/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { shellSchema } from './schema.ts';
import rawShell from '@/content/shell.json';

/**
 * The only content embedded at build time: name, headline, avatar, languages and SEO.
 * Edit `src/content/shell.json` (it mirrors the Firestore `site/shell` document) and rebuild.
 */
export const shell = shellSchema.parse(rawShell);
