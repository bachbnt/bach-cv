/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { SkinDefinition } from '@/skins/types';
import { AboutPage } from '@/skins/dev/pages/about';
import { CertificatesPage } from '@/skins/dev/pages/certificates';
import { HomePage } from '@/skins/dev/pages/home';
import { PaymentPage } from '@/skins/dev/pages/payment';
import { ProjectsPage } from '@/skins/dev/pages/projects';
import { ResumePage } from '@/skins/dev/pages/resume';
import { ServicesPage } from '@/skins/dev/pages/services';
import { DevShell } from '@/skins/dev/shell/dev-shell';
import { DevMaintenanceScreen } from '@/skins/dev/ui/dev-maintenance-screen';
import { DevNotFound } from '@/skins/dev/ui/dev-not-found';
import '@/skins/dev/dev.css';
import '@/skins/dev/dev-extra.css';
import '@/skins/dev/css/home-about.css';
import '@/skins/dev/css/services-chat-cv.css';

/** The Dev skin: the site as the window of a code editor. */
const devSkin: SkinDefinition = {
  id: 'dev',
  Frame: DevShell,
  pages: {
    home: HomePage,
    about: AboutPage,
    resume: ResumePage,
    projects: ProjectsPage,
    certificates: CertificatesPage,
    services: ServicesPage,
    payment: PaymentPage,
  },
  NotFound: DevNotFound,
  Maintenance: DevMaintenanceScreen,
};

export default devSkin;
