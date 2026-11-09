/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { chalk, note, serif, viChalk, viNote } from '@/skins/academic/fonts';

/** The class names that define the font variables of the skin: on the root, and on the scope of a portal (a dialog sits outside the root). */
export const AC_FONT_VARS = cn(
  serif.variable,
  note.variable,
  chalk.variable,
  viNote.variable,
  viChalk.variable,
);
