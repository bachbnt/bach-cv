/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * Builds `src/skins/travel/map/geo.ts` from OpenStreetMap data (Overpass API JSON, © OpenStreetMap contributors, ODbL).
 *
 *   node scripts/travel/build-geo.mjs <raw-dir> [out-file]
 *
 * Run `npx prettier --write src/skins/travel/map/geo.ts` after it.
 *
 * <raw-dir> holds coast.json, river.json, roads.json, streets.json, beach.json, landuse.json, wood.json and peaks.json: the answers of the Overpass
 * queries listed in `src/skins/travel/README.md` (`out geom`). The script projects every point with the SAME equirectangular projection
 * the skin uses at run time (`map/projection.ts`), simplifies with Douglas-Peucker, clips to the map box and writes compact SVG
 * path strings, so the skin never fetches anything.
 */

import fs from 'node:fs';
import path from 'node:path';

const [dir, outFile = 'src/skins/travel/map/geo.ts'] = process.argv.slice(2);
if (!dir) throw new Error('usage: build-geo.mjs <raw-dir> [out-file]');

// ---- the projection (keep in sync with map/projection.ts, which re-exports these numbers from geo.ts)
const LAT_N = 12.4;
const LNG_W = 109.12;
const LAT_S = 12.15;
const LNG_E = 109.33;
const UNITS_PER_DEG = 20000;
const COS = Math.cos((((LAT_N + LAT_S) / 2) * Math.PI) / 180);
const project = (lat, lon) => [
  (lon - LNG_W) * COS * UNITS_PER_DEG,
  (LAT_N - lat) * UNITS_PER_DEG,
];
const WIDTH = Math.round((LNG_E - LNG_W) * COS * UNITS_PER_DEG);
const HEIGHT = Math.round((LAT_N - LAT_S) * UNITS_PER_DEG);

const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(dir, `${name}.json`), 'utf8')).elements;
const pts = (way) => way.geometry.map((g) => project(g.lat, g.lon));

// ---- geometry helpers
function perpendicular([x, y], [x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = dx * dx + dy * dy;
  if (len === 0) return Math.hypot(x - x1, y - y1);
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

function simplify(line, tolerance) {
  if (line.length < 3) return line;
  const keep = new Uint8Array(line.length);
  keep[0] = keep[line.length - 1] = 1;
  const stack = [[0, line.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let far = -1;
    let max = tolerance;
    for (let i = a + 1; i < b; i += 1) {
      const d = perpendicular(line[i], line[a], line[b]);
      if (d > max) {
        max = d;
        far = i;
      }
    }
    if (far >= 0) {
      keep[far] = 1;
      stack.push([a, far], [far, b]);
    }
  }
  return line.filter((_, i) => keep[i]);
}

const area = (ring) => {
  let sum = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
};

// Sutherland-Hodgman against the map box (a little margin so the edge strokes are not seen)
const M = 2;
const BOX = [-M, -M, WIDTH + M, HEIGHT + M];
function clipRing(ring) {
  const edges = [
    (p) => p[0] >= BOX[0],
    (a, b) => [
      BOX[0],
      a[1] + ((b[1] - a[1]) * (BOX[0] - a[0])) / (b[0] - a[0]),
    ],
    (p) => p[0] <= BOX[2],
    (a, b) => [
      BOX[2],
      a[1] + ((b[1] - a[1]) * (BOX[2] - a[0])) / (b[0] - a[0]),
    ],
    (p) => p[1] >= BOX[1],
    (a, b) => [
      a[0] + ((b[0] - a[0]) * (BOX[1] - a[1])) / (b[1] - a[1]),
      BOX[1],
    ],
    (p) => p[1] <= BOX[3],
    (a, b) => [
      a[0] + ((b[0] - a[0]) * (BOX[3] - a[1])) / (b[1] - a[1]),
      BOX[3],
    ],
  ];
  let out = ring;
  for (let e = 0; e < edges.length; e += 2) {
    const inside = edges[e];
    const cut = edges[e + 1];
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i += 1) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur));
        out.push(cur);
      } else if (inside(prev)) out.push(cut(prev, cur));
    }
    if (!out.length) return [];
  }
  return out;
}

