import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';

import { McsApiMockInterceptor } from './interceptors/mcs-api-mock.interceptor';
import { McsApiClientHttpService } from './mcs-api-client-http.service';
import { McsApiClientFactory } from './mcs-api-client.factory';
import { McsApiAccountService } from './services/mcs-api-account.service';
import { McsApiApplicationRecoveryService } from './services/mcs-api-application-recovery.service';
import { McsApiAuthService } from './services/mcs-api-auth.service';
import { McsApiAvailabilityZonesService } from './services/mcs-api-availability-zones.service';
import { McsApiAzureManagementServicesService } from './services/mcs-api-azure-management-services.service';
import { McsApiAzureReservationsService } from './services/mcs-api-azure-reservations.service';
import { McsApiAzureResourcesService } from './services/mcs-api-azure-resources.service';
import { McsApiAzureServicesService } from './services/mcs-api-azure-services.service';
import { McsApiAzureSoftwareSubscriptionsService } from './services/mcs-api-azure-software-subscriptions.service';
import { McsApiBatsService } from './services/mcs-api-bats.service';
import { McsApiCatalogService } from './services/mcs-api-catalog.service';
import { McsApiCloudHealthAlertService } from './services/mcs-api-cloudhealth-alert.service';
import { McsApiColocationsService } from './services/mcs-api-colocations.service';
import { McsApiCompaniesService } from './services/mcs-api-companies.service';
import { McsApiConsoleService } from './services/mcs-api-console.service';
import { McsApiDrService } from './services/mcs-api-dr.service';
import { McsApiExtendersService } from './services/mcs-api-extenders.service';
import { McsApiFirewallsService } from './services/mcs-api-firewalls.service';
import { McsApiIdentityService } from './services/mcs-api-identity.service';
import { McsApiInternetService } from './services/mcs-api-internet.service';
import { McsApiJobsService } from './services/mcs-api-jobs.service';
import { McsApiLicensesService } from './services/mcs-api-licenses.service';
import { McsApiLocationsService } from './services/mcs-api-locations.service';
import { McsApiMediaService } from './services/mcs-api-media.service';
import { McsApiMetadataService } from './services/mcs-api-metadata.service';
import { McsApiNetworkDbService } from './services/mcs-api-network-db.service';
import { McsApiNetworkDnsService } from './services/mcs-api-network-dns.service';
import { McsApiNonStandardBundlesService } from './services/mcs-api-non-standard-bundles.services';
import { McsApiPerpetualSoftwareService } from './services/mcs-api-perpetual-software.services';
import { McsApiManagedSiemService } from './services/mcs-api-managed-siem-services.service';
import { McsApiNoticesService } from './services/mcs-api-notices.service';
import { McsApiObjectsService } from './services/mcs-api-objects.service';
import { McsApiOrdersService } from './services/mcs-api-orders.service';
import { McsApiPlannedWorkService } from './services/mcs-api-planned-work.service';
import { McsApiPlatformService } from './services/mcs-api-platform.service';
import { McsApiReportsService } from './services/mcs-api-reports.service';
import { McsApiResourcesService } from './services/mcs-api-resources.service';
import { McsApiServersService } from './services/mcs-api-servers.service';
import { McsApiStorageService } from './services/mcs-api-storage.service';
import { McsApiSystemService } from './services/mcs-api-system.service';
import { McsApiTenantsService } from './services/mcs-api-tenants.service';
import { McsApiTerraformService } from './services/mcs-api-terraform.service';
import { McsApiTicketsService } from './services/mcs-api-tickets.service';
import { McsApiToolsService } from './services/mcs-api-tools.service';
import { McsApiVCenterService } from './services/mcs-api-vcenter.service';
import { McsApiVMSizesService } from './services/mcs-api-vm-sizes.service';
import { McsApiWorkflowsService } from './services/mcs-api-workflows.services';
import { McsApiUcsService } from './services/mcs-api-ucs.service';
import { McsApiVcloudInstanceService } from './services/mcs-api-vcloud-instance.service';

export const apiClientProviders: Provider[] = [
  McsApiClientHttpService,
  McsApiClientFactory,

  McsApiAccountService,
  McsApiAvailabilityZonesService,
  McsApiAuthService,
  McsApiAzureResourcesService,
  McsApiAzureServicesService,
  McsApiAzureManagementServicesService,
  McsApiExtendersService,
  McsApiApplicationRecoveryService,
  McsApiAzureReservationsService,
  McsApiAzureSoftwareSubscriptionsService,
  McsApiBatsService,
  McsApiCatalogService,
  McsApiCloudHealthAlertService,
  McsApiColocationsService,
  McsApiCompaniesService,
  McsApiConsoleService,
  McsApiDrService,
  McsApiFirewallsService,
  McsApiIdentityService,
  McsApiInternetService,
  McsApiJobsService,
  McsApiLicensesService,
  McsApiLocationsService,
  McsApiMediaService,
  McsApiMetadataService,
  McsApiNetworkDbService,
  McsApiNetworkDnsService,
  McsApiNonStandardBundlesService,
  McsApiNoticesService,
  McsApiObjectsService,
  McsApiOrdersService,
  McsApiPerpetualSoftwareService,
  McsApiManagedSiemService,
  McsApiPlatformService,
  McsApiReportsService,
  McsApiResourcesService,
  McsApiServersService,
  McsApiStorageService,
  McsApiSystemService,
  McsApiTenantsService,
  McsApiTerraformService,
  McsApiTicketsService,
  McsApiToolsService,
  McsApiVMSizesService,
  McsApiWorkflowsService,
  McsApiPlannedWorkService,
  McsApiVCenterService,
  McsApiVcloudInstanceService,
  McsApiUcsService
];

export const apiClientInterceptors: Provider[] = [
  { provide: HTTP_INTERCEPTORS, useClass: McsApiMockInterceptor, multi: true },
];
