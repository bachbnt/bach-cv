/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLogSources } from '@/skins/dev/shell/devlog/use-log-sources';

/**
 * Draws nothing: it only runs the listeners that feed the dev log. It is the first child of the shell, ahead of the page, so its
 * effects run before the page's queries start and the reads can be timed.
 */
export function LogSources({ connectOpen }: { connectOpen: boolean }) {
  useLogSources({ connectOpen });
  return null;
}
