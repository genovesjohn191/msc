import { McsApiClientHttpService } from './mcs-api-client-http.service';
import { McsApiClientFactory } from './mcs-api-client.factory';

import { McsApiCompaniesService } from './services/mcs-api-companies.service';
import { McsApiConsoleService } from './services/mcs-api-console.service';
import { McsApiFirewallsService } from './services/mcs-api-firewalls.service';
import { McsApiJobsService } from './services/mcs-api-jobs.service';
import { McsApiMediaService } from './services/mcs-api-media.service';
import { McsApiOrdersService } from './services/mcs-api-orders.service';
import { McsApiProductsService } from './services/mcs-api-products.service';
import { McsApiResourcesService } from './services/mcs-api-resources.service';
import { McsApiServersService } from './services/mcs-api-servers.service';
import { McsApiTicketsService } from './services/mcs-api-tickets.service';
import { McsApiToolsService } from './services/mcs-api-tools.service';

/**
 * Array coverage for the api client modules
 */
export const apiClientProviders: any[] = [
  McsApiClientHttpService,
  McsApiClientFactory,

  McsApiCompaniesService,
  McsApiConsoleService,
  McsApiFirewallsService,
  McsApiJobsService,
  McsApiMediaService,
  McsApiOrdersService,
  McsApiProductsService,
  McsApiResourcesService,
  McsApiServersService,
  McsApiTicketsService,
  McsApiToolsService
];
