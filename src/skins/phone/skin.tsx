/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { SkinDefinition } from '@/skins/types';
import { AboutPage } from '@/skins/phone/pages/about';
import { CertificatesPage } from '@/skins/phone/pages/certificates';
import { HomePage } from '@/skins/phone/pages/home';
import { PaymentPage } from '@/skins/phone/pages/payment';
import { ProjectsPage } from '@/skins/phone/pages/projects';
import { ResumePage } from '@/skins/phone/pages/resume';
import { ServicesPage } from '@/skins/phone/pages/services';
import { PhoneShell } from '@/skins/phone/shell/phone-shell';
import { PhMaintenanceScreen } from '@/skins/phone/ui/ph-maintenance-screen';
import { PhNotFound } from '@/skins/phone/ui/ph-not-found';
import { PhPageError } from '@/skins/phone/ui/ph-page-error';
import '@/skins/phone/phone.css';

/** The Phone skin: the site as the interface of a mobile operating system. */
const phoneSkin: SkinDefinition = {
  id: 'phone',
  Frame: PhoneShell,
  pages: {
    home: HomePage,
    about: AboutPage,
    resume: ResumePage,
    projects: ProjectsPage,
    certificates: CertificatesPage,
    services: ServicesPage,
    payment: PaymentPage,
  },
  NotFound: PhNotFound,
  PageError: PhPageError,
  Maintenance: PhMaintenanceScreen,
};

export default phoneSkin;
