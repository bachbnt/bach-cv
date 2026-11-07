/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { SkinDefinition } from '@/skins/types';
import { AboutPage } from '@/skins/stream/pages/about';
import { CertificatesPage } from '@/skins/stream/pages/certificates';
import { HomePage } from '@/skins/stream/pages/home';
import { PaymentPage } from '@/skins/stream/pages/payment';
import { ProjectsPage } from '@/skins/stream/pages/projects';
import { ResumePage } from '@/skins/stream/pages/resume';
import { ServicesPage } from '@/skins/stream/pages/services';
import { StreamShell } from '@/skins/stream/shell/stream-shell';
import { StreamMaintenanceScreen } from '@/skins/stream/ui/stream-maintenance-screen';
import { StreamNotFound } from '@/skins/stream/ui/stream-not-found';
import '@/skins/stream/stream.css';
import '@/skins/stream/css/career.css';
import '@/skins/stream/css/library.css';
import '@/skins/stream/css/channel.css';

/** The Stream skin: the site as a video platform (watch page, Shorts, a live channel). */
const streamSkin: SkinDefinition = {
  id: 'stream',
  Frame: StreamShell,
  pages: {
    home: HomePage,
    about: AboutPage,
    resume: ResumePage,
    projects: ProjectsPage,
    certificates: CertificatesPage,
    services: ServicesPage,
    payment: PaymentPage,
  },
  NotFound: StreamNotFound,
  Maintenance: StreamMaintenanceScreen,
};

export default streamSkin;
