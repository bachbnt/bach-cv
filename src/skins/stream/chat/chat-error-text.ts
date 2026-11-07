/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { chatCopy } from '@/content/copy/chat';

/** The note for an error kind (`ChatErrorKind`), in the language of `copy`. */
export const chatErrorText = (
  copy: (typeof chatCopy)['en'],
  kind: string,
): string => {
  switch (kind) {
    case 'network':
      return copy.errors.network;
    case 'rate-limit':
      return copy.errors.rateLimit;
    case 'daily-limit':
      return copy.errors.dailyLimit;
    case 'unavailable':
      return copy.unavailable;
    default:
      return copy.errors.generic;
  }
};