// clip an open line to the box: keeps the runs that are inside (a point is inside, or the segment crosses; kept simple)
function clipLine(line) {
  const inside = (p) =>
    p[0] >= BOX[0] && p[0] <= BOX[2] && p[1] >= BOX[1] && p[1] <= BOX[3];
  const runs = [];
  let run = [];
  for (const p of line) {
    if (inside(p)) run.push(p);
    else if (run.length) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length) runs.push(run);
  return runs.filter((r) => r.length > 1);
}

// joins open ways end to end by their node ids/coords; returns rings and open chains
function assemble(ways) {
  const key = (g) => `${g.lat},${g.lon}`;
  const rings = [];
  const open = [];
  const pool = [];
  for (const w of ways) {
    const g = w.geometry;
    if (!g || g.length < 2) continue;
    if (key(g[0]) === key(g[g.length - 1])) rings.push(g);
    else pool.push(g);
  }
  const used = new Set();
  for (let i = 0; i < pool.length; i += 1) {
    if (used.has(i)) continue;
    used.add(i);
    let chain = [...pool[i]];
    let grew = true;
    while (grew) {
      grew = false;
      for (let j = 0; j < pool.length; j += 1) {
        if (used.has(j)) continue;
        const g = pool[j];
        if (key(g[0]) === key(chain[chain.length - 1])) {
          chain = chain.concat(g.slice(1));
        } else if (key(g[g.length - 1]) === key(chain[chain.length - 1])) {
          chain = chain.concat([...g].reverse().slice(1));
        } else if (key(g[g.length - 1]) === key(chain[0])) {
          chain = g.concat(chain.slice(1));
        } else if (key(g[0]) === key(chain[0])) {
          chain = [...g].reverse().concat(chain.slice(1));
        } else continue;
        used.add(j);
        grew = true;
      }
    }
    if (key(chain[0]) === key(chain[chain.length - 1])) rings.push(chain);
    else open.push(chain);
  }
  return { rings, open };
}

// ---- path strings: absolute first point, then relative deltas in whole units
const r = (n) => Math.round(n);
function toPath(line, close) {
  const p = line.map(([x, y]) => [r(x), r(y)]);
  const dedup = p.filter(
    (q, i) => i === 0 || q[0] !== p[i - 1][0] || q[1] !== p[i - 1][1],
  );
  if (dedup.length < 2) return '';
  let d = `M${dedup[0][0]} ${dedup[0][1]}l`;
  const deltas = [];
  for (let i = 1; i < dedup.length; i += 1) {
    deltas.push(
      `${dedup[i][0] - dedup[i - 1][0]} ${dedup[i][1] - dedup[i - 1][1]}`,
    );
  }
  d += deltas.join(' ').replace(/ -/g, '-');
  return close ? `${d}z` : d;
}
const joinPaths = (list) => list.filter(Boolean).join('');
const ringOf = (g, tol, minArea = 0) => {
  let ring = g.map((q) => project(q.lat, q.lon));
  ring = ring.slice(0, -1);
  ring = clipRing(ring);
  if (ring.length < 3 || Math.abs(area(ring)) < minArea) return null;
  ring = simplify([...ring, ring[0]], tol).slice(0, -1);
  return ring.length < 3 ? null : ring;
};
const ringPath = (g, tol, minArea = 0) => {
  const ring = ringOf(g, tol, minArea);
  return ring ? toPath(ring, true) : '';
};
const inside = (ring, x, y) => {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      c = !c;
  }
  return c;
};

// ---- land: the mainland is the open coast chain closed through the west, the islands are closed ways
const coast = assemble(read('coast'));
const mainland = coast.open.sort((a, b) => b.length - a.length)[0];
// OSM keeps land on the left of a coastline: the chain must run south to north here (sea to the east)
const ordered =
  mainland[0].lat < mainland[mainland.length - 1].lat
    ? mainland
    : [...mainland].reverse();
const first = ordered[0];
const last = ordered[ordered.length - 1];
const closed = [
  ...ordered,
  { lat: last.lat + 0.2, lon: LNG_W - 0.2 },
  { lat: first.lat - 0.2, lon: LNG_W - 0.2 },
  first,
];
const landRings = [ringOf(closed, 2.4)];
const land = [toPath(landRings[0], true)];
let islandCount = 0;
for (const g of coast.rings) {
  const ring = g.map((q) => project(q.lat, q.lon)).slice(0, -1);
  if (Math.abs(area(ring)) < 900) continue;
  const ringI = ringOf(g, 2, 0);
  if (ringI) {
    landRings.push(ringI);
    land.push(toPath(ringI, true));
    islandCount += 1;
  }
}

