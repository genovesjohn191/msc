import { McsApiService } from './mcs-api.service';

/** New Repositories */
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
import { McsJobStateManager } from './state-manager/mcs-job.state-manager';
import { McsOrderStateManager } from './state-manager/mcs-order.state-manager';
import { McsJobContextStateManager } from './state-manager/mcs-job-context.state-manager';
import { McsSystemMessageStateManager } from './state-manager/mcs-system.state-manager';
import { McsTicketStateManager } from './state-manager/mcs-ticket.state-manager';

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
  McsJobStateManager,
  McsOrderStateManager,
  McsJobContextStateManager,
  McsSystemMessageStateManager,
  McsTicketStateManager
];
