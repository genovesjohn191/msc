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
import { McsApiColocationsService } from './services/mcs-api-colocations.service';
import { McsApiResourcesService } from './services/mcs-api-resources.service';
import { McsApiServersService } from './services/mcs-api-servers.service';
import { McsApiBatsService } from './services/mcs-api-bats.service';
import { McsApiTicketsService } from './services/mcs-api-tickets.service';
import { McsApiToolsService } from './services/mcs-api-tools.service';
import { McsApiSystemService } from './services/mcs-api-system.service';
import { McsApiInternetService } from './services/mcs-api-internet.service';
import { McsApiNetworkDnsService } from './services/mcs-api-network-dns.service';
import { McsApiIdentityService } from './services/mcs-api-identity.service';
import { McsApiPlatformService } from './services/mcs-api-platform.service';
import { McsApiLicensesService } from './services/mcs-api-licenses.service';

import { McsApiMockInterceptor } from './interceptors/mcs-api-mock.interceptor';
import { McsApiAccountService } from './services/mcs-api-account.service';
import { McsApiAzureResourcesService } from './services/mcs-api-azure-resources.service';
import { McsApiAzureServicesService } from './services/mcs-api-azure-services.service';
import { McsApiReportsService } from './services/mcs-api-reports.service';
import { McsApiWorkflowsService } from './services/mcs-api-workflows.services';
import { McsApiObjectsService } from './services/mcs-api-objects.service';
import { McsApiMetadataService } from './services/mcs-api-metadata.service';
import { McsApiAvailabilityZonesService } from './services/mcs-api-availability-zones.service';
import { McsApiTenantsService } from './services/mcs-api-tenants.service';
import { McsApiTerraformService } from './services/mcs-api-terraform.service';
import { McsApiCloudHealthAlertService } from './services/mcs-api-cloudhealth-alert.service';

export const apiClientProviders: Provider[] = [
  McsApiClientHttpService,
  McsApiClientFactory,

  McsApiAccountService,
  McsApiAvailabilityZonesService,
  McsApiAzureResourcesService,
  McsApiAzureServicesService,
  McsApiBatsService,
  McsApiCatalogService,
  McsApiCloudHealthAlertService,
  McsApiColocationsService,
  McsApiCompaniesService,
  McsApiConsoleService,
  McsApiFirewallsService,
  McsApiIdentityService,
  McsApiInternetService,
  McsApiJobsService,
  McsApiLicensesService,
  McsApiMediaService,
  McsApiMetadataService,
  McsApiNetworkDnsService,
  McsApiObjectsService,
  McsApiOrdersService,
  McsApiPlatformService,
  McsApiReportsService,
  McsApiResourcesService,
  McsApiServersService,
  McsApiSystemService,
  McsApiTenantsService,
  McsApiTerraformService,
  McsApiTicketsService,
  McsApiToolsService,
  McsApiWorkflowsService
];

export const apiClientInterceptors: Provider[] = [
  { provide: HTTP_INTERCEPTORS, useClass: McsApiMockInterceptor, multi: true },
];