// ---- built-up area, forest, water, beaches
const built = joinPaths(
  read('landuse')
    .filter((w) => w.geometry)
    .map((w) => ringPath(w.geometry, 4, 8000)),
);
const woodRings = read('wood')
  .filter((w) => w.geometry)
  .map((w) => ringOf(w.geometry, 9, 90000))
  .filter(Boolean);
const woods = joinPaths(woodRings.map((r) => toPath(r, true)));
const beachRings = read('beach')
  .filter((w) => w.geometry && w.geometry.length > 5)
  .map((w) => ringOf(w.geometry, 2, 500))
  .filter(Boolean);
const beaches = joinPaths(beachRings.map((r) => toPath(r, true)));

const riverEls = read('river');
const waterRings = [];
for (const e of riverEls) {
  if (e.type === 'way' && e.tags?.natural === 'water') waterRings.push(e);
  if (e.type === 'relation' && e.tags?.natural === 'water') {
    const outers = (e.members ?? [])
      .filter((m) => m.role === 'outer' && m.geometry)
      .map((m) => ({ geometry: m.geometry }));
    const { rings } = assemble(outers);
    for (const g of rings) waterRings.push({ geometry: g });
  }
}
const waterRingsOut = waterRings
  .filter((w) => w.geometry)
  .map((w) => ringOf(w.geometry, 3, 2500))
  .filter(Boolean);
const water = joinPaths(waterRingsOut.map((r) => toPath(r, true)));
const riverLines = riverEls
  .filter(
    (e) =>
      e.type === 'way' &&
      e.tags?.waterway &&
      e.geometry &&
      /Sông Cái|Sông Tắc|Sông Quán|Sông Cầu Dứa/.test(e.tags.name ?? ''),
  )
  .flatMap((e) => clipLine(pts(e)).map((l) => simplify(l, 4)));
const rivers = joinPaths(riverLines.map((l) => toPath(l, false)));

// ---- roads
const roadEls = read('roads');
const bucket = (e) => (e.tags.highway === 'secondary' ? 'minor' : 'major');
const roadLines = { major: [], minor: [] };
for (const e of roadEls) {
  if (!e.geometry) continue;
  for (const line of clipLine(pts(e)))
    roadLines[bucket(e)].push(simplify(line, 5));
}
const majorRoads = joinPaths(roadLines.major.map((l) => toPath(l, false)));
let minorRoads = joinPaths(roadLines.minor.map((l) => toPath(l, false)));

// ---- the coast road, south to north: the shortest path over the road graph (one carriageway, not both)
const nodeKey = (g) => `${g.lat.toFixed(6)},${g.lon.toFixed(6)}`;
const graph = new Map();
const coordOf = new Map();
const link = (a, b) => {
  if (!graph.has(a)) graph.set(a, []);
  graph.get(a).push(b);
};
for (const e of roadEls) {
  if (!e.geometry) continue;
  const oneway = e.tags.oneway === 'yes';
  for (let i = 0; i < e.geometry.length; i += 1)
    coordOf.set(nodeKey(e.geometry[i]), e.geometry[i]);
  for (let i = 1; i < e.geometry.length; i += 1) {
    const a = nodeKey(e.geometry[i - 1]);
    const b = nodeKey(e.geometry[i]);
    link(a, b);
    if (!oneway) link(b, a);
  }
}
const dist = (a, b) => {
  const [x1, y1] = project(coordOf.get(a).lat, coordOf.get(a).lon);
  const [x2, y2] = project(coordOf.get(b).lat, coordOf.get(b).lon);
  return Math.hypot(x1 - x2, y1 - y2);
};
const nearest = (lat, lon) => {
  const [px, py] = project(lat, lon);
  let best = null;
  let bd = Infinity;
  for (const [k, g] of coordOf) {
    if (!graph.has(k)) continue;
    const [x, y] = project(g.lat, g.lon);
    const d = Math.hypot(x - px, y - py);
    if (d < bd) {
      bd = d;
      best = k;
    }
  }
  return best;
};
function shortest(from, to) {
  const d = new Map([[from, 0]]);
  const prev = new Map();
  const todo = new Set([from]);
  while (todo.size) {
    let cur = null;
    for (const k of todo) if (cur === null || d.get(k) < d.get(cur)) cur = k;
    todo.delete(cur);
    if (cur === to) break;
    for (const n of graph.get(cur) ?? []) {
      const nd = d.get(cur) + dist(cur, n);
      if (nd < (d.get(n) ?? Infinity)) {
        d.set(n, nd);
        prev.set(n, cur);
        todo.add(n);
      }
    }
  }
  const out = [];
  for (let k = to; k !== undefined; k = prev.get(k)) out.unshift(k);
  return out;
}
// the two ends of the trip: Tran Phu street in the south (beside the cable car station at Cau Da), the Pham Van Dong road in the north
const routeFrom = nearest(12.2032, 109.2146);
const routeTo = nearest(12.2822, 109.203);
const routeNodes = shortest(routeFrom, routeTo).map((k) => coordOf.get(k));
const routeLine = simplify(
  routeNodes.map((g) => project(g.lat, g.lon)),
  3,
);

