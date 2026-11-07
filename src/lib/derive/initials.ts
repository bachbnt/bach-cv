/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The letters of a tile that stands in for a missing picture.

/** Up to two capitals for the tile that stands in for a missing cover or logo: "FinHub MCP" is FM, "DevPad" is DP. */
export const initialsOf = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const parts =
    words.length > 1
      ? words
      : (words[0]?.match(/[A-Z][a-z0-9]*|[a-z0-9]+/g) ?? words);
  return parts
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};

/**
 * Two letters for the tile of a payment method: its first two capitals ('VietinBank' -> 'VB', 'VNPay' -> 'VN'), or its first two
 * letters when it has one capital ('Binance' -> 'BI'). A different rule from `initialsOf` on purpose: account names are brands.
 */
export const methodInitials = (name: string): string => {
  const capitals = name.match(/\p{Lu}/gu) ?? [];
  if (capitals.length >= 2) return capitals.slice(0, 2).join('');
  return Array.from(name.replace(/[^\p{L}\p{N}]/gu, ''))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};
