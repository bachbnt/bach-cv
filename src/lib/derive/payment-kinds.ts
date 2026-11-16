/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// How many payment methods there are of each kind (bank, wallet), and the methods grouped by kind, for a skin that says it in a note or lists them by kind.

import type { Payment } from '@/lib/content/schema';

type Kind = Payment['kind'];

/** The kinds in the order every skin lists them (the order of the bank / wallet filter). */
export const KINDS = ['bank', 'wallet'] as const satisfies readonly Kind[];

/** The number of methods and, for each kind that has any, how many; every method counts, highlighted or not. */
export function kindCounts<T extends { kind: Kind }>(
  methods: T[],
): { total: number; kinds: { kind: Kind; count: number }[] } {
  return {
    total: methods.length,
    kinds: KINDS.map((kind) => ({
      kind,
      count: methods.filter((m) => m.kind === kind).length,
    })).filter((k) => k.count > 0),
  };
}

/** The methods grouped by kind, in the order of `KINDS`; a kind with none is left out and the order inside a group is the order given. */
export function groupByKind<T extends { kind: Kind }>(
  methods: T[],
): { kind: Kind; methods: T[] }[] {
  return KINDS.map((kind) => ({
    kind,
    methods: methods.filter((m) => m.kind === kind),
  })).filter((group) => group.methods.length > 0);
}