// ---- the city: houses and towers along the real streets, palms along the beach road (decoration; the streets are real, the
// buildings are scattered along them with a seeded random so the map is the same for everybody)
let seed = 7;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// the part of the map that gets buildings: the city between Hon Chong and Cau Da, from the hills to the beach
const [cityX1, cityY1] = project(12.285, 109.17);
const [cityX2, cityY2] = project(12.19, 109.215);
const inCity = (x, y) =>
  x >= cityX1 && x <= cityX2 && y >= cityY1 && y <= cityY2;
const blocked = (x, y) =>
  !landRings.reduce((c, ring) => (inside(ring, x, y) ? !c : c), false) ||
  waterRingsOut.some((ring) => inside(ring, x, y)) ||
  woodRings.some((ring) => inside(ring, x, y)) ||
  beachRings.some((ring) => inside(ring, x, y));
const toRoute = (x, y) => {
  let best = Infinity;
  for (let i = 1; i < routeLine.length; i += 1)
    best = Math.min(
      best,
      perpendicular([x, y], routeLine[i - 1], routeLine[i]),
    );
  return best;
};
const buildings = [];
const taken = [];
const smallStreets = fs.existsSync(path.join(dir, 'streets.json'))
  ? read('streets')
      .filter((e) => e.geometry)
      .flatMap((e) =>
        clipLine(pts(e)).map((l) => ({
          line: simplify(l, 3),
          tertiary: e.tags.highway === 'tertiary',
        })),
      )
  : [];
const streets = [
  ...roadLines.major,
  ...roadLines.minor,
  ...smallStreets.map((s) => s.line),
];
for (const line of streets) {
  for (let i = 1; i < line.length; i += 1) {
    const [x1, y1] = line[i - 1];
    const [x2, y2] = line[i];
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 1) continue;
    const ux = (x2 - x1) / len;
    const uy = (y2 - y1) / len;
    for (let d = 0; d < len; d += 40) {
      for (const side of [-1, 1]) {
        if (rand() > 0.4) continue;
        const gap = 24 + rand() * 12;
        const cx = x1 + ux * d + -uy * side * gap;
        const cy = y1 + uy * d + ux * side * gap;
        if (!inCity(cx, cy)) continue;
        const w = 20 + rand() * 20;
        const dd = 18 + rand() * 14;
        if (
          [
            [0, 0],
            [w, 0],
            [0, dd],
            [w, dd],
          ].some(([ox, oy]) => blocked(cx + ox - w / 2, cy + oy - dd / 2))
        )
          continue;
        if (
          taken.some(
            ([tx, ty, tr]) => Math.hypot(tx - cx, ty - cy) < (tr + w) * 0.62,
          )
        )
          continue;
        const near = toRoute(cx, cy);
        const h =
          near < 220
            ? 34 + rand() * 62
            : near < 600
              ? 20 + rand() * 30
              : 12 + rand() * 18;
        taken.push([cx, cy, w]);
        buildings.push([
          r(cx),
          r(cy),
          r(w),
          r(dd),
          r(h),
          r((Math.atan2(uy, ux) * 180) / Math.PI / 5),
          Math.floor(rand() * 3),
        ]);
      }
    }
  }
}
const lineLength = (l) =>
  l.reduce(
    (n, p, i) =>
      i ? n + Math.hypot(p[0] - l[i - 1][0], p[1] - l[i - 1][1]) : 0,
    0,
  );
