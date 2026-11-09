/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { chartStore } from '@/skins/trade/chart/chart-store';
import type { ToolId } from '@/skins/trade/chart/chart-types';
import type { Drawing, Point } from '@/skins/trade/chart/drawings';
import type { NoteAt, Pending } from '@/skins/trade/chart/gesture-types';

let counter = 0;
export const newId = () => `d${(counter += 1)}`;

/**
 * What is half made while a drawing tool is in use: the first click waiting for its second (`pendingRef`), the drawing that follows the
 * pointer (`draft`), the one being moved (`dragging`), the box of the measure tool and the text note being typed. Nothing reaches the
 * shared store until a drawing is finished, so each one is a single step of undo.
 */
export function useDrawingSession(tool: ToolId) {
  const [draft, setDraft] = useState<Drawing | null>(null);
  const [dragging, setDragging] = useState<Drawing | null>(null);
  const [measureBox, setMeasureBox] = useState<{ a: Point; b: Point } | null>(
    null,
  );
  const [note, setNote] = useState<NoteAt | null>(null);
  const dragRef = useRef<Drawing | null>(null);
  const pendingRef = useRef<Pending | null>(null);

  const setLive = useCallback((drawing: Drawing | null) => {
    dragRef.current = drawing;
    setDragging(drawing);
  }, []);

  /** Drops everything that is half made. */
  const reset = useCallback(() => {
    pendingRef.current = null;
    setDraft(null);
    setLive(null);
    setMeasureBox(null);
    setNote(null);
  }, [setLive]);

  // changing the tool drops a half-made drawing
  useEffect(() => {
    pendingRef.current = null;
  }, [tool]);

  const finish = (kind: Pending['kind'], first: Point, second: Point) => {
    pendingRef.current = null;
    setDraft(null);
    chartStore.finishTool();
    if (kind === 'measure') {
      setMeasureBox({ a: first, b: second });
      return;
    }
    chartStore.put({ id: newId(), kind, points: [first, second] });
  };

  const finishNote = (text: string | null) => {
    const at = note;
    setNote(null);
    chartStore.finishTool();
    if (text && at)
      chartStore.put({ id: newId(), kind: 'text', points: [at.point], text });
  };

  return {
    draft,
    dragging,
    measureBox,
    note,
    dragRef,
    pendingRef,
    setDraft,
    setLive,
    setMeasureBox,
    setNote,
    reset,
    finish,
    finishNote,
  };
}

export type DrawingSession = ReturnType<typeof useDrawingSession>;
