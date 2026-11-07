/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { CareerPlaylist } from '@/skins/stream/blocks/career-playlist';
import { CareerResume } from '@/skins/stream/blocks/career-resume';
import { CareerSkills } from '@/skins/stream/blocks/career-skills';
import { StreamPage } from '@/skins/stream/ui/stream-page';

/**
 * Resume as the full replay of the career: the chapters as a big timeline, the roles as a transcript, the skills (the core stack pinned,
 * the rest as hashtags by area) and the education as a playlist.
 */
export function ResumePage() {
  return (
    <StreamPage page='resume'>
      <CareerResume />
      <CareerSkills />
      <CareerPlaylist />
    </StreamPage>
  );
}
