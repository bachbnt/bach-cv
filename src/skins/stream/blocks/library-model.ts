/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { splitMethods } from '@/components/payment/payment-details';

export type PayKind = 'bank' | 'wallet';
export type KindFilter = 'all' | PayKind;

interface MethodLike {
  id: string;
  highlight: number | null;
  kind: PayKind;
  qr: string;
}

/**
 * The payment methods as the Join page lays them out: the featured ones (Standard's `splitMethods`), the others, the kinds the filter
 * offers (only those that exist among the others), the others that the filter lets through, and the ones that have a QR code in the
 * order the viewer steps through them.
 */
export function tiersOf<T extends MethodLike>(
  methods: T[],
  filter: KindFilter,
): {
  featured: T[];
  rest: T[];
  kinds: PayKind[];
  shown: T[];
  withQr: T[];
} {
  const { featured, rest } = splitMethods(methods);
  return {
    featured,
    rest,
    kinds: (['bank', 'wallet'] as const).filter((k) =>
      rest.some((m) => m.kind === k),
    ),
    shown: rest.filter((m) => filter === 'all' || m.kind === filter),
    withQr: [...featured, ...rest].filter((m) => m.qr),
  };
}

/** How many of `rest` a filter chip stands for. */
export const countOfKind = (rest: { kind: PayKind }[], filter: KindFilter) =>
  filter === 'all' ? rest.length : rest.filter((m) => m.kind === filter).length;

/** The first letter of a name in capitals, for the round avatar of someone who has no picture ('' for an empty name). */
export const initialOf = (name: string): string =>
  Array.from(name.trim())[0]?.toLocaleUpperCase() ?? '';
