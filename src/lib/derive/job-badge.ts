/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The few letters on the tile of a role.

/** The few letters on the tile of a role: its short name, or the first three letters of the company. */
export const jobBadge = (job: { shortName: string; company: string }): string =>
  job.shortName || job.company.slice(0, 3);
