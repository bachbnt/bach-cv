/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * Where the details of the frame are, in px from the left edge of each part: `right` is the half that stays (580 px wide, and also the cover),
 * `left` the half that swings, `open` the whole open slab (1140 px). The bottom edge has the USB-C opening of the half that stays, and
 * speaker holes and the microphone; the left edge has nothing on it.
 */
const PARTS = {
  right: { bands: [64, 516], port: 278, grilles: [188, 352], mic: 436 },
  left: { bands: [64, 516], port: null, grilles: [188, 352], mic: 296 },
  open: {
    bands: [64, 1076],
    port: 838,
    grilles: [188, 352, 748, 912],
    mic: 996,
  },
} as const;

/**
 * The hardware that is seen on the frame, all of it decoration: the hairline plastic bands of the antenna at the corners of the top and
 * bottom edges, and on the bottom edge the USB-C opening, two rows of speaker holes and the microphone hole. Drawn by `css/device.css`;
 * hidden from readers and from the pointer.
 */
export function PhDeviceEdge({ part }: { part: keyof typeof PARTS }) {
  const { bands, port, grilles, mic } = PARTS[part];
  return (
    <span aria-hidden='true' className='contents'>
      {bands.map((x) => (
        <i key={`t${x}`} className='ph-band ph-band-top' style={{ left: x }} />
      ))}
      {bands.map((x) => (
        <i
          key={`b${x}`}
          className='ph-band ph-band-bottom'
          style={{ left: x }}
        />
      ))}
      {port !== null && <i className='ph-port' style={{ left: port }} />}
      {grilles.map((x) => (
        <i key={`g${x}`} className='ph-grille' style={{ left: x }} />
      ))}
      <i className='ph-mic' style={{ left: mic }} />
    </span>
  );
}
