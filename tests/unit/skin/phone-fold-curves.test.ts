/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { readFileSync } from 'node:fs';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
import {
  bezier,
  dimAt,
  DIM_DONE,
  DIM_MAX,
  EASE_FOLD,
  LIGHT_FROM,
  motionMs,
  swingAngle,
  SWING_MS,
  verticalAt,
} from '@/skins/phone/shell/fold-dim';
import {
  hingeRadius,
  HINGE_FULL_UNTIL,
  HINGE_RADIUS,
  HINGE_SQUARE_AT,
} from '@/skins/phone/shell/fold-corner';
import { PHASES } from '@/skins/phone/shell/fold-motion';
import {
  nearEdge,
  PULL,
  pullAt,
  PULL_STOPS,
  silhouetteAt,
} from '@/skins/phone/shell/fold-pull';

const css = postcss.parse(
  readFileSync('src/skins/phone/css/device.css', 'utf8'),
);

/** The stops of a @keyframes rule of the CSS: for each declared percent the value of `prop`. */
function stops(name: string, prop: string): Map<number, string> {
  const found = new Map<number, string>();
  css.walkAtRules('keyframes', (rule) => {
    if (rule.params !== name) return;
    rule.walkRules((frame) => {
      frame.walkDecls(prop, (decl) => {
        for (const part of frame.selector.split(',')) {
          const key = part.trim();
          const percent =
            key === 'from' ? 0 : key === 'to' ? 100 : parseFloat(key);
          found.set(percent, decl.value);
        }
      });
    });
  });
  return found;
}

describe('the dimming of the screen over a fold', () => {
  for (const direction of ['unfold', 'fold'] as const)
    describe(direction, () => {
      const steps = 20;
      const curve = Array.from({ length: steps + 1 }, (_, i) =>
        dimAt(i / steps, direction),
      );

      it('starts and ends at full light and is at its dimmest in the middle, never black', () => {
        expect(curve[0]).toBe(0);
        expect(curve[steps]).toBe(0);
        expect(Math.max(...curve)).toBeCloseTo(DIM_MAX, 5);
        // at 12% of the light, never 0%: the glass never gets above its maximum
        expect(Math.max(...curve)).toBeLessThanOrEqual(DIM_MAX);
        expect(1 - DIM_MAX).toBeCloseTo(0.12, 5);
      });

      it('never changes by more than a fifth between two samples 5% apart', () => {
        for (let i = 1; i <= steps; i++)
          expect(Math.abs(curve[i] - curve[i - 1])).toBeLessThanOrEqual(0.2);
      });

      it('goes down to its dimmest once and comes up once: no flicker', () => {
        const peak = curve.indexOf(Math.max(...curve));
        for (let i = 1; i <= peak; i++)
          expect(curve[i]).toBeGreaterThanOrEqual(curve[i - 1] - 1e-9);
        let last = peak;
        while (curve[last] >= DIM_MAX - 1e-9 && last < steps) last++;
        for (let i = last + 1; i <= steps; i++)
          expect(curve[i]).toBeLessThanOrEqual(curve[i - 1] + 1e-9);
      });
    });

  it('has the same length as the phases that play it', () => {
    expect(motionMs('unfold')).toBe(
      PHASES.sliding.ms + PHASES.swinging.ms + PHASES.landing.ms,
    );
    expect(motionMs('fold')).toBe(
      PHASES.folding.ms + PHASES.closing.ms + PHASES.returning.ms,
    );
  });

  it('is at its dimmest when the layout is swapped, either way', () => {
    // unfolding: the swap is at the start of landing, before the light comes up (at 90 degrees)
    expect(PHASES.swinging.ms / SWING_MS).toBeLessThanOrEqual(LIGHT_FROM);
    // folding: the swap is at the start of closing, when the dimming is done
    expect(PHASES.folding.ms / SWING_MS).toBeGreaterThanOrEqual(
      DIM_DONE - 0.005,
    );
  });

  it('starts to light the inner screen as the half passes the vertical, and has dimmed it before the half has closed to 60 degrees', () => {
    expect(verticalAt()).toBeCloseTo(LIGHT_FROM, 2);
    expect(swingAngle(verticalAt())).toBeCloseTo(90, 1);
    // closing: the angle at the end of the dimming
    expect(180 * (1 - bezier(EASE_FOLD, DIM_DONE))).toBeLessThan(75);
  });

  it('is what the keyframes of the CSS say', () => {
    const up = stops('ph-fold-dim-up', 'opacity');
    expect([...up.keys()].sort((a, b) => a - b)).toEqual([0, 35, 100]);
    expect(LIGHT_FROM * 100).toBe(35);
    const close = stops('ph-fold-dim-close', 'opacity');
    expect([...close.keys()].sort((a, b) => a - b)).toEqual([0, 42, 100]);
    expect(DIM_DONE * 100).toBe(42);
    expect(readFileSync('src/skins/phone/css/device.css', 'utf8')).toContain(
      `--ph-dim: ${DIM_MAX};`,
    );
  });
});

