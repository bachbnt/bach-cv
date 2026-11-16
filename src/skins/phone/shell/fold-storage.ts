/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { FOLD_KEY, parseFold, type Fold } from '@/skins/phone/shell/fold-mode';

// a browser that does not allow its storage keeps the fold for this visit only
let memory: Fold = 'open';

/** The fold the visitor left the device in (`bach-cv-phone-fold`), open by default. */
export function readFold(): Fold {
  try {
    return parseFold(window.localStorage.getItem(FOLD_KEY));
  } catch {
    return memory;
  }
}

export function writeFold(fold: Fold) {
  memory = fold;
  try {
    window.localStorage.setItem(FOLD_KEY, fold);
  } catch {
    // see `memory`
  }
}
