import { Provider } from '@angular/core';

/** State Managers */
import { McsJobManagerClient } from './job-manager/mcs-job-manager.client';
import { McsApiService } from './mcs-api.service';
import { McsAccountRepository } from './repositories/mcs-account.repository';
import { McsAzureReservationsRepository } from './repositories/mcs-azure-reservations.repository';
import { McsAzureResourcesRepository } from './repositories/mcs-azure-resources.repository';
import { McsAzureServicesRepository } from './repositories/mcs-azure-services.repository';
import { McsAzureSoftwareSubscriptionsRepository } from './repositories/mcs-azure-software-subscriptions.repository';
import { McsBatsRepository } from './repositories/mcs-bats.repository';
import { McsCompaniesRepository } from './repositories/mcs-companies.repository';
import { McsConsoleRepository } from './repositories/mcs-console.repository';
/** Repositories */
import { McsFirewallsRepository } from './repositories/mcs-firewalls.repository';
import { McsInternetRepository } from './repositories/mcs-internet.repository';
import { McsJobsRepository } from './repositories/mcs-jobs.repository';
import { McsLicensesRepository } from './repositories/mcs-licenses.repository';
import { McsMediaRepository } from './repositories/mcs-media.repository';
import { McsNetworkDbNetworksRepository } from './repositories/mcs-network-db-networks.repository';
import { McsOrdersRepository } from './repositories/mcs-orders.repository';
import { McsResourcesRepository } from './repositories/mcs-resources.repository';
import { McsServersOsRepository } from './repositories/mcs-servers-os.repository';
import { McsServersRepository } from './repositories/mcs-servers.repository';
import { McsSystemMessagesRepository } from './repositories/mcs-system-messages.repository';
import { McsTerraformDeploymentsRepository } from './repositories/mcs-terraform-deployments.repository';
import { McsTicketsRepository } from './repositories/mcs-tickets.repository';
import { McsStateManagerClient } from './state-manager/mcs-state-manager.client';

export const repositoryProviders: any[] = [
  McsFirewallsRepository,
  McsJobsRepository,
  McsMediaRepository,
  McsOrdersRepository,
  McsResourcesRepository,
  McsServersOsRepository,
  McsServersRepository,
  McsBatsRepository,
  McsTicketsRepository,
  McsConsoleRepository,
  McsCompaniesRepository,
  McsInternetRepository,
  McsSystemMessagesRepository,
  McsLicensesRepository,
  McsAccountRepository,
  McsAzureResourcesRepository,
  McsAzureServicesRepository,
  McsAzureReservationsRepository,
  McsAzureSoftwareSubscriptionsRepository,
  McsTerraformDeploymentsRepository,
  McsNetworkDbNetworksRepository,
  McsApiService
];

export const stateManagers: Provider[] = [
  McsJobManagerClient,
  McsStateManagerClient
];
