/** Services */
import { FirewallsApiService } from './api-services/firewalls-api.service';
import { JobsApiService } from './api-services/jobs-api.service';
import { MediaApiService } from './api-services/media-api.service';
import { OptionsApiService } from './api-services/options-api.service';
import { OrdersApiService } from './api-services/orders-api.service';
import { ProductsApiService } from './api-services/products-api.service';
import { ResourcesApiService } from './api-services/resources-api.service';
import { ServersApiService } from './api-services/servers-api.service';
import { TicketsApiService } from './api-services/tickets-api.service';
import { ToolsApiService } from './api-services/tools-api.service';
import { ConsoleApiService } from './api-services/console-api.service';
import { CompaniesApiService } from './api-services/companies-api.service';

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

/** Guards */
import { RequiredResourcesGuard } from './guards/required-resources.guard';

/**
 * List of services for the main module
 */
export const servicesProviders: any[] = [
  FirewallsApiService,
  JobsApiService,
  MediaApiService,
  OptionsApiService,
  OrdersApiService,
  ProductsApiService,
  ResourcesApiService,
  ServersApiService,
  TicketsApiService,
  ToolsApiService,
  ConsoleApiService,
  CompaniesApiService,

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

  RequiredResourcesGuard
];