describe('the corner on the hinge side of a half', () => {
  it("is the cover's up to 50 degrees, square from 100 on, and a straight ramp between", () => {
    for (const angle of [0, 10, 20, 30, 45, 50])
      expect(hingeRadius(angle)).toBe(HINGE_RADIUS);
    for (const angle of [100, 120, 150, 180])
      expect(hingeRadius(angle)).toBe(0);
    for (let angle = 51; angle <= 100; angle++)
      expect(hingeRadius(angle)).toBeLessThanOrEqual(hingeRadius(angle - 1));
    expect(hingeRadius(75)).toBeCloseTo(HINGE_RADIUS / 2, 5);
    // a corner that is visibly rounded while the half is over the other one (6 px or more)
    expect(hingeRadius(HINGE_FULL_UNTIL)).toBeGreaterThanOrEqual(6);
    expect(HINGE_SQUARE_AT).toBeGreaterThan(HINGE_FULL_UNTIL);
  });

  it('is what the keyframes of the CSS say, at every stop, going either way', () => {
    const open = stops('ph-fold-hinge-open', '--ph-hinge-r');
    for (const [percent, value] of open)
      expect(parseFloat(value)).toBeCloseTo(
        hingeRadius(swingAngle(percent / 100)),
        1,
      );
    const close = stops('ph-fold-hinge-close', '--ph-hinge-r');
    for (const [percent, value] of close)
      expect(parseFloat(value)).toBeCloseTo(
        hingeRadius(180 - swingAngle(percent / 100)),
        1,
      );
    expect(open.size).toBeGreaterThan(4);
    expect(close.size).toBeGreaterThan(4);
  });
});

describe('the pull-back of the device while a half comes toward the viewer', () => {
  it('is 1 at both ends and the least at the vertical', () => {
    expect(pullAt(0)).toBe(1);
    expect(pullAt(1)).toBeCloseTo(1, 5);
    expect(pullAt(verticalAt())).toBeCloseTo(1 - PULL, 3);
    for (const x of [0.1, 0.2, 0.5, 0.8])
      expect(pullAt(x)).toBeGreaterThan(1 - PULL);
  });

  it('keeps the near edge of the half no taller than the device at any angle, and the perspective enlarges it by about a tenth', () => {
    expect(nearEdge(90)).toBeLessThan(1.12);
    expect(nearEdge(90)).toBeGreaterThan(1.06);
    for (let i = 0; i <= 100; i++) {
      const x = i / 100;
      expect(silhouetteAt(x, swingAngle(x))).toBeLessThanOrEqual(1.0001);
    }
  });

  it('is what the keyframes of the CSS say at every stop', () => {
    const found = stops('ph-fold-pull', 'scale');
    for (const x of PULL_STOPS) {
      const value = found.get(Math.round(x * 100));
      // 0% and 100% are declared together as 1
      expect(value ? parseFloat(value) : 1).toBeCloseTo(pullAt(x), 3);
    }
  });
});
