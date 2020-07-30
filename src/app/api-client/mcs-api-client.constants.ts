import { Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { McsApiClientHttpService } from './mcs-api-client-http.service';
import { McsApiClientFactory } from './mcs-api-client.factory';

import { McsApiCompaniesService } from './services/mcs-api-companies.service';
import { McsApiConsoleService } from './services/mcs-api-console.service';
import { McsApiFirewallsService } from './services/mcs-api-firewalls.service';
import { McsApiJobsService } from './services/mcs-api-jobs.service';
import { McsApiMediaService } from './services/mcs-api-media.service';
import { McsApiOrdersService } from './services/mcs-api-orders.service';
import { McsApiCatalogService } from './services/mcs-api-catalog.service';
import { McsApiResourcesService } from './services/mcs-api-resources.service';
import { McsApiServersService } from './services/mcs-api-servers.service';
import { McsApiBatsService } from './services/mcs-api-bats.service';
import { McsApiTicketsService } from './services/mcs-api-tickets.service';
import { McsApiToolsService } from './services/mcs-api-tools.service';
import { McsApiSystemService } from './services/mcs-api-system.service';
import { McsApiInternetService } from './services/mcs-api-internet.service';
import { McsApiIdentityService } from './services/mcs-api-identity.service';
import { McsApiPlatformService } from './services/mcs-api-platform.service';
import { McsApiLicensesService } from './services/mcs-api-licenses.service';

import { McsApiMockInterceptor } from './interceptors/mcs-api-mock.interceptor';
import { McsApiAccountService } from './services/mcs-api-account.service';
import { McsApiAzureResourcesService } from './services/mcs-api-azure-resources.service';
import { McsApiAzureServicesService } from './services/mcs-api-azure-services.service';
import { McsApiReportsService } from './services/mcs-api-reports.service';

export const apiClientProviders: Provider[] = [
  McsApiClientHttpService,
  McsApiClientFactory,

  McsApiCompaniesService,
  McsApiConsoleService,
  McsApiFirewallsService,
  McsApiJobsService,
  McsApiPlatformService,
  McsApiMediaService,
  McsApiOrdersService,
  McsApiCatalogService,
  McsApiResourcesService,
  McsApiServersService,
  McsApiBatsService,
  McsApiTicketsService,
  McsApiToolsService,
  McsApiInternetService,
  McsApiSystemService,
  McsApiIdentityService,
  McsApiLicensesService,
  McsApiAccountService,
  McsApiAzureResourcesService,
  McsApiAzureServicesService,
  McsApiReportsService
];

export const apiClientInterceptors: Provider[] = [
  { provide: HTTP_INTERCEPTORS, useClass: McsApiMockInterceptor, multi: true },
];
