/** New Repositories */
import { McsFirewallsRepository } from './repositories/mcs-firewalls.repository';
import { McsJobsRepository } from './repositories/mcs-jobs.repository';
import { McsMediaRepository } from './repositories/mcs-media.repository';
import { McsOrderItemTypesRepository } from './repositories/mcs-order-item-types.repository';
import { McsOrdersRepository } from './repositories/mcs-orders.repository';
import { McsProductCatalogRepository } from './repositories/mcs-product-catalog.repository';
import { McsProductsRepository } from './repositories/mcs-products.repository';
import { McsResourcesRepository } from './repositories/mcs-resources.repository';
import { McsServersOsRepository } from './repositories/mcs-servers-os.repository';
import { McsServersRepository } from './repositories/mcs-servers.repository';
import { McsTicketsRepository } from './repositories/mcs-tickets.repository';
import { McsToolsRepository } from './repositories/mcs-tools.repository';
import { McsConsoleRepository } from './repositories/mcs-console.repository';
import { McsCompaniesRepository } from './repositories/mcs-companies.repository';

/** State Managers */
import { McsJobStateManager } from './state-manager/mcs-job.state-manager';
import { McsServerStateManager } from './state-manager/mcs-server.state-manager';
import { McsMediaStateManager } from './state-manager/mcs-media.state-manager';
import { McsOrderStateManager } from './state-manager/mcs-order.state-manager';

/** Guards */
import { RequiredResourcesGuard } from './guards/required-resources.guard';

export const initializableProviders: any[] = [
  McsServerStateManager,
  McsMediaStateManager,
  McsJobStateManager,
  McsOrderStateManager
];

export const apiProviders: any[] = [

];

export const repositoryProviders: any[] = [
  McsFirewallsRepository,
  McsJobsRepository,
  McsMediaRepository,
  McsOrderItemTypesRepository,
  McsOrdersRepository,
  McsProductCatalogRepository,
  McsProductsRepository,
  McsResourcesRepository,
  McsServersOsRepository,
  McsServersRepository,
  McsTicketsRepository,
  McsToolsRepository,
  McsConsoleRepository,
  McsCompaniesRepository,
];

export const guardProviders: any[] = [
  RequiredResourcesGuard
];
