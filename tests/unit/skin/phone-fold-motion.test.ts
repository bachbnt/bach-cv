/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  endsPhase,
  foldMotion,
  foldRest,
  foldTarget,
  PHASES,
  phaseWait,
  type FoldMotion,
} from '@/skins/phone/shell/fold-motion';

const request = (state: FoldMotion, to: 'open' | 'folded') =>
  foldMotion(state, { type: 'request', to, animate: true });
const end = (state: FoldMotion) => foldMotion(state, { type: 'end' });

describe('the motion of an unfold', () => {
  it('slides in the phone layout, swings the cover half over in it, then changes the layout in one step while the half lands', () => {
    const sliding = request(foldRest('folded'), 'open');
    expect(sliding).toEqual({ drawn: 'folded', phase: 'sliding' });
    const swinging = end(sliding);
    expect(swinging).toEqual({ drawn: 'folded', phase: 'swinging' });
    const landing = end(swinging);
    expect(landing).toEqual({ drawn: 'open', phase: 'landing' });
    expect(end(landing)).toEqual(foldRest('open'));
  });
});

describe('the motion of a fold', () => {
  it('swings the half back over the open layout, changes the layout at the vertical, then slides back to the middle', () => {
    const folding = request(foldRest('open'), 'folded');
    // the layout is still the open one while the half starts to close, and the screen dims
    expect(folding).toEqual({ drawn: 'open', phase: 'folding' });
    const closing = end(folding);
    expect(closing).toEqual({ drawn: 'folded', phase: 'closing' });
    const returning = end(closing);
    expect(returning).toEqual({ drawn: 'folded', phase: 'returning' });
    expect(end(returning)).toEqual(foldRest('folded'));
  });

  it('changes the layout once each way, at the dimmest point of the screen (the start of landing, the start of closing)', () => {
    const changes = (to: 'open' | 'folded') => {
      let state = request(foldRest(to === 'open' ? 'folded' : 'open'), to);
      const at: string[] = [];
      for (let i = 0; i < 6 && state.phase !== 'idle'; i++) {
        const next = end(state);
        if (next.drawn !== state.drawn) at.push(next.phase);
        state = next;
      }
      return at;
    };
    expect(changes('open')).toEqual(['landing']);
    expect(changes('folded')).toEqual(['closing']);
  });

  it('takes about half a second either way: 180 and 380 to unfold, 310 and 180 to fold', () => {
    expect(PHASES.sliding.ms + PHASES.swinging.ms + PHASES.landing.ms).toBe(
      560,
    );
    expect(PHASES.folding.ms + PHASES.closing.ms + PHASES.returning.ms).toBe(
      490,
    );
  });
});

describe('the other cases', () => {
  it('swaps without a motion (reduced motion, no room)', () => {
    expect(
      foldMotion(foldRest('folded'), {
        type: 'request',
        to: 'open',
        animate: false,
      }),
    ).toEqual(foldRest('open'));
  });

  it('ignores a request while a motion plays, and one for the state it is in', () => {
    const moving = request(foldRest('open'), 'folded');
    expect(request(moving, 'open')).toBe(moving);
    expect(request(foldRest('open'), 'open')).toEqual(foldRest('open'));
  });

  it('comes to rest where it is told when the window changes', () => {
    expect(
      foldMotion(request(foldRest('open'), 'folded'), {
        type: 'reset',
        to: 'open',
      }),
    ).toEqual(foldRest('open'));
  });

  it('says where the device is going as soon as it is asked, for the Fold button', () => {
    expect(foldTarget(foldRest('open'))).toBe('open');
    expect(foldTarget(request(foldRest('open'), 'folded'))).toBe('folded');
    for (
      let state = request(foldRest('folded'), 'open');
      state.phase !== 'idle';
      state = end(state)
    )
      expect(foldTarget(state)).toBe('open');
  });

  it('ends a phase only with the animation that belongs to it, not with a late one of the step before', () => {
    const sliding = request(foldRest('folded'), 'open');
    expect(endsPhase(sliding, 'ph-fold-slide-display')).toBe(true);
    expect(endsPhase(sliding, 'ph-fold-open-flap')).toBe(false);
    // the swing is handed over by the clock, and its animation ends the landing
    const swinging = end(sliding);
    expect(endsPhase(swinging, 'ph-fold-open-flap')).toBe(false);
    expect(endsPhase(end(swinging), 'ph-fold-open-flap')).toBe(true);
    const folding = request(foldRest('open'), 'folded');
    expect(endsPhase(folding, 'ph-fold-close-flap')).toBe(false);
    // the swing back is handed over by the clock, through folding and closing; the slide back ends the returning
    expect(endsPhase(end(folding), 'ph-fold-close-flap')).toBe(false);
    expect(endsPhase(end(end(folding)), 'ph-fold-return-display')).toBe(true);
    expect(endsPhase(foldRest('open'), 'ph-fold-open-flap')).toBe(false);
  });

  it('waits for the clock a little after an event that does not come, and not at all longer than its time for one that has none', () => {
    expect(phaseWait('swinging')).toBe(PHASES.swinging.ms);
    expect(phaseWait('folding')).toBe(PHASES.folding.ms);
    expect(phaseWait('sliding')).toBeGreaterThan(PHASES.sliding.ms);
  });
});
