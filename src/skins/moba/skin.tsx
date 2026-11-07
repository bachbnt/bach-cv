/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { SkinDefinition } from '@/skins/types';
import { AboutPage } from '@/skins/moba/pages/about';
import { CertificatesPage } from '@/skins/moba/pages/certificates';
import { HomePage } from '@/skins/moba/pages/home';
import { PaymentPage } from '@/skins/moba/pages/payment';
import { ProjectsPage } from '@/skins/moba/pages/projects';
import { ResumePage } from '@/skins/moba/pages/resume';
import { ServicesPage } from '@/skins/moba/pages/services';
import { MobaShell } from '@/skins/moba/shell/moba-shell';
import { MbMaintenance } from '@/skins/moba/ui/mb-maintenance';
import { MbNotFound } from '@/skins/moba/ui/mb-not-found';
import '@/skins/moba/moba.css';
import '@/skins/moba/css/map.css';
import '@/skins/moba/css/ui.css';
import '@/skins/moba/css/hud.css';
import '@/skins/moba/css/panel.css';
import '@/skins/moba/css/states.css';
import '@/skins/moba/css/home.css';
import '@/skins/moba/css/resume.css';
import '@/skins/moba/css/about.css';
import '@/skins/moba/css/projects.css';
import '@/skins/moba/css/certificates.css';
import '@/skins/moba/css/services.css';
import '@/skins/moba/css/payment.css';

/** The Moba skin: the site as an in-game arena. */
const mobaSkin: SkinDefinition = {
  id: 'moba',
  Frame: MobaShell,
  pages: {
    home: HomePage,
    about: AboutPage,
    resume: ResumePage,
    projects: ProjectsPage,
    certificates: CertificatesPage,
    services: ServicesPage,
    payment: PaymentPage,
  },
  NotFound: MbNotFound,
  Maintenance: MbMaintenance,
};

export default mobaSkin;
