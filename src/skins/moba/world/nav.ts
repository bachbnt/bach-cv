/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  BARON_PIT,
  BLUE_BASE,
  DRAGON_PIT,
  LANE_IDS,
  LANES,
  RED_BASE,
  dist,
  lerp,
  roundedLine,
  type Pt,
} from '@/skins/moba/world/geometry';
import { STATIONS } from '@/skins/moba/world/stations';

/** The places the champion can stand: the lanes, the river path, the paths to the stations and the two bases. */
export interface NavGraph {
  nodes: Pt[];
  edges: [number, number][];
  adjacency: { to: number; weight: number }[][];
  /** the paths that are not a lane (the river path and the trails to the stations), for drawing */
  trails: Pt[][];
  /** the node of each station, by id */
  stationNodes: Map<string, number>;
}

const SNAP = 6;

/** The map is built once: its lanes never change. */
export function buildGraph(): NavGraph {
  const nodes: Pt[] = [];
  const edges: [number, number][] = [];
  const trails: Pt[][] = [];
  const nodeAt = (p: Pt): number => {
    const found = nodes.findIndex((n) => dist(n, p) <= SNAP);
    if (found >= 0) return found;
    nodes.push(p);
    return nodes.length - 1;
  };
  const connect = (a: number, b: number) => {
    if (a !== b) edges.push([a, b]);
  };
  const addLine = (line: Pt[]) => {
    for (let i = 1; i < line.length; i += 1)
      connect(nodeAt(line[i - 1]), nodeAt(line[i]));
  };

  for (const lane of LANE_IDS) addLine(LANES[lane].samples);

  // the river path runs from the baron pit to the dragon pit through the centre, where it meets the mid lane
  const centre = { x: 600, y: 600 };
  const river = [
    ...roundedLine([BARON_PIT, centre], 0).samples,
    ...roundedLine([centre, DRAGON_PIT], 0).samples.slice(1),
  ];
  addLine(river);
  trails.push(river);

  // each base joins the start of every lane
  const blue = nodeAt(BLUE_BASE);
  const red = nodeAt(RED_BASE);
  for (const lane of LANE_IDS) {
    const line = LANES[lane].samples;
    connect(blue, nodeAt(line[0]));
    connect(red, nodeAt(line[line.length - 1]));
  }

  // a station that is not on a path gets a trail to the nearest node
  const stationNodes = new Map<string, number>();
  for (const station of STATIONS) {
    const near = nodes.findIndex((n) => dist(n, station.at) <= SNAP);
    if (near >= 0) {
      stationNodes.set(station.id, near);
      continue;
    }
    let best = 0;
    nodes.forEach((n, i) => {
      if (dist(n, station.at) < dist(nodes[best], station.at)) best = i;
    });
    const trail = [nodes[best], station.at];
    const id = nodeAt(station.at);
    connect(best, id);
    trails.push(trail);
    stationNodes.set(station.id, id);
  }

  const adjacency: NavGraph['adjacency'] = nodes.map(() => []);
  for (const [a, b] of edges) {
    const weight = dist(nodes[a], nodes[b]);
    adjacency[a].push({ to: b, weight });
    adjacency[b].push({ to: a, weight });
  }
  return { nodes, edges, adjacency, trails, stationNodes };
}

export const NAV: NavGraph = buildGraph();

export interface Spot {
  /** the point on the graph */
  at: Pt;
  /** the edge it lies on and how far along it (0 to 1) */
  edge: number;
  t: number;
}

/** The nearest point of the graph to `p`. */
export function snapToGraph(p: Pt, graph: NavGraph = NAV): Spot {
  let best: Spot = { at: graph.nodes[0], edge: 0, t: 0 };
  let bestDist = Infinity;
  graph.edges.forEach(([a, b], edge) => {
    const from = graph.nodes[a];
    const to = graph.nodes[b];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len2 = dx * dx + dy * dy;
    const t =
      len2 === 0
        ? 0
        : Math.min(
            1,
            Math.max(0, ((p.x - from.x) * dx + (p.y - from.y) * dy) / len2),
          );
    const at = lerp(from, to, t);
    const d = dist(at, p);
    if (d < bestDist) {
      bestDist = d;
      best = { at, edge, t };
    }
  });
  return best;
}

/** The shortest walk along the graph between two spots, as a polyline starting at `from.at` and ending at `to.at`. */
export function routeBetween(
  from: Spot,
  to: Spot,
  graph: NavGraph = NAV,
): Pt[] {
  if (from.edge === to.edge) return [from.at, to.at];
  const [fa, fb] = graph.edges[from.edge];
  const [ta, tb] = graph.edges[to.edge];
  const count = graph.nodes.length;
  const best = new Array<number>(count).fill(Infinity);
  const previous = new Array<number>(count).fill(-1);
  const done = new Array<boolean>(count).fill(false);
  best[fa] = dist(from.at, graph.nodes[fa]);
  best[fb] = dist(from.at, graph.nodes[fb]);
  // the graph has a few hundred nodes: a plain scan for the nearest open node is quick enough and needs no heap
  for (;;) {
    let current = -1;
    for (let i = 0; i < count; i += 1)
      if (
        !done[i] &&
        best[i] < Infinity &&
        (current < 0 || best[i] < best[current])
      )
        current = i;
    if (current < 0) break;
    done[current] = true;
    for (const { to: next, weight } of graph.adjacency[current]) {
      if (best[current] + weight < best[next]) {
        best[next] = best[current] + weight;
        previous[next] = current;
      }
    }
  }
  const viaA = best[ta] + dist(graph.nodes[ta], to.at);
  const viaB = best[tb] + dist(graph.nodes[tb], to.at);
  let node = viaA <= viaB ? ta : tb;
  const nodesBack: Pt[] = [];
  while (node >= 0) {
    nodesBack.push(graph.nodes[node]);
    node = previous[node];
  }
  return [from.at, ...nodesBack.reverse(), to.at];
}

/** The walk from a place to another one (each is moved onto the graph first). */
export function routeTo(from: Pt, to: Pt, graph: NavGraph = NAV): Pt[] {
  return dedupe(
    routeBetween(snapToGraph(from, graph), snapToGraph(to, graph), graph),
  );
}

/** A walk without the points that are the same place twice in a row. */
function dedupe(path: Pt[]): Pt[] {
  return path.filter((p, i) => i === 0 || dist(p, path[i - 1]) > 0.01);
}

export function pathLength(path: Pt[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i += 1) total += dist(path[i - 1], path[i]);
  return total;
}

/** Where a walker is after `walked` units of the path (the end when it is past it). */
export function pointAtDistance(path: Pt[], walked: number): Pt {
  let left = Math.max(0, walked);
  for (let i = 1; i < path.length; i += 1) {
    const step = dist(path[i - 1], path[i]);
    if (left <= step)
      return lerp(path[i - 1], path[i], step === 0 ? 0 : left / step);
    left -= step;
  }
  return path[path.length - 1];
}

/**
 * Walking by hand: the champion tries to go by `move`, and ends on the nearest point of a path, so it slides along a lane instead
 * of leaving it. It does not move when no path is within `reach` of where it wanted to go.
 */
export function slide(
  from: Pt,
  move: Pt,
  reach = 40,
  graph: NavGraph = NAV,
): Pt {
  const wanted = { x: from.x + move.x, y: from.y + move.y };
  const spot = snapToGraph(wanted, graph);
  return dist(spot.at, wanted) <= reach ? spot.at : from;
}
