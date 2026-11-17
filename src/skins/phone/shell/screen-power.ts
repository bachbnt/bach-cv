/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/*
 * The power button of the device: the screen is on (the page), off (black) or on the lock screen. The transitions that are legal are the whole
 * of this file, so that the shell and its tests agree.
 */

export type ScreenState = 'on' | 'off' | 'locked';
/** `power` is the button; `wake` a tap or a key on the black screen; `unlock` the swipe up, or its button, on the lock screen */
export type ScreenAction = 'power' | 'wake' | 'unlock';

/**
 * The state after an action. The power button turns the screen off from the page and from the lock screen and wakes it to the LOCK SCREEN, never
 * straight to the page; a tap on the black screen wakes it too; only `unlock` gets from the lock screen to the page. Any other action leaves the state.
 */
export function nextScreen(
  state: ScreenState,
  action: ScreenAction,
): ScreenState {
  switch (action) {
    case 'power':
      return state === 'off' ? 'locked' : 'off';
    case 'wake':
      return state === 'off' ? 'locked' : state;
    case 'unlock':
      return state === 'locked' ? 'on' : state;
  }
}

/** Whether what is in the screen can be used: only the page is. */
export const isUsable = (state: ScreenState): boolean => state === 'on';
