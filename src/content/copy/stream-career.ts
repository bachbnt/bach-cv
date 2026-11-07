/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The few words only the career player of the Stream skin has (Home and Resume): the names of its controls and of its chapters.
 * `{speed}`, `{company}`, `{role}` and `{period}` are replaced by the component.
 */
export const careerCopy = defineCopy(
  {
    player: {
      label: 'My career, played scene by scene',
      play: 'Play the career',
      pause: 'Pause the career',
      replay: 'Replay the career',
      speed: 'Playback speed: {speed}',
    },
    chapters: {
      label: 'Chapters',
      item: '{company}, {role}, {period}',
    },
    pinned: 'Pinned',
    playlist: 'Playlist',
  },
  {
    player: {
      label: 'Hành trình nghề nghiệp của mình, phát từng cảnh',
      play: 'Phát hành trình',
      pause: 'Tạm dừng hành trình',
      replay: 'Xem lại hành trình',
      speed: 'Tốc độ phát: {speed}',
    },
    chapters: {
      label: 'Các chương',
      item: '{company}, {role}, {period}',
    },
    pinned: 'Đã ghim',
    playlist: 'Danh sách phát',
  },
);
