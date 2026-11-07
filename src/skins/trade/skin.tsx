/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { SkinDefinition } from '@/skins/types';
import { AboutPage } from '@/skins/trade/pages/about';
import { CertificatesPage } from '@/skins/trade/pages/certificates';
import { HomePage } from '@/skins/trade/pages/home';
import { PaymentPage } from '@/skins/trade/pages/payment';
import { ProjectsPage } from '@/skins/trade/pages/projects';
import { ResumePage } from '@/skins/trade/pages/resume';
import { ServicesPage } from '@/skins/trade/pages/services';
import { TradeShell } from '@/skins/trade/shell/trade-shell';
import { TvMaintenanceScreen } from '@/skins/trade/ui/tv-maintenance-screen';
import { TvNotFound } from '@/skins/trade/ui/tv-not-found';
import '@/skins/trade/trade.css';
import '@/skins/trade/css/chart.css';
import '@/skins/trade/css/shell.css';
import '@/skins/trade/css/data.css';
import '@/skins/trade/css/desk.css';

/** The Trade skin: the site as a candlestick chart terminal. */
const tradeSkin: SkinDefinition = {
  id: 'trade',
  Frame: TradeShell,
  pages: {
    home: HomePage,
    about: AboutPage,
    resume: ResumePage,
    projects: ProjectsPage,
    certificates: CertificatesPage,
    services: ServicesPage,
    payment: PaymentPage,
  },
  NotFound: TvNotFound,
  Maintenance: TvMaintenanceScreen,
};

export default tradeSkin;
