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

/** Repositories */
import { FirewallsRepository } from './repositories/firewalls.repository';
import { MediaRepository } from './repositories/media.repository';
import { NotificationsRepository } from './repositories/notifications.repository';
import { OrderItemTypesRepository } from './repositories/order-item-types.repository';
import { OrdersRepository } from './repositories/orders.repository';
import { ProductCatalogRepository } from './repositories/product-catalog.repository';
import { ProductsRepository } from './repositories/products.repository';
import { ResourcesRepository } from './repositories/resources.repository';
import { ServersOsRepository } from './repositories/servers-os.repository';
import { ServersRepository } from './repositories/servers.repository';
import { TicketsRepository } from './repositories/tickets.repository';
import { ToolsRepository } from './repositories/tools.repository';

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

  FirewallsRepository,
  MediaRepository,
  NotificationsRepository,
  OrderItemTypesRepository,
  OrdersRepository,
  ProductCatalogRepository,
  ProductsRepository,
  ResourcesRepository,
  ServersOsRepository,
  ServersRepository,
  TicketsRepository,
  ToolsRepository,

  RequiredResourcesGuard
];
