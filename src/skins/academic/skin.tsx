/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { SkinDefinition } from '@/skins/types';
import { AboutPage } from '@/skins/academic/pages/about';
import { CertificatesPage } from '@/skins/academic/pages/certificates';
import { HomePage } from '@/skins/academic/pages/home';
import { PaymentPage } from '@/skins/academic/pages/payment';
import { ProjectsPage } from '@/skins/academic/pages/projects';
import { ResumePage } from '@/skins/academic/pages/resume';
import { ServicesPage } from '@/skins/academic/pages/services';
import { AcademicShell } from '@/skins/academic/shell/academic-shell';
import { AcMaintenanceScreen } from '@/skins/academic/ui/ac-maintenance-screen';
import { AcNotFound } from '@/skins/academic/ui/ac-not-found';
import '@/skins/academic/academic.css';

/** The Academic skin: the site as a chalkboard (or a whiteboard) with an annotated manuscript pinned to it. */
const academicSkin: SkinDefinition = {
  id: 'academic',
  Frame: AcademicShell,
  pages: {
    home: HomePage,
    about: AboutPage,
    resume: ResumePage,
    projects: ProjectsPage,
    certificates: CertificatesPage,
    services: ServicesPage,
    payment: PaymentPage,
  },
  NotFound: AcNotFound,
  Maintenance: AcMaintenanceScreen,
};

export default academicSkin;
