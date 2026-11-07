/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { CareerContact } from '@/skins/stream/blocks/career-contact';
import { CareerProjects } from '@/skins/stream/blocks/career-projects';
import { CareerBuilt, CareerFlow } from '@/skins/stream/blocks/career-steps';
import { CareerWatch } from '@/skins/stream/blocks/career-watch';
import { StreamPage } from '@/skins/stream/ui/stream-page';

/**
 * Home as the watch page of a career: the player that plays the roles at 2x, the title and the description under it, the chapters panel,
 * then the pipeline, what I built at FPT, the featured projects and the contact band.
 */
export function HomePage() {
  return (
    <StreamPage page='home'>
      <CareerWatch />
      <CareerFlow />
      <CareerBuilt />
      <CareerProjects />
      <CareerContact />
    </StreamPage>
  );
}