minorRoads += joinPaths(
  smallStreets
    .filter((s) => s.tertiary && lineLength(s.line) > 90)
    .map((s) => toPath(s.line, false)),
);
buildings.sort((a, b) => a[1] - b[1]);
const palms = [];
for (let i = 1; i < routeLine.length; i += 1) {
  const [x1, y1] = routeLine[i - 1];
  const [x2, y2] = routeLine[i];
  const len = Math.hypot(x2 - x1, y2 - y1);
  const lat = LAT_N - y1 / UNITS_PER_DEG;
  if (lat < 12.205 || lat > 12.268) continue;
  for (let d = 0; d < len; d += 46) {
    const px = x1 + ((x2 - x1) * d) / len + 17;
    const py = y1 + ((y2 - y1) * d) / len;
    if (!landRings.reduce((c, ring) => (inside(ring, px, py) ? !c : c), false))
      continue;
    palms.push([r(px), r(py)]);
  }
}

// ---- peaks
const peaks = read('peaks')
  .filter((e) => Number(e.tags?.ele) > 100)
  .map((e) => {
    const [x, y] = project(e.lat, e.lon);
    return [r(x), r(y), Number(e.tags.ele)];
  })
  .filter(([x, y]) => x > 0 && y > 0 && x < WIDTH && y < HEIGHT);

const q = (s) => JSON.stringify(s);
const out = `/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * GENERATED by scripts/travel/build-geo.mjs from OpenStreetMap (© OpenStreetMap contributors, ODbL): do not edit by hand.
 * Every path is in "plane units" (1 unit = 1/20000 of a degree of latitude, about 5.5 m), x to the east, y to the south, with the
 * equirectangular projection below. Sights and stations are placed from real latitude and longitude by \`projection.ts\`.
 */

export const GEO_BOX = {
  north: ${LAT_N},
  west: ${LNG_W},
  south: ${LAT_S},
  east: ${LNG_E},
  unitsPerDegree: ${UNITS_PER_DEG},
  width: ${WIDTH},
  height: ${HEIGHT},
} as const;

/** The mainland and the islands of the bay (one path, filled). */
export const LAND = ${q(joinPaths(land))};
/** Built-up areas (residential, commercial, industrial). */
export const BUILT = ${q(built)};
/** Forest and woodland. */
export const WOODS = ${q(woods)};
/** Lakes, reservoirs and the wide part of the Cai River. */
export const WATER = ${q(water)};
/** The Cai River and the other rivers, as lines. */
export const RIVERS = ${q(rivers)};
/** Beaches (sand). */
export const BEACHES = ${q(beaches)};
/** Trunk and primary roads. */
export const ROADS_MAJOR = ${q(majorRoads)};
/** Secondary roads. */
export const ROADS_MINOR = ${q(minorRoads)};
/** The coast road from Tran Phu (south) to Pham Van Dong (north), as points. */
// prettier-ignore
export const COAST_ROAD: readonly (readonly [number, number])[] = ${JSON.stringify(routeLine.map(([x, y]) => [r(x), r(y)]))};
/** Houses and towers placed along the real streets: [x, y, width, depth, height, angle in 5 degree steps, colour 0 to 2]. */
// prettier-ignore
export const CITY: readonly (readonly number[])[] = ${JSON.stringify(buildings)};
/** Palms along the beach road: [x, y]. */
// prettier-ignore
export const PALMS: readonly (readonly [number, number])[] = ${JSON.stringify(palms)};
/** Peaks as [x, y, metres]. */
// prettier-ignore
export const PEAKS: readonly (readonly [number, number, number])[] = ${JSON.stringify(peaks)};
`;
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log(
  `${outFile}: ${(out.length / 1024).toFixed(1)} KB, islands ${islandCount}, route ${routeLine.length} points, peaks ${peaks.length}, buildings ${buildings.length}, palms ${palms.length}`,
);
for (const [k, v] of Object.entries({
  land: joinPaths(land),
  built,
  woods,
  water,
  rivers,
  beaches,
  majorRoads,
  minorRoads,
})) {
  console.log(`  ${k}: ${(v.length / 1024).toFixed(1)} KB`);
}
