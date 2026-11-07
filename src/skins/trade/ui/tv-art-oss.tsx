/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** Rows of the diff: a context line, a removed one or an added one, with the length of its code bar. */
const DIFF = [
  ['ctx', 54],
  ['ctx', 38],
  ['del', 46],
  ['add', 60],
  ['add', 42],
  ['ctx', 50],
  ['add', 34],
  ['ctx', 44],
  ['ctx', 28],
] as const;

/** Open source: a commit graph (a branch that forks from main and merges back) beside a diff of added and removed lines on a pull request. */
export function TvArtOss() {
  return (
    <>
      <path
        d='M26 14 V114'
        fill='none'
        strokeWidth='1.6'
        className='stroke-tv-dim'
      />
      <path
        d='M26 34 C26 44 46 40 46 50 V76 C46 86 26 82 26 92'
        pathLength='1'
        fill='none'
        strokeWidth='1.6'
        className='animate-[tv-art-draw_1.4s_ease-out_both] stroke-tv-violet [stroke-dasharray:1]'
      />
      {[20, 34, 92, 106].map((y) => (
        <circle
          key={y}
          cx='26'
          cy={y}
          r='4'
          strokeWidth='1.6'
          className='fill-tv-panel stroke-tv-ink'
        />
      ))}
      {[54, 65, 76].map((y) => (
        <circle key={y} cx='46' cy={y} r='3.4' className='fill-tv-violet' />
      ))}
      <circle
        cx='26'
        cy='92'
        r='7'
        fill='none'
        strokeWidth='1'
        className='animate-[tv-pulse_1.8s_ease-in-out_infinite] stroke-tv-up'
      />
      <rect
        x='64'
        y='10'
        width='106'
        height='108'
        rx='4'
        className='fill-tv-panel stroke-tv-line'
      />
      <rect
        x='70'
        y='16'
        width='38'
        height='4'
        rx='2'
        className='fill-tv-mute/70'
      />
      <rect
        x='142'
        y='14.5'
        width='22'
        height='7'
        rx='3.5'
        className='fill-tv-up/25'
      />
      <circle cx='148' cy='18' r='2' className='fill-tv-up' />
      <path d='M64 27 H170' fill='none' className='stroke-tv-line' />
      {DIFF.map(([kind, w], i) => {
        const y = 32 + i * 9.4;
        return (
          <g
            key={i}
            style={{ animationDelay: `${300 + i * 90}ms` }}
            className='animate-[tv-fade-in_0.5s_ease-out_both]'
          >
            {kind !== 'ctx' && (
              <rect
                x='65'
                y={y - 1.6}
                width='104'
                height='8'
                className={kind === 'add' ? 'fill-tv-up/12' : 'fill-tv-down/12'}
              />
            )}
            <rect
              x='70'
              y={y}
              width='6'
              height='3.4'
              rx='1'
              className='fill-tv-dim/60'
            />
            {kind !== 'ctx' && (
              <path
                d={
                  kind === 'add'
                    ? `M80 ${y + 1.7} h4 M82 ${y - 0.3} v4`
                    : `M80 ${y + 1.7} h4`
                }
                fill='none'
                strokeWidth='1'
                strokeLinecap='round'
                className={kind === 'add' ? 'stroke-tv-up' : 'stroke-tv-down'}
              />
            )}
            <rect
              x='88'
              y={y}
              width={w}
              height='3.6'
              rx='1.5'
              className={
                kind === 'add'
                  ? 'fill-tv-up/75'
                  : kind === 'del'
                    ? 'fill-tv-down/75'
                    : 'fill-tv-line'
              }
            />
          </g>
        );
      })}
    </>
  );
}
