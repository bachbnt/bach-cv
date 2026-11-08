/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A line that draws itself the first time it appears (the length is normalised to 1, so the dash animation needs no measuring). */
export function OverlayLine({
  d,
  className,
  width = 1.5,
}: {
  d: string;
  className: string;
  width?: number;
}) {
  return (
    <path
      d={d}
      pathLength={1}
      fill='none'
      strokeWidth={width}
      strokeLinejoin='round'
      className={`tv-chart-line-in ${className}`}
    />
  );
}
