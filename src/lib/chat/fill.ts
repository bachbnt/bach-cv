/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** Fills `{name}`-style placeholders of a copy string. Unknown placeholders are left as they are. */
export const fill = (
  template: string,
  values: Record<string, string | number>,
): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
