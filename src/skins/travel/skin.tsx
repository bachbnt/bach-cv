/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { SkinDefinition } from '@/skins/types';
import { AboutPage } from '@/skins/travel/pages/about';
import { CertificatesPage } from '@/skins/travel/pages/certificates';
import { HomePage } from '@/skins/travel/pages/home';
import { PaymentPage } from '@/skins/travel/pages/payment';
import { ProjectsPage } from '@/skins/travel/pages/projects';
import { ResumePage } from '@/skins/travel/pages/resume';
import { ServicesPage } from '@/skins/travel/pages/services';
import { TravelShell } from '@/skins/travel/shell/travel-shell';
import { TlMaintenanceScreen } from '@/skins/travel/ui/tl-maintenance-screen';
import { TlNotFound } from '@/skins/travel/ui/tl-not-found';
import '@/skins/travel/travel.css';
import '@/skins/travel/css/map.css';
import '@/skins/travel/css/sky.css';
import '@/skins/travel/css/ground.css';
import '@/skins/travel/css/sights.css';
import '@/skins/travel/css/tags.css';
import '@/skins/travel/css/pins.css';
import '@/skins/travel/css/still.css';
import '@/skins/travel/css/sprites.css';
import '@/skins/travel/css/overlays.css';
import '@/skins/travel/css/pages-trip.css';
import '@/skins/travel/css/pages-postcards.css';
import '@/skins/travel/css/pages-desk.css';

/** The Travel skin: the site as a trip map of Nha Trang. */
const travelSkin: SkinDefinition = {
  id: 'travel',
  Frame: TravelShell,
  pages: {
    home: HomePage,
    about: AboutPage,
    resume: ResumePage,
    projects: ProjectsPage,
    certificates: CertificatesPage,
    services: ServicesPage,
    payment: PaymentPage,
  },
  NotFound: TlNotFound,
  Maintenance: TlMaintenanceScreen,
};

export default travelSkin;
