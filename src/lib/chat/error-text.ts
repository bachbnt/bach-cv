/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The words of the chat copy that name an error. */
interface ErrorWords {
  errors: {
    network: string;
    rateLimit: string;
    dailyLimit: string;
    generic: string;
  };
  unavailable: string;
}

/** The note for an error kind (`ChatErrorKind`), in the language of the copy given; an unknown kind is the generic note. */
export const errorText = (copy: ErrorWords, kind: string): string => {
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
