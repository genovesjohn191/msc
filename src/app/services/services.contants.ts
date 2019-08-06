import { McsApiService } from './mcs-api.service';

/** Repositories */
import { McsFirewallsRepository } from './repositories/mcs-firewalls.repository';
import { McsJobsRepository } from './repositories/mcs-jobs.repository';
import { McsMediaRepository } from './repositories/mcs-media.repository';
import { McsOrdersRepository } from './repositories/mcs-orders.repository';
import { McsProductCatalogRepository } from './repositories/mcs-product-catalog.repository';
import { McsProductsRepository } from './repositories/mcs-products.repository';
import { McsResourcesRepository } from './repositories/mcs-resources.repository';
import { McsServersOsRepository } from './repositories/mcs-servers-os.repository';
import { McsServersRepository } from './repositories/mcs-servers.repository';
import { McsTicketsRepository } from './repositories/mcs-tickets.repository';
import { McsConsoleRepository } from './repositories/mcs-console.repository';
import { McsCompaniesRepository } from './repositories/mcs-companies.repository';
import { McsInternetRepository } from './repositories/mcs-internet.repository';
import { McsSystemMessagesRepository } from './repositories/mcs-system-messages.repository';

/** State Managers */
import { McsJobManagerClient } from './job-manager/mcs-job-manager.client';
import { McsStateManagerClient } from './state-manager/mcs-state-manager.client';

export const repositoryProviders: any[] = [
  McsFirewallsRepository,
  McsJobsRepository,
  McsMediaRepository,
  McsOrdersRepository,
  McsProductCatalogRepository,
  McsProductsRepository,
  McsResourcesRepository,
  McsServersOsRepository,
  McsServersRepository,
  McsTicketsRepository,
  McsConsoleRepository,
  McsCompaniesRepository,
  McsInternetRepository,
  McsSystemMessagesRepository,
  McsApiService
];

export const stateManagers: any[] = [
  McsJobManagerClient,
  McsStateManagerClient
];
