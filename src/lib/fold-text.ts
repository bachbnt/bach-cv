/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** Lower case without accents (Vietnamese included), so "ho so" finds "Hồ sơ" and "du an" finds "Dự án". The one way every search and file name folds text. */
export const foldText = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
