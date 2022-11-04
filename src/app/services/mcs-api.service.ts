import {
  throwError,
  Observable
} from 'rxjs';
import {
  catchError,
  finalize,
  map,
  tap
} from 'rxjs/operators';

import {
  Injectable,
  Injector
} from '@angular/core';
import {
  IMcsApiAccountService,
  IMcsApiApplicationRecoveryService,
  IMcsApiAuthService,
  IMcsApiAvailabilityZonesService,
  IMcsApiAzureManagementServicesService,
  IMcsApiAzureReservationsService,
  IMcsApiAzureResourcesService,
  IMcsApiAzureServicesService,
  IMcsApiAzureSoftwareSubscriptionsService,
  IMcsApiBatsService,
  IMcsApiCatalogService,
  IMcsApiCloudHealthAlertService,
  IMcsApiColocationsService,
  IMcsApiCompaniesService,
  IMcsApiConsoleService,
  IMcsApiExtendersService,
  IMcsApiFirewallsService,
  IMcsApiIdentityService,
  IMcsApiJobsService,
  IMcsApiLicensesService,
  IMcsApiLocationsService,
  IMcsApiMediaService,
  IMcsApiMetadataService,
  IMcsApiNetworkDbService,
  IMcsApiNetworkDnsService,
  IMcsApiNoticesService,
  IMcsApiOrdersService,
  IMcsApiPlannedWorkService,
  IMcsApiPlatformService,
  IMcsApiReportsService,
  IMcsApiResourcesService,
  IMcsApiServersService,
  IMcsApiSystemService,
  IMcsApiTenantsService,
  IMcsApiTerraformService,
  IMcsApiTicketsService,
  IMcsApiToolsService,
  IMcsApiVmSizesService,
  IMcsApiVCenterService,
  IMcsApiWorkflowsService,
  McsApiAccountFactory,
  McsApiApplicationRecoveryFactory,
  McsApiAuthFactory,
  McsApiAvailabilityZonesFactory,
  McsApiAzureManagementServicesFactory,
  McsApiAzureReservationsFactory,
  McsApiAzureResourceFactory,
  McsApiAzureServicesFactory,
  McsApiAzureSoftwareSubscriptionsFactory,
  McsApiBatsFactory,
  McsApiCatalogFactory,
  McsApiClientFactory,
  McsApiColocationsFactory,
  McsApiCompaniesFactory,
  McsApiConsoleFactory,
  McsApiExtendersFactory,
  McsApiFirewallsFactory,
  McsApiIdentityFactory,
  McsApiJobsFactory,
  McsApiLicensesFactory,
  McsApiLocationsFactory,
  McsApiMediaFactory,
  McsApiMetadataFactory,
  McsApiNetworkDbFactory,
  McsApiNetworkDnsFactory,
  McsApiNoticesFactory,
  McsApiOrdersFactory,
  McsApiPlannedWorkFactory,
  McsApiPlatformFactory,
  McsApiReportsFactory,
  McsApiResourcesFactory,
  McsApiServersFactory,
  McsApiSystemFactory,
  McsApiTenantsFactory,
  McsApiTerraformFactory,
  McsApiTicketsFactory,
  McsApiToolsFactory,
  McsApiVmSizesFactory,
  McsApiVCenterFactory,
  McsApiWorkflowsFactory
} from '@app/api-client';
import { McsApiCloudHealthAlertFactory } from '@app/api-client/factory/mcs-api-cloudhealth-alert.factory';
import { McsApiObjectsFactory } from '@app/api-client/factory/mcs-api-objects.factory';
import { IMcsApiObjectsService } from '@app/api-client/interfaces/mcs-api-objects.interface';
import {
  EventBusDispatcherService,
  EventBusState
} from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  ApiErrorRequester,
  EntityRequester,
  JobStatus,
  McsAccount,
  McsApiCollection,
  McsApiErrorContext,
  McsApiErrorResponse,
  McsApiSuccessResponse,
  McsApplicationRecovery,
  McsAvailabilityZone,
  McsAzureDeploymentsQueryParams,
  McsAzureManagementService,
  McsAzureManagementServiceChild,
  McsAzureReservation,
  McsAzureResource,
  McsAzureResourceQueryParams,
  McsAzureService,
  McsAzureServicesRequestParams,
  McsAzureSoftwareSubscription,
  McsBackUpAggregationTarget,
  McsBatLinkedService,
  McsBilling,
  McsCatalog,
  McsCatalogEnquiry,
  McsCatalogEnquiryRequest,
  McsCatalogProduct,
  McsCatalogProductBracket,
  McsCatalogSolution,
  McsCatalogSolutionBracket,
  McsCloudHealthAlert,
  McsColocationAntenna,
  McsColocationCustomDevice,
  McsColocationRack,
  McsColocationRoom,
  McsColocationStandardSqm,
  McsCompany,
  McsConsole,
  McsEntityRequester,
  McsExtendersQueryParams,
  McsExtenderService,
  McsFirewall,
  McsFirewallFortiAnalyzer,
  McsFirewallFortiManager,
  McsFirewallPolicy,
  McsFwFortiAnalyzerQueryParams,
  McsIdentity,
  McsInternetPort,
  McsJob,
  McsJobConnection,
  McsKeyValue,
  McsLicense,
  McsLocation,
  McsManagementServiceQueryParams,
  McsNetworkDbMazAaQueryParams,
  McsNetworkDbMulticastIp,
  McsNetworkDbNetwork,
  McsNetworkDbNetworkCreate,
  McsNetworkDbNetworkDelete,
  McsNetworkDbNetworkEvent,
  McsNetworkDbNetworkQueryParams,
  McsNetworkDbNetworkReserve,
  McsNetworkDbNetworkUpdate,
  McsNetworkDbPod,
  McsNetworkDbPodMazAa,
  McsNetworkDbSite,
  McsNetworkDbUseCase,
  McsNetworkDbVlan,
  McsNetworkDbVlanAction,
  McsNetworkDbVlanEvent,
  McsNetworkDbVni,
  McsNetworkDnsRecordRequest,
  McsNetworkDnsRrSetsRecord,
  McsNetworkDnsService,
  McsNetworkDnsZone,
  McsNetworkDnsZoneBase,
  McsNetworkDnsZoneTtlRequest,
  McsNetworkVdcPrecheckVlan,
  McsNotice,
  McsNoticeAssociatedService,
  McsObjectCrispElement,
  McsObjectCrispObject,
  McsObjectCrispOrder,
  McsObjectCrispOrderQueryParams,
  McsObjectInstalledService,
  McsObjectProject,
  McsObjectProjectParams,
  McsObjectProjectTasks,
  McsObjectQueryParams,
  McsObjectVdcQueryParams,
  McsOrder,
  McsOrderApprover,
  McsOrderAvailable,
  McsOrderCreate,
  McsOrderItem,
  McsOrderItemType,
  McsOrderWorkflow,
  McsPhysicalServer,
  McsPlannedWork,
  McsPlannedWorkAffectedService,
  McsPlannedWorkQueryParams,
  McsPlatform,
  McsPortal,
  McsQueryParam,
  McsReportAuditAlerts,
  McsReportBillingAvdDailyAverageUser,
  McsReportBillingAvdDailyAverageUsersParam,
  McsReportBillingAvdDailyUser,
  McsReportBillingAvdDailyUsersParam,
  McsReportBillingServiceGroup,
  McsReportBillingSummaryParams,
  McsReportComputeResourceTotals,
  McsReportCostRecommendations,
  McsReportDefenderCloudAlerts,
  McsReportGenericItem,
  McsReportInefficientVms,
  McsReportInefficientVmParams,
  McsReportIntegerData,
  McsReportManagementService,
  McsReportMonitoringAndAlerting,
  McsReportParams,
  McsReportPlatformSecurityAdvisories,
  McsReportRecentServiceRequestSlt,
  McsReportResourceCompliance,
  McsReportResourceHealth,
  McsReportSecurityScore,
  McsReportServiceChangeInfo,
  McsReportStorageResourceUtilisation,
  McsReportSubscription,
  McsReportTopVmsByCost,
  McsReportUpdateManagement,
  McsReportUpdateManagementParams,
  McsReportVMRightsizing,
  McsReportVMRightsizingSummary,
  McsReservationProductType,
  McsReservationProductTypeQueryParams,
  McsResource,
  McsResourceCatalog,
  McsResourceCatalogItem,
  McsResourceCatalogItemCreate,
  McsResourceCompute,
  McsResourceMedia,
  McsResourceMediaServer,
  McsResourceNetwork,
  McsResourceStorage,
  McsResourceVApp,
  McsServer,
  McsServerAttachMedia,
  McsServerBackupServer,
  McsServerBackupServerDetails,
  McsServerBackupVm,
  McsServerBackupVmDetails,
  McsServerClone,
  McsServerCompute,
  McsServerCreate,
  McsServerCreateNic,
  McsServerDelete,
  McsServerDetachMedia,
  McsServerHostSecurity,
  McsServerHostSecurityAntiVirus,
  McsServerHostSecurityAvLog,
  McsServerHostSecurityHids,
  McsServerHostSecurityHidsLog,
  McsServerMedia,
  McsServerNic,
  McsServerOperatingSystem,
  McsServerOsUpdates,
  McsServerOsUpdatesCategory,
  McsServerOsUpdatesDetails,
  McsServerOsUpdatesInspectRequest,
  McsServerOsUpdatesRequest,
  McsServerOsUpdatesSchedule,
  McsServerOsUpdatesScheduleRequest,
  McsServerPasswordReset,
  McsServerPowerstateCommand,
  McsServerRename,
  McsServerSnapshot,
  McsServerSnapshotCreate,
  McsServerSnapshotDelete,
  McsServerSnapshotRestore,
  McsServerStorageDevice,
  McsServerStorageDeviceUpdate,
  McsServerThumbnail,
  McsServerUpdate,
  McsSoftwareSubscriptionProductType,
  McsSoftwareSubscriptionProductTypeQueryParams,
  McsSystemMessage,
  McsSystemMessageCreate,
  McsSystemMessageEdit,
  McsSystemMessageValidate,
  McsTenant,
  McsTerraformDeployment,
  McsTerraformDeploymentActivity,
  McsTerraformDeploymentCreate,
  McsTerraformDeploymentCreateActivity,
  McsTerraformDeploymentUpdate,
  McsTerraformModule,
  McsTerraformTag,
  McsTerraformTagQueryParams,
  McsTicket,
  McsTicketAttachment,
  McsTicketComment,
  McsTicketCreate,
  McsTicketCreateAttachment,
  McsTicketCreateComment,
  McsTicketQueryParams,
  McsValidation,
  McsVmSize,
  McsVCenterBaseline,
  McsVCenterBaselineRemediate,
  McsVCenterDatacentreQueryParam,
  McsVCenterInstance,
  McsWorkflowCreate
} from '@app/models';
import { McsVCenterBaselineQueryParam } from '@app/models/request/vcenter/mcs-vcenter-baseline-query-param';
import { McsReportOperationalSavings } from '@app/models/response/mcs-report-operational-savings';
import { McsVCenterDataCentre } from '@app/models/response/vcenter/mcs-vcenter-data-centre';
import { McsVCenterHost } from '@app/models/response/vcenter/mcs-vcenter-host';
import {
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import { LogClass } from '@peerlancers/ngx-logger';

import { McsRepository } from './core/mcs-repository.interface';
import { McsAccountRepository } from './repositories/mcs-account.repository';
import { McsApplicationRecoveryRepository } from './repositories/mcs-application-recovery.repository';
import { McsAzureManagementServicesRepository } from './repositories/mcs-azure-management-services.repository';
import { McsAzureReservationsRepository } from './repositories/mcs-azure-reservations.repository';
import { McsAzureResourcesRepository } from './repositories/mcs-azure-resources.repository';
import { McsAzureServicesRepository } from './repositories/mcs-azure-services.repository';
import { McsAzureSoftwareSubscriptionsRepository } from './repositories/mcs-azure-software-subscriptions.repository';
import { McsBatsRepository } from './repositories/mcs-bats.repository';
import { McsCompaniesRepository } from './repositories/mcs-companies.repository';
import { McsConsoleRepository } from './repositories/mcs-console.repository';
import { McsExtendersRepository } from './repositories/mcs-extenders.repository';
import { McsFirewallsRepository } from './repositories/mcs-firewalls.repository';
import { McsInternetRepository } from './repositories/mcs-internet.repository';
import { McsJobsRepository } from './repositories/mcs-jobs.repository';
import { McsLicensesRepository } from './repositories/mcs-licenses.repository';
import { McsMediaRepository } from './repositories/mcs-media.repository';
import { McsNetworkDbNetworksRepository } from './repositories/mcs-network-db-networks.repository';
import { McsNoticesRepository } from './repositories/mcs-notices.repository';
import { McsOrdersRepository } from './repositories/mcs-orders.repository';
import { McsResourcesRepository } from './repositories/mcs-resources.repository';
import { McsServersRepository } from './repositories/mcs-servers.repository';
import { McsSystemMessagesRepository } from './repositories/mcs-system-messages.repository';
import { McsTerraformDeploymentsRepository } from './repositories/mcs-terraform-deployments.repository';
import { McsTicketsRepository } from './repositories/mcs-tickets.repository';
import { McsVCenterBaselinesRepository } from './repositories/mcs-vcenter-baselines.repository';

@Injectable()
@LogClass()
export class McsApiService {
  private readonly _translate: TranslateService;

  private readonly _accountRepository: McsAccountRepository;
  private readonly _azureResourceRepository: McsAzureResourcesRepository;
  private readonly _azureServicesRepository: McsAzureServicesRepository;
  private readonly _azureManagementServicesRepository: McsAzureManagementServicesRepository;
  private readonly _extendersRepository: McsExtendersRepository;
  private readonly _applicationRecoveryRepository: McsApplicationRecoveryRepository;
  private readonly _azureReservationsRepository: McsAzureReservationsRepository;
  private readonly _azureSoftwareSubscriptionsRepository: McsAzureSoftwareSubscriptionsRepository;
  private readonly _batsRepository: McsBatsRepository;
  private readonly _companiesRepository: McsCompaniesRepository;
  private readonly _consoleRepository: McsConsoleRepository;
  private readonly _firewallsRepository: McsFirewallsRepository;
  private readonly _internetRepository: McsInternetRepository;
  private readonly _jobsRepository: McsJobsRepository;
  private readonly _licensesRepository: McsLicensesRepository;
  private readonly _mediaRepository: McsMediaRepository;
  private readonly _noticesRepository: McsNoticesRepository;
  private readonly _ordersRepository: McsOrdersRepository;
  private readonly _resourcesRepository: McsResourcesRepository;
  private readonly _serversRepository: McsServersRepository;
  private readonly _systemMessagesRepository: McsSystemMessagesRepository;
  private readonly _ticketsRepository: McsTicketsRepository;
  private readonly _terraformDeploymentsRepository: McsTerraformDeploymentsRepository;
  private readonly _networkDbNetworksRepository: McsNetworkDbNetworksRepository;
  private readonly _vCenterBaselinesRepository: McsVCenterBaselinesRepository;

  private readonly _accountApi: IMcsApiAccountService;
  private readonly _availabilityZonesApi: IMcsApiAvailabilityZonesService;
  private readonly _authApi: IMcsApiAuthService;
  private readonly _azureResourcesApi: IMcsApiAzureResourcesService;
  private readonly _azureServicesApi: IMcsApiAzureServicesService;
  private readonly _azureManagementServicesApi: IMcsApiAzureManagementServicesService;
  private readonly _extendersApi: IMcsApiExtendersService;
  private readonly _applicationRecoveryApi: IMcsApiApplicationRecoveryService;
  private readonly _azureReservationsApi: IMcsApiAzureReservationsService;
  private readonly _azureSoftwareSubscriptionsApi: IMcsApiAzureSoftwareSubscriptionsService;
  private readonly _batsApi: IMcsApiBatsService;
  private readonly _catalogService: IMcsApiCatalogService;
  private readonly _cloudHealthAlertApi: IMcsApiCloudHealthAlertService;
  private readonly _colocationServicesApi: IMcsApiColocationsService;
  private readonly _companyActiveUser: IMcsApiCompaniesService;
  private readonly _consoleApi: IMcsApiConsoleService;
  private readonly _eventDispatcher: EventBusDispatcherService;
  private readonly _firewallsApi: IMcsApiFirewallsService;
  private readonly _identityApi: IMcsApiIdentityService;
  private readonly _jobsApi: IMcsApiJobsService;
  private readonly _licensesApi: IMcsApiLicensesService;
  private readonly _locationsApi: IMcsApiLocationsService;
  private readonly _mediaApi: IMcsApiMediaService;
  private readonly _metadataApi: IMcsApiMetadataService;
  private readonly _networkDbApi: IMcsApiNetworkDbService;
  private readonly _networkDnsApi: IMcsApiNetworkDnsService;
  private readonly _noticesApi: IMcsApiNoticesService;
  private readonly _objectsApi: IMcsApiObjectsService;
  private readonly _ordersApi: IMcsApiOrdersService;
  private readonly _platformApi: IMcsApiPlatformService;
  private readonly _reportsApi: IMcsApiReportsService;
  private readonly _resourcesApi: IMcsApiResourcesService;
  private readonly _serversApi: IMcsApiServersService;
  private readonly _systemMessageApi: IMcsApiSystemService;
  private readonly _tenantsApi: IMcsApiTenantsService;
  private readonly _terraformApi: IMcsApiTerraformService;
  private readonly _ticketsApi: IMcsApiTicketsService;
  private readonly _plannedWorkApi: IMcsApiPlannedWorkService;
  private readonly _toolsService: IMcsApiToolsService;
  private readonly _vmSizesApi: IMcsApiVmSizesService;
  private readonly _workflowsApi: IMcsApiWorkflowsService;
  private readonly _vCenterApi: IMcsApiVCenterService;

  constructor(_injector: Injector) {
    this._translate = _injector.get(TranslateService);
    // Register api repositories
    this._accountRepository = _injector.get(McsAccountRepository);
    this._azureResourceRepository = _injector.get(McsAzureResourcesRepository);
    this._azureServicesRepository = _injector.get(McsAzureServicesRepository);
    this._azureManagementServicesRepository = _injector.get(McsAzureManagementServicesRepository);
    this._extendersRepository = _injector.get(McsExtendersRepository);
    this._applicationRecoveryRepository = _injector.get(McsApplicationRecoveryRepository);
    this._azureReservationsRepository = _injector.get(McsAzureReservationsRepository);
    this._azureSoftwareSubscriptionsRepository = _injector.get(McsAzureSoftwareSubscriptionsRepository);
    this._batsRepository = _injector.get(McsBatsRepository);
    this._companiesRepository = _injector.get(McsCompaniesRepository);
    this._consoleRepository = _injector.get(McsConsoleRepository);
    this._firewallsRepository = _injector.get(McsFirewallsRepository);
    this._jobsRepository = _injector.get(McsJobsRepository);
    this._internetRepository = _injector.get(McsInternetRepository);
    this._licensesRepository = _injector.get(McsLicensesRepository);
    this._mediaRepository = _injector.get(McsMediaRepository);
    this._noticesRepository = _injector.get(McsNoticesRepository);
    this._ordersRepository = _injector.get(McsOrdersRepository);
    this._resourcesRepository = _injector.get(McsResourcesRepository);
    this._serversRepository = _injector.get(McsServersRepository);
    this._systemMessagesRepository = _injector.get(McsSystemMessagesRepository);
    this._ticketsRepository = _injector.get(McsTicketsRepository);
    this._terraformDeploymentsRepository = _injector.get(McsTerraformDeploymentsRepository);
    this._networkDbNetworksRepository = _injector.get(McsNetworkDbNetworksRepository);
    this._vCenterBaselinesRepository = _injector.get(McsVCenterBaselinesRepository);

    // Register api services
    let apiClientFactory = _injector.get(McsApiClientFactory);

    this._accountApi = apiClientFactory.getService(new McsApiAccountFactory());
    this._availabilityZonesApi = apiClientFactory.getService(new McsApiAvailabilityZonesFactory());
    this._authApi = apiClientFactory.getService(new McsApiAuthFactory());
    this._azureResourcesApi = apiClientFactory.getService(new McsApiAzureResourceFactory());
    this._azureServicesApi = apiClientFactory.getService(new McsApiAzureServicesFactory());
    this._azureManagementServicesApi = apiClientFactory.getService(new McsApiAzureManagementServicesFactory());
    this._extendersApi = apiClientFactory.getService(new McsApiExtendersFactory());
    this._applicationRecoveryApi = apiClientFactory.getService(new McsApiApplicationRecoveryFactory());
    this._azureReservationsApi = apiClientFactory.getService(new McsApiAzureReservationsFactory());
    this._azureSoftwareSubscriptionsApi = apiClientFactory.getService(new McsApiAzureSoftwareSubscriptionsFactory());
    this._batsApi = apiClientFactory.getService(new McsApiBatsFactory());
    this._catalogService = apiClientFactory.getService(new McsApiCatalogFactory());
    this._cloudHealthAlertApi = apiClientFactory.getService(new McsApiCloudHealthAlertFactory());
    this._colocationServicesApi = apiClientFactory.getService(new McsApiColocationsFactory());
    this._companyActiveUser = apiClientFactory.getService(new McsApiCompaniesFactory());
    this._consoleApi = apiClientFactory.getService(new McsApiConsoleFactory());
    this._serversApi = apiClientFactory.getService(new McsApiServersFactory());
    this._firewallsApi = apiClientFactory.getService(new McsApiFirewallsFactory());
    this._jobsApi = apiClientFactory.getService(new McsApiJobsFactory());
    this._identityApi = apiClientFactory.getService(new McsApiIdentityFactory());
    this._licensesApi = apiClientFactory.getService(new McsApiLicensesFactory());
    this._locationsApi = apiClientFactory.getService(new McsApiLocationsFactory());
    this._mediaApi = apiClientFactory.getService(new McsApiMediaFactory());
    this._metadataApi = apiClientFactory.getService(new McsApiMetadataFactory());
    this._networkDbApi = apiClientFactory.getService(new McsApiNetworkDbFactory());
    this._networkDnsApi = apiClientFactory.getService(new McsApiNetworkDnsFactory());
    this._noticesApi = apiClientFactory.getService(new McsApiNoticesFactory());
    this._objectsApi = apiClientFactory.getService(new McsApiObjectsFactory());
    this._ordersApi = apiClientFactory.getService(new McsApiOrdersFactory());
    this._plannedWorkApi = apiClientFactory.getService(new McsApiPlannedWorkFactory());
    this._platformApi = apiClientFactory.getService(new McsApiPlatformFactory());
    this._reportsApi = apiClientFactory.getService(new McsApiReportsFactory());
    this._resourcesApi = apiClientFactory.getService(new McsApiResourcesFactory());
    this._systemMessageApi = apiClientFactory.getService(new McsApiSystemFactory());
    this._tenantsApi = apiClientFactory.getService(new McsApiTenantsFactory());
    this._terraformApi = apiClientFactory.getService(new McsApiTerraformFactory());
    this._ticketsApi = apiClientFactory.getService(new McsApiTicketsFactory());
    this._toolsService = apiClientFactory.getService(new McsApiToolsFactory());
    this._vmSizesApi = apiClientFactory.getService(new McsApiVmSizesFactory());
    this._workflowsApi = apiClientFactory.getService(new McsApiWorkflowsFactory());
    this._vCenterApi = apiClientFactory.getService(new McsApiVCenterFactory());

    // Register events
    this._eventDispatcher = _injector.get(EventBusDispatcherService);
  }

  public getIdentity(): Observable<McsIdentity> {
    return this._identityApi.getIdentity().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getIdentity'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getJobsByStatus(...statuses: JobStatus[]): Observable<McsApiCollection<McsJob>> {
    return this._jobsApi.getJobsByStatus(...statuses).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getJobsByStatus'))
      ),
      map((response) => this._mapToCollection(response)),
    );
  }

  public getJobs(query?: McsQueryParam): Observable<McsApiCollection<McsJob>> {
    let dataCollection = isNullOrEmpty(query) ?
      this._jobsRepository.getAll() :
      this._jobsRepository.filterBy(query);

    return dataCollection.pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getJobs'))
      ),
      map((response) => this._mapToCollection(response, this._jobsRepository.getTotalRecordsCount()))
    );
  }

  public getJob(id: string): Observable<McsJob> {
    return this._jobsRepository.getById(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getJob'))
      )
    );
  }

  public getJobConnection(): Observable<McsJobConnection> {
    return this._jobsApi.getJobConnection().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getJobConnection'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getNotices(query?: McsQueryParam): Observable<McsApiCollection<McsNotice>> {
    return this._noticesApi.getNotices(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNotices'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getNotice(id: string): Observable<McsNotice> {
    return this._noticesApi.getNotice(id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNotice'))
      )
    );
  }

  public acknowledgeNotice(id: string): Observable<any> {
    return this._noticesApi.acknowledgeNotice(id).pipe(
      catchError((error) => {
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.acknowledgeNotice'))
      }),
      map((response) => getSafeProperty(response, (obj) => obj))
    );
  }

  public getNoticeAssociatedServices(id: string, query?: McsQueryParam):
    Observable<McsApiCollection<McsNoticeAssociatedService>> {
    return this._noticesApi.getNoticeAssociatedServices(id, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNoticeAssociatedServices'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getInternetPorts(query?: McsQueryParam): Observable<McsApiCollection<McsInternetPort>> {
    let dataCollection = isNullOrEmpty(query) ?
      this._internetRepository.getAll() :
      this._internetRepository.filterBy(query);

    return dataCollection.pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getInternetPorts'))
      ),
      map((response) => this._mapToCollection(response, this._internetRepository.getTotalRecordsCount()))
    );
  }

  public getInternetPort(id: string): Observable<McsInternetPort> {
    return this._internetRepository.getById(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getInternetPort'))
      )
    );
  }

  public getNetworkDnsServices(query?: McsQueryParam): Observable<McsApiCollection<McsNetworkDnsService>> {
    return this._networkDnsApi.getNetworkDnsServices(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDnsServices'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getNetworkDnsServiceById(id: string): Observable<McsNetworkDnsService> {
    return this._networkDnsApi.getNetworkDnsServiceById(id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDnsService'))
      )
    );
  }

  public getNetworkDnsZones(query?: McsQueryParam): Observable<McsApiCollection<McsNetworkDnsZoneBase>> {
    return this._networkDnsApi.getNetworkDnsZones(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDnsZones'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getNetworkDnsZoneById(id: string): Observable<McsNetworkDnsZone> {
    return this._networkDnsApi.getNetworkDnsZoneById(id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDnsZone'))
      )
    );
  }

  public createNetworkDnsZoneRecord(
    zoneId: string,
    request: McsNetworkDnsRecordRequest
  ): Observable<McsNetworkDnsRrSetsRecord> {
    return this._networkDnsApi.createNetworkDnsZoneRecord(zoneId, request).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createNetworkDnsZoneRecord'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateNetworkDnsZoneRecord(
    zoneId: string,
    recordId: string,
    request: McsNetworkDnsRecordRequest
  ): Observable<McsNetworkDnsRrSetsRecord> {
    return this._networkDnsApi.updateNetworkDnsZoneRecord(zoneId, recordId, request).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateNetworkDnsZoneRecord'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteNetworkDnsZoneRecord(
    zoneId: string,
    recordId: string
  ): Observable<boolean> {
    return this._networkDnsApi.deleteNetworkDnsZoneRecord(zoneId, recordId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteNetworkDnsZoneRecord'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateNetworkDnsZoneTTL(
    zoneId: string,
    request: McsNetworkDnsZoneTtlRequest
  ): Observable<McsNetworkDnsZone> {
    return this._networkDnsApi.updateNetworkDnsZoneTTL(zoneId, request).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateGeneric'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getResources(optionalHeaders?: Map<string, any>, query?: McsQueryParam): Observable<McsApiCollection<McsResource>> {
    return this._resourcesApi.getResources(optionalHeaders, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourcesWithCustomHeaders'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );

    let dataCollection = isNullOrEmpty(query) ?
      this._resourcesRepository.getAll() :
      this._resourcesRepository.filterBy(query);

    return dataCollection.pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResources'))
      ),
      map((response) => this._mapToCollection(response, this._resourcesRepository.getTotalRecordsCount()))
    );
  }

  public getResource(id: string): Observable<McsResource> {
    return this._resourcesRepository.getById(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResource'))
      )
    );
  }

  public getResourceCompute(id: string): Observable<McsResourceCompute> {
    return this._resourcesApi.getResourceCompute(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceCompute'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getResourceStorages(
    id: string,
    optionalHeaders?: Map<string, any>,
    query?: McsQueryParam): Observable<McsApiCollection<McsResourceStorage>> {
    return this._resourcesApi.getResourceStorage(id, optionalHeaders, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceStorages'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getVdcStorage(resourceId: string, storageId: string): Observable<McsResourceStorage> {
    return this._resourcesApi.getVdcStorage(resourceId, storageId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceStorages'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getResourceNetworks(id: string, optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsResourceNetwork>> {
    return this._resourcesApi.getResourceNetworks(id, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceNetworks'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getResourceNetwork(id: string, networkId: string, optionalHeaders?: Map<string, any>): Observable<McsResourceNetwork> {
    return this._resourcesApi.getResourceNetwork(id, networkId, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceNetwork'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getResourceCatalogs(id: string): Observable<McsApiCollection<McsResourceCatalog>> {
    return this._resourcesApi.getResourceCatalogs(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceCatalogs'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getResourceCatalog(id: string, catalogId: string): Observable<McsResourceCatalog> {
    return this._resourcesApi.getResourceCatalog(id, catalogId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceCatalog'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getResourceCatalogItems(id: string, catalogId: string): Observable<McsApiCollection<McsResourceCatalogItem>> {
    return this._resourcesApi.getResourceCatalogItems(id, catalogId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceCatalogItems'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getResourceCatalogItem(id: string, catalogId: string, itemId: string): Observable<McsResourceCatalogItem> {
    return this._resourcesApi.getResourceCatalogItem(id, catalogId, itemId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceCatalogItem'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getResourceVApps(id: string): Observable<McsApiCollection<McsResourceVApp>> {
    return this._resourcesApi.getResourceVApps(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceVApps'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public createResourceCatalogItem(
    id: string,
    catalogId: string,
    catalogItem: McsResourceCatalogItemCreate
  ): Observable<McsJob> {
    return this._resourcesApi.createResourceCatalogItem(id, catalogId, catalogItem).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createResourceCatalogItem'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public validateResourceCatalogItems(
    id: string,
    catalogItem: McsResourceCatalogItemCreate
  ): Observable<McsApiCollection<McsValidation>> {
    return this._resourcesApi.validateCatalogItems(id, catalogItem).pipe(
      catchError((error) => this._handleApiClientError(error)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getPhysicalServers(id: string, query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsPhysicalServer>> {
    return this._resourcesApi.getPhysicalServers(id, query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourcePhysicalServers'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getServers(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsServer>> {
    if (!isNullOrEmpty(optionalHeaders)) {
      return this._serversApi.getServers(query, optionalHeaders).pipe(
        catchError((error) =>
          this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServersWithCustomHeaders'))
        ),
        map((response) => this._mapToCollection(response.content, response.totalCount))
      );
    }

    let dataCollection = isNullOrEmpty(query) ?
      this._serversRepository.getAll() :
      this._serversRepository.filterBy(query);

    return dataCollection.pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServers'))
      ),
      map((response) =>
        this._mapToCollection(response, this._serversRepository.getTotalRecordsCount())
      )
    );
  }

  public getServer(id: string): Observable<McsServer> {
    return this._serversRepository.getById(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServer'))
      )
    );
  }

  public getServerStorage(id: string, query?: McsQueryParam): Observable<McsApiCollection<McsServerStorageDevice>> {
    return this._serversApi.getServerStorage(id, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerStorage'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerNics(id: string, query?: McsQueryParam): Observable<McsApiCollection<McsServerNic>> {
    return this._serversApi.getServerNics(id, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerNics'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerCompute(id: string): Observable<McsApiCollection<McsServerCompute>> {
    return this._serversApi.getServerCompute(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerCompute'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerMedia(id: string): Observable<McsApiCollection<McsServerMedia>> {
    return this._serversApi.getServerMedias(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerMedia'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerSnapshots(id: string): Observable<McsApiCollection<McsServerSnapshot>> {
    return this._serversApi.getServerSnapshots(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerSnapshots'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerOsUpdates(id: string, query?: McsQueryParam): Observable<McsApiCollection<McsServerOsUpdates>> {
    return this._serversApi.getServerOsUpdates(id, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerOsUpdates'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerOsUpdatesDetails(id: string): Observable<McsServerOsUpdatesDetails> {
    return this._serversApi.getServerOsUpdatesDetails(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerOsUpdatesDetails'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getServerOsUpdatesSchedule(id: string): Observable<McsApiCollection<McsServerOsUpdatesSchedule>> {
    return this._serversApi.getServerOsUpdatesSchedule(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerOsUpdatesSchedule'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerOsUpdatesCategories(): Observable<McsApiCollection<McsServerOsUpdatesCategory>> {
    return this._serversApi.getServerOsUpdatesCategories().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerOsUpdatesCategories'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerOs(optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsServerOperatingSystem>> {
    return this._serversApi.getServerOs(optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerOs'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public updateServerOs(id: string, updates: McsServerOsUpdatesRequest): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.updateServerOs(id, updates).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateServerOs'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateServerOsUpdatesSchedule(
    id: string,
    schedule: McsServerOsUpdatesScheduleRequest
  ): Observable<McsServerOsUpdatesSchedule> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.updateServerOsUpdatesSchedule(id, schedule).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error,
          this._translate.instant('apiErrorMessage.updateServerOsUpdatesSchedule'));
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityUpdatedEvent, EntityRequester.Server, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServerOsUpdatesSchedule(id: string): Observable<boolean> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.deleteServerOsUpdatesSchedule(id).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error,
          this._translate.instant('apiErrorMessage.deleteServerOsUpdatesSchedule'));
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityUpdatedEvent, EntityRequester.Server, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public inspectServerForAvailableOsUpdates(id: string, inspectRequest: McsServerOsUpdatesInspectRequest): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.inspectServerForAvailableOsUpdates(id, inspectRequest).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);

        return this._handleApiClientError(error,
          this._translate.instant('apiErrorMessage.inspectServerForAvailableOsUpdates'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public sendServerPowerState(id: string, powerstate: McsServerPowerstateCommand): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.sendServerPowerState(id, powerstate).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.sendServerPowerState'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public renameServer(id: string, rename: McsServerRename): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.renameServer(id, rename).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.renameServer'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createServer(serverData: McsServerCreate): Observable<McsJob> {
    return this._serversApi.createServer(serverData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createServer'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public cloneServer(id: string, serverData: McsServerClone): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.cloneServer(id, serverData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.cloneServer'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServer(id: string, details: McsServerDelete): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.deleteServer(id, details).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteServer'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public resetServerPassword(id: string, details: McsServerPasswordReset): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.resetVmPassword(id, details).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.resetServerPassword'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateServerStorage(
    id: string,
    storageId: string,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.updateServerStorage(id, storageId, storageData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateServerStorage'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createServerStorage(id: string, storageData: McsServerStorageDeviceUpdate): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.createServerStorage(id, storageData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createServerStorage'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public addServerNic(id: string, nicData: McsServerCreateNic): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.addServerNic(id, nicData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.addServerNic'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateServerCompute(id: string, serverData: McsServerUpdate): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.updateServerCompute(id, serverData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateServerCompute'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public attachServerMedia(id: string, mediaData: McsServerAttachMedia): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.attachServerMedia(id, mediaData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.attachServerMedia'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public detachServerMedia(
    id: string,
    mediaId: string,
    mediaDetails: McsServerDetachMedia
  ): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.detachServerMedia(id, mediaId, mediaDetails).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.detachServerMedia'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getServerThumbnail(id: string): Observable<McsServerThumbnail> {
    return this._serversApi.getServerThumbnail(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerThumbnail'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createServerSnapshot(id: string, snapshotData: McsServerSnapshotCreate): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.createServerSnapshot(id, snapshotData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createServerSnapshot'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public restoreServerSnapshot(id: string, snapshotData: McsServerSnapshotRestore): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.restoreServerSnapshot(id, snapshotData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.restoreServerSnapshot'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServerSnapshot(id: string, snapshotData: McsServerSnapshotDelete): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.deleteServerSnapshot(id, snapshotData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteServerSnapshot'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateServerNic(id: string, nicId: string, nicData: McsServerCreateNic): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.updateServerNic(id, nicId, nicData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateServerNic'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServerNic(id: string, nicId: string, nicData: McsServerCreateNic): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.deleteServerNic(id, nicId, nicData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteServerNic'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServerStorage(
    id: string,
    storageId: string,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Server, id);

    return this._serversApi.deleteServerStorage(id, storageId, storageData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Server, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteServerStorage'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getServerBackupVm(id: string): Observable<McsServerBackupVm> {
    return this._serversApi.getServerBackupVm(id).pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerBackupVm'))),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getServerBackupVmDetails(id: string, query?: McsQueryParam): Observable<McsServerBackupVmDetails> {
    return this._serversApi.getServerBackupVmDetails(id, query).pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerBackupVmDetails'))),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getServerBackupVms(): Observable<McsApiCollection<McsServerBackupVm>> {
    return this._serversApi.getServerBackupVms().pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerBackupVms'))),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getServerBackupServer(id: string): Observable<McsServerBackupServer> {
    return this._serversApi.getServerBackupServer(id).pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerBackupServer'))),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getServerBackupServerDetails(id: string, query?: McsQueryParam): Observable<McsServerBackupServerDetails> {
    return this._serversApi.getServerBackupServerDetails(id, query).pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerBackupServerDetails'))),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getServerBackupServers(): Observable<McsApiCollection<McsServerBackupServer>> {
    return this._serversApi.getServerBackupServers().pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerBackupServers'))),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getServerHostSecurity(id: string): Observable<McsServerHostSecurity> {
    return this._serversApi.getServerHostSecurity(id).pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerHostSecurity'))),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getServerHostSecurityAntiVirus(): Observable<McsApiCollection<McsServerHostSecurityAntiVirus>> {
    return this._serversApi.getServerHostSecurityAntiVirus().pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerHostSecurityAntiVirus'))),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getServerHostSecurityAvLogs(id: string): Observable<McsApiCollection<McsServerHostSecurityAvLog>> {
    return this._serversApi.getServerHostSecurityAvLogs(id).pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerHostSecurityAvLogs'))),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getServerHostSecurityHids(): Observable<McsApiCollection<McsServerHostSecurityHids>> {
    return this._serversApi.getServerHostSecurityHids().pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerHostSecurityHids'))),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getServerHostSecurityHidsLogs(id: string): Observable<McsApiCollection<McsServerHostSecurityHidsLog>> {
    return this._serversApi.getServerHostSecurityHidsLogs(id).pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerHostSecurityHidsLogs'))),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getBackupAggregationTarget(id: string): Observable<McsBackUpAggregationTarget> {
    return this._batsApi.getBackUpAggregationTarget(id).pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getBackupAggregationTarget'))),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getBackupAggregationTargets(query?: McsQueryParam, optionalHeaders?: Map<string, any>):
    Observable<McsApiCollection<McsBackUpAggregationTarget>> {

    if (!isNullOrEmpty(optionalHeaders)) {
      return this._batsApi.getBackUpAggregationTargets(query, optionalHeaders).pipe(
        catchError((error) =>
          this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getBackupAggregationTargets'))
        ),
        map((response) => this._mapToCollection(response.content, response.totalCount))
      );
    }

    let dataCollection = isNullOrEmpty(query) ?
      this._batsRepository.getAll() :
      this._batsRepository.filterBy(query);

    return dataCollection.pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getBackupAggregationTargets'))
      ),
      map((response) =>
        this._mapToCollection(response, this._batsRepository.getTotalRecordsCount())
      )
    );
  }

  public getBackupAggregationTargetLinkedServices(id: string): Observable<McsApiCollection<McsBatLinkedService>> {
    return this._batsApi.getBackUpAggregationTargetLinkedServices(id).pipe(
      map((response) => this._mapToCollection(response.content, response.totalCount)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getBackupAggregationTargetLinkedServices'))
      )
    );
  }

  public getColocationRacks(): Observable<McsApiCollection<McsColocationRack>> {
    return this._colocationServicesApi.getColocationRacks().pipe(
      map((response) => this._mapToCollection(response.content, response.totalCount)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getColocationRacks'))
      )
    );
  }

  public getColocationAntennas(): Observable<McsApiCollection<McsColocationAntenna>> {
    return this._colocationServicesApi.getColocationAntennas().pipe(
      map((response) => this._mapToCollection(response.content, response.totalCount)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getColocationAntennas'))
      )
    );
  }

  public getColocationCustomDevices(): Observable<McsApiCollection<McsColocationCustomDevice>> {
    return this._colocationServicesApi.getColocationCustomDevices().pipe(
      map((response) => this._mapToCollection(response.content, response.totalCount)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getColocationCustomDevices'))
      )
    );
  }

  public getColocationRooms(): Observable<McsApiCollection<McsColocationRoom>> {
    return this._colocationServicesApi.getColocationRooms().pipe(
      map((response) => this._mapToCollection(response.content, response.totalCount)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getColocationRooms'))
      )
    );
  }

  public getColocationStandardSqms(): Observable<McsApiCollection<McsColocationStandardSqm>> {
    return this._colocationServicesApi.getColocationStandardSqms().pipe(
      map((response) => this._mapToCollection(response.content, response.totalCount)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getColocationStandardSqms'))
      )
    );
  }

  public getCloudHealthAlerts(
    periodStart?: string,
    periodEnd?: string
  ): Observable<McsApiCollection<McsCloudHealthAlert>> {
    return this._cloudHealthAlertApi.getCloudHealthAlerts(periodStart, periodEnd).pipe(
      map((response) => this._mapToCollection(response.content, response.totalCount)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCloudHealthAlerts'))
      )
    );
  }

  public getCloudHealthAlertById(id?: string): Observable<McsCloudHealthAlert> {
    return this._cloudHealthAlertApi.getCloudHealthAlertById(id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCloudHealthAlert'))
      )
    );
  }

  public getPortals(_query?: McsQueryParam): Observable<McsApiCollection<McsPortal>> {
    return this._toolsService.getPortals(_query).pipe(
      map((response) => this._mapToCollection(response.content, response.totalCount)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getPortals'))
      )
    );
  }

  public getTickets(query?: McsTicketQueryParams): Observable<McsApiCollection<McsTicket>> {
    return this._mapToEntityRecords(this._ticketsRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getTickets'))
      )
    );
  }

  public getTicket(id: string): Observable<McsTicket> {
    return this._mapToEntityRecord(this._ticketsRepository, id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getTicket'))
      )
    );
  }

  public getFileAttachment(id: string, attachmentId: string): Observable<Blob> {
    return this._ticketsApi.getFileAttachment(id, attachmentId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getFileAttachment'))
      )
    );
  }

  public createTicket(ticketData: McsTicketCreate): Observable<McsTicketCreate> {
    return this._ticketsApi.createTicket(ticketData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createTicket'))
      ),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityCreatedEvent, EntityRequester.Ticket)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createTicketComment(id: string, commentData: McsTicketCreateComment): Observable<McsTicketComment> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Ticket, id);

    return this._ticketsApi.createComment(id, commentData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Ticket, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createComment'));
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityUpdatedEvent, EntityRequester.Ticket, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createTicketAttachment(
    id: string,
    attachmentData: McsTicketCreateAttachment
  ): Observable<McsTicketAttachment> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Ticket, id);

    return this._ticketsApi.createAttachment(id, attachmentData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Ticket, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createAttachment'));
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityUpdatedEvent, EntityRequester.Ticket, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getCompanies(query?: McsQueryParam): Observable<McsApiCollection<McsCompany>> {
    return this._mapToEntityRecords(this._companiesRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCompanies'))
      )
    );
  }

  public getCompany(id: string): Observable<McsCompany> {
    return this._mapToEntityRecord(this._companiesRepository, id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCompany'))
      )
    );
  }

  public getCompanyActiveUser(): Observable<McsCompany> {
    return this._companyActiveUser.getCompanyActiveUser().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCompanyActiveUser'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getPlatform(): Observable<McsPlatform> {
    return this._platformApi.getPlatform().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getPlatform'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getOrders(query?: McsQueryParam): Observable<McsApiCollection<McsOrder>> {
    return this._mapToEntityRecords(this._ordersRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getOrders'))
      )
    );
  }

  public getOrder(id: string): Observable<McsOrder> {
    return this._mapToEntityRecord(this._ordersRepository, id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getOrder'))
      )
    );
  }

  public createOrder(orderData: McsOrderCreate): Observable<McsOrder> {
    return this._ordersApi.createOrder(orderData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createOrder'))
      ),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityCreatedEvent, EntityRequester.Order)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createOrderWorkFlow(id: string, workflow: McsOrderWorkflow): Observable<McsOrder> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Order, id);

    return this._ordersApi.createOrderWorkflow(id, workflow).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Order, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createOrderWorkFlow'));
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityUpdatedEvent, EntityRequester.Order, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getOrderWorkflow(id: string): Observable<McsOrderItem> {
    return this._ordersApi.getOrderWorkflow(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getOrderWorkflow'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getBilling(): Observable<McsApiCollection<McsBilling>> {
    return this._ordersApi.getBilling().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getBilling'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getOrderAvailableItemTypes(): Observable<McsApiCollection<McsOrderAvailable>> {
    return this._ordersApi.getOrderAvailableItemTypes().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getOrderAvailableItemTypes'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getOrderApprovers(): Observable<McsApiCollection<McsOrderApprover>> {
    return this._ordersApi.getOrderApprovers().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getOrderApprovers'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getOrderItemTypes(query?: McsQueryParam): Observable<McsApiCollection<McsOrderItemType>> {
    return this._ordersApi.getOrderItemTypes(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getOrderItemTypes'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getOrderItemType(typeId: string): Observable<McsOrderItemType> {
    return this._ordersApi.getOrderItemType(typeId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getItemOrderType'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateOrder(id: string, updatedOrder: McsOrderCreate): Observable<McsOrder> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Order, id);

    return this._ordersApi.updateOrder(id, updatedOrder).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Order, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateOrder'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteOrder(id: string): Observable<McsOrder> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.Order, id);

    return this._ordersApi.deleteOrder(id).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.Order, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteOrder'));
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityDeletedEvent, EntityRequester.Order, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getMedia(query?: McsQueryParam): Observable<McsApiCollection<McsResourceMedia>> {
    return this._mapToEntityRecords(this._mediaRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getMedia'))
      )
    );
  }

  public getMedium(id: string): Observable<McsResourceMedia> {
    return this._mapToEntityRecord(this._mediaRepository, id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getMedium'))
      )
    );
  }

  public getMediaServers(id: string): Observable<McsApiCollection<McsResourceMediaServer>> {
    return this._mediaApi.getMediaServers(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getMediaServers'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getMetadataLinks(): Observable<McsApiCollection<McsKeyValue>> {
    return this._metadataApi.getLinks().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getMetadataLinks'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }


  public getFirewalls(query?: McsQueryParam): Observable<McsApiCollection<McsFirewall>> {
    return this._mapToEntityRecords(this._firewallsRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getFirewalls'))
      )
    );
  }

  public getFirewall(id: string): Observable<McsFirewall> {
    return this._mapToEntityRecord(this._firewallsRepository, id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getFirewall'))
      )
    );
  }

  public getFirewallPolicies(id: string, query?: McsQueryParam): Observable<McsApiCollection<McsFirewallPolicy>> {
    return this._firewallsApi.getFirewallPolicies(id, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getFirewallPolicies'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getFirewallFortiManagers(
    query?: McsQueryParam,
    optionalHeaders?: Map<string, any>
  ): Observable<McsApiCollection<McsFirewallFortiManager>> {
    return this._firewallsApi.getFirewallFortiManagers(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getFirewallFortiManagers'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getFirewallFortiAnalyzers(
    query?: McsFwFortiAnalyzerQueryParams,
    optionalHeaders?: Map<string, any>
  ): Observable<McsApiCollection<McsFirewallFortiAnalyzer>> {
    return this._firewallsApi.getFirewallFortiAnalyzers(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getFirewallFortiAnalyzers'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerConsole(serverId: string): Observable<McsConsole> {
    return this._consoleApi.getServerConsole(serverId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerConsole'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getSystemMessages(query?: McsQueryParam): Observable<McsApiCollection<McsSystemMessage>> {
    return this._mapToEntityRecords(this._systemMessagesRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getSystemMessages'))
      )
    );
  }

  public getSystemMessage(id: string): Observable<McsSystemMessage> {
    return this._mapToEntityRecord(this._systemMessagesRepository, id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getSystemMessage'))
      )
    );
  }

  public getActiveSystemMessages(query?: McsQueryParam): Observable<McsApiCollection<McsSystemMessage>> {
    return this._systemMessageApi.getActiveMessages(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getActiveSystemMessages'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public createSystemMessage(messageData: McsSystemMessageCreate): Observable<McsSystemMessageCreate> {
    return this._systemMessageApi.createMessage(messageData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createMessage'))
      ),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityCreatedEvent, EntityRequester.SystemMessage)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public validateSystemMessage(messageData: McsSystemMessageValidate): Observable<McsApiCollection<McsSystemMessage>> {
    if (!isNullOrEmpty(messageData.id)) {
      this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.SystemMessage, messageData.id);
    }

    return this._systemMessageApi.validateMessage(messageData).pipe(
      catchError((error) => {
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.validateMessage'));
      }),
      finalize(() => {
        if (!isNullOrEmpty(messageData.id)) {
          this._dispatchRequesterEvent(
            McsEvent.entityClearStateEvent, EntityRequester.SystemMessage, messageData.id);
        }
      }),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public editSystemMessage(id: string, messageData: McsSystemMessageEdit): Observable<McsSystemMessageEdit> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.SystemMessage, id);

    return this._systemMessageApi.editMessage(id, messageData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.SystemMessage, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.editMessage'));
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityUpdatedEvent, EntityRequester.SystemMessage, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getCatalog(): Observable<McsCatalog> {
    return this._catalogService.getCatalog().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCatalog'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getCatalogProducts(): Observable<McsCatalogProductBracket> {
    return this._catalogService.getCatalogProducts().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCatalogProducts'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createCatalogProductEnquiry(
    id: string,
    request: McsCatalogEnquiryRequest
  ): Observable<McsCatalogEnquiry> {
    return this._catalogService.createCatalogProductEnquiry(id, request).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getCatalogSolutions(): Observable<McsCatalogSolutionBracket> {
    return this._catalogService.getCatalogSolutions().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCatalogSolutions'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getCatalogProduct(id: string): Observable<McsCatalogProduct> {
    return this._catalogService.getCatalogProduct(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCatalogProduct'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getCatalogSolution(id: string): Observable<McsCatalogSolution> {
    return this._catalogService.getCatalogSolution(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCatalogSolution'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createCatalogSolutionEnquiry(
    id: string,
    request: McsCatalogEnquiryRequest
  ): Observable<McsCatalogEnquiry> {
    return this._catalogService.createCatalogSolutionEnquiry(id, request).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getLicenses(query?: McsQueryParam): Observable<McsApiCollection<McsLicense>> {
    return this._licensesApi.getLicenses(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getLicenses'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getLicense(id: string): Observable<McsLicense> {
    return this._licensesApi.getLicense(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getLicense'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getAccount(): Observable<McsAccount> {
    return this._accountApi.getAccount().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAccount'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getAzureResources(query?: McsAzureResourceQueryParams, optionalHeaders?: Map<string, any>):
    Observable<McsApiCollection<McsAzureResource>> {

    if (!isNullOrEmpty(optionalHeaders)) {
      return this._azureResourcesApi.getAzureResources(query, optionalHeaders).pipe(
        catchError((error) =>
          this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureResources'))
        ),
        map((response) => this._mapToCollection(response.content, response.totalCount))
      );
    }

    let azureResources = isNullOrEmpty(query) ?
      this._azureResourceRepository.getAll() :
      this._azureResourceRepository.filterBy(query);

    return azureResources.pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureResources'))
      ),
      map((response) => this._mapToCollection(response, this._azureResourceRepository.getTotalRecordsCount()))
    );
  }

  public getAzureResource(id: string): Observable<McsAzureResource> {
    return this._azureResourceRepository.getById(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureResource'))
      )
    );
  }

  public getAzureResourcesBySubscriptionId(subscriptionId?: string): Observable<McsApiCollection<McsAzureResource>> {
    return this._azureResourcesApi.getAzureResourcesBySubscriptionId(subscriptionId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureResources'))
      ),
      map((response) => this._mapToCollection(response.content, this._azureResourceRepository.getTotalRecordsCount()))
    );
  }

  public getAzureServices(query?: McsAzureServicesRequestParams, optionalHeaders?: Map<string, any>):
    Observable<McsApiCollection<McsAzureService>> {
    if (!isNullOrEmpty(optionalHeaders)) {
      return this._azureServicesApi.getAzureServices(query, optionalHeaders).pipe(
        catchError((error) =>
          this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureServices'))
        ),
        map((response) => this._mapToCollection(response.content, response.totalCount))
      );
    }

    let azureServices = isNullOrEmpty(query) ?
      this._azureServicesRepository.getAll() :
      this._azureServicesRepository.filterBy(query);

    return azureServices.pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureServices'))
      ),
      map((response) => this._mapToCollection(response, this._azureServicesRepository.getTotalRecordsCount()))
    );
  }

  public getAzureManagementServices(query?: McsManagementServiceQueryParams, optionalHeaders?: Map<string, any>):
    Observable<McsApiCollection<McsAzureManagementService>> {
    if (!isNullOrEmpty(optionalHeaders)) {
      return this._azureManagementServicesApi.getAzureManagementServices(query, optionalHeaders).pipe(
        catchError((error) =>
          this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureManagementServices'))
        ),
        map((response) => this._mapToCollection(response.content, response.totalCount))
      );
    }

    let azureManagementServices = isNullOrEmpty(query) ?
      this._azureManagementServicesRepository.getAll() :
      this._azureManagementServicesRepository.filterBy(query);

    return azureManagementServices.pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureManagementServices'))
      ),
      map((response) => this._mapToCollection(response, this._azureManagementServicesRepository.getTotalRecordsCount()))
    );
  }

  public getAzureManagementServiceById(id: string): Observable<McsAzureManagementService> {
    return this._azureManagementServicesApi.getAzureManagementServiceById(id).pipe(
      catchError((error) => this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureManagementService'))),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getAzureManagementServiceChildren(id: string): Observable<McsApiCollection<McsAzureManagementServiceChild>> {
    return this._azureManagementServicesApi.getAzureManagementServiceChildren(id).pipe(
      map((response) => this._mapToCollection(response.content, response.totalCount)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureManagementServiceChildren'))
      )
    );
  }

  public getExtenders(query?: McsExtendersQueryParams, optionalHeaders?: Map<string, any>):
    Observable<McsApiCollection<McsExtenderService>> {
    if (!isNullOrEmpty(optionalHeaders)) {
      return this._extendersApi.getExtenders(query, optionalHeaders).pipe(
        catchError((error) =>
          this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getExtenders'))
        ),
        map((response) => this._mapToCollection(response.content, response.totalCount))
      );
    }

    let extenders = isNullOrEmpty(query) ?
      this._extendersRepository.getAll() :
      this._extendersRepository.filterBy(query);

    return extenders.pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getExtenders'))
      ),
      map((response) => this._mapToCollection(response, this._extendersRepository.getTotalRecordsCount()))
    );
  }

  public getApplicationRecovery(query?: McsQueryParam, optionalHeaders?: Map<string, any>):
    Observable<McsApiCollection<McsApplicationRecovery>> {
    if (!isNullOrEmpty(optionalHeaders)) {
      return this._applicationRecoveryApi.getApplicationRecovery(query, optionalHeaders).pipe(
        catchError((error) =>
          this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getApplicationRecovery'))
        ),
        map((response) => this._mapToCollection(response.content, response.totalCount))
      );
    }

    let applicationRecovery = isNullOrEmpty(query) ?
      this._applicationRecoveryRepository.getAll() :
      this._applicationRecoveryRepository.filterBy(query);

    return applicationRecovery.pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getApplicationRecovery'))
      ),
      map((response) => this._mapToCollection(response, this._applicationRecoveryRepository.getTotalRecordsCount()))
    );
  }

  public getAzureReservations(query?: McsQueryParam): Observable<McsApiCollection<McsAzureReservation>> {
    return this._mapToEntityRecords(this._azureReservationsRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureReservations'))
      )
    );
  }

  public getAzureReservationProductTypes(query?: McsReservationProductTypeQueryParams):
    Observable<McsApiCollection<McsReservationProductType>> {

    return this._azureReservationsApi.getAzureReservationProductTypes(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getReservationProductTypes'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getAzureSoftwareSubscriptions(query?: McsQueryParam): Observable<McsApiCollection<McsAzureSoftwareSubscription>> {
    return this._mapToEntityRecords(this._azureSoftwareSubscriptionsRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureSoftwareSubscriptions'))
      )
    );
  }

  public getBillingSummaries(
    query?: McsReportBillingSummaryParams
  ): Observable<McsApiCollection<McsReportBillingServiceGroup>> {
    return this._reportsApi.getBillingSummaries(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getBillingSummaries'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getBillingSummariesCsv(
    query?: McsReportBillingSummaryParams,
    optionalHeaders?: Map<string, any>
  ): Observable<any> {
    return this._reportsApi.getBillingSummariesCsv(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getBillingSummariesCsv'))
      ),
      map((response) => response)
    );
  }

  public getSubscriptions(): Observable<McsApiCollection<McsReportSubscription>> {
    return this._reportsApi.getSubscriptions().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getSubscriptions'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getManagementServices(isEssentials?: boolean): Observable<McsApiCollection<McsReportManagementService>> {
    return this._reportsApi.getManagementServices(isEssentials).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getManagementServices'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getServicesCostOverviewReport(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]
  ): Observable<McsApiCollection<McsReportGenericItem>> {

    return this._reportsApi.getServicesCostOverviewReport(periodStart, periodEnd, subscriptionIds).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServicesCostOverviewReport'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getResourceMonthlyCostReport(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]
  ): Observable<McsApiCollection<McsReportGenericItem>> {

    return this._reportsApi.getResourceMonthlyCostReport(periodStart, periodEnd, subscriptionIds).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceMonthlyCostReport'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getVirtualMachineBreakdownReport(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]
  ): Observable<McsApiCollection<McsReportGenericItem>> {

    return this._reportsApi.getVirtualMachineBreakdownReport(periodStart, periodEnd, subscriptionIds).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getVirtualMachineBreakdownReport'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getPerformanceReport(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string
  ): Observable<McsApiCollection<McsReportGenericItem>> {

    return this._reportsApi.getPerformanceReport(periodStart, periodEnd, subscriptionIds).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getPerformanceReport'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getAzureResourcesReport(): Observable<McsApiCollection<McsReportIntegerData>> {
    return this._reportsApi.getAzureResourcesReport().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAzureResourcesReport'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getCostRecommendations(): Observable<McsReportCostRecommendations> {
    return this._reportsApi.getCostRecommendations().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCostRecommendations'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getServiceChanges(): Observable<McsApiCollection<McsReportServiceChangeInfo>> {
    return this._reportsApi.getServiceChanges().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServiceChanges'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getOperationalMonthlySavings(): Observable<McsReportOperationalSavings> {
    return this._reportsApi.getOperationalMonthlySavings().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getOperationalMonthlySavings'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getVMRightsizing(query?: McsReportParams): Observable<McsReportVMRightsizing[]> {
    return this._reportsApi.getVMRightsizing(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getVMRightsizing'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getVMRightsizingSummary(): Observable<McsReportVMRightsizingSummary> {
    return this._reportsApi.getVMRightsizingSummary().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getVMRightsizingSummary'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getResourceHealth(): Observable<McsReportResourceHealth> {
    return this._reportsApi.getResourceHealth().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceHealth'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getSecurityScore(): Observable<McsReportSecurityScore> {
    return this._reportsApi.getSecurityScore().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getSecurityScore'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getResourceCompliance(
    period?: string,
    subscriptionIds?: string[]
  ): Observable<McsReportResourceCompliance> {
    return this._reportsApi.getResourceCompliance(period, subscriptionIds).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceCompliance'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getMonitoringAndAlerting(
    periodStart?: string,
    periodEnd?: string,
    subscriptionIds?: string[]
  ): Observable<McsReportMonitoringAndAlerting> {
    return this._reportsApi.getMonitoringAndAlerting(periodStart, periodEnd, subscriptionIds).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getMonitoringAndAlerting'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getUpdateManagement(query?: McsReportUpdateManagementParams): Observable<McsReportUpdateManagement[]> {
    return this._reportsApi.getUpdateManagement(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getUpdateManagement'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getDefenderCloudAlerts(
    periodStart?: string,
    periodEnd?: string): Observable<McsReportDefenderCloudAlerts[]> {
    return this._reportsApi.getDefenderCloudAlerts(periodStart, periodEnd).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getDefenderCloudAlerts'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getAuditAlerts(query?: McsReportParams): Observable<McsReportAuditAlerts[]> {
    return this._reportsApi.getAuditAlerts(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAuditAlerts'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getInefficientVms(query?: McsReportInefficientVmParams): Observable<McsReportInefficientVms[]> {
    return this._reportsApi.getInefficientVms(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getInefficientVms'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getTopVmsByCost(query?: McsQueryParam): Observable<McsReportTopVmsByCost[]> {
    return this._reportsApi.getTopVmsByCost(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getTopVmsByCost'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getPlatformSecurityAdvisories(query?: McsReportParams): Observable<McsReportPlatformSecurityAdvisories[]> {
    return this._reportsApi.getPlatformSecurityAdvisories(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getPlatformSecurityAdvisories'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getRecentServiceRequestSlt(query?: McsQueryParam): Observable<McsReportRecentServiceRequestSlt[]> {
    return this._reportsApi.getRecentServiceRequestSlt(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getRecentServiceRequestSlt'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getComputeResourceTotals(): Observable<McsReportComputeResourceTotals> {
    return this._reportsApi.getComputeResourceTotals().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getComputeResourceTotals'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getResourcesStorages(): Observable<McsReportStorageResourceUtilisation[]> {
    return this._reportsApi.getResourcesStorages().pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourcesStorages'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public provisionWorkflows(workflows: McsWorkflowCreate[]): Observable<McsApiCollection<McsJob>> {
    return this._workflowsApi.provisionWorkflow(workflows).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.provisionWorkflows'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getCrispElements(query?: McsObjectQueryParams): Observable<McsApiCollection<McsObjectCrispElement>> {
    return this._objectsApi.getCrispElements(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCrispElements'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getCrispObjects(query?: McsObjectQueryParams): Observable<McsApiCollection<McsObjectCrispObject>> {
    return this._objectsApi.getCrispObjects(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCrispElements'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getCrispElement(productId: string): Observable<McsObjectCrispElement> {
    return this._objectsApi.getCrispElement(productId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCrispElement'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getInstalledServices(query?: McsObjectQueryParams): Observable<McsApiCollection<McsObjectInstalledService>> {
    return this._objectsApi.getInstalledServices(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getInstalledServices'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getCrispOrders(query?: McsObjectCrispOrderQueryParams): Observable<McsApiCollection<McsObjectCrispOrder>> {
    return this._objectsApi.getCrispOrders(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCrispOrders'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getCrispOrder(orderId: string): Observable<McsObjectCrispOrder> {
    return this._objectsApi.getCrispOrder(orderId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCrispOrder'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getCrispOrderElements(orderId: string, query?: McsObjectCrispOrderQueryParams):
    Observable<McsApiCollection<McsObjectCrispElement>> {

    return this._objectsApi.getCrispOrderElements(orderId, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getCrispOrderElements'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getProjects(query?: McsObjectProjectParams): Observable<McsApiCollection<McsObjectProject>> {
    return this._objectsApi.getProjects(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getProjects'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getProject(projectId: string): Observable<McsObjectProject> {
    return this._objectsApi.getProject(projectId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getProject'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getProjectTasks(projectId: string, query?: McsObjectProjectParams):
    Observable<McsApiCollection<McsObjectProjectTasks>> {
    return this._objectsApi.getProjectTasks(projectId, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getProjectTasks'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getVdcNetworkPrecheck(query?: McsObjectVdcQueryParams): Observable<McsNetworkVdcPrecheckVlan> {
    return this._objectsApi.getVdcNetworkPrecheck(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkVlan'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getTenants(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsTenant>> {
    return this._tenantsApi.getTenants(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getTenants'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getLocations(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsLocation>> {
    return this._locationsApi.getLocations(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getLocations'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getLocation(id: string): Observable<McsLocation> {
    return this._locationsApi.getLocation(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getLocation'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getVmSizes(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsVmSize>> {
    return this._vmSizesApi.getVmSizes(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getVmSizes'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getVMSize(id: string): Observable<McsVmSize> {
    return this._vmSizesApi.getVmSize(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getVmSize'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getAvailabilityZones(query?: McsQueryParam): Observable<McsApiCollection<McsAvailabilityZone>> {
    return this._availabilityZonesApi.getAvailabilityZones(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAvailabilityZones'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getTerraformDeployments(query?: McsAzureDeploymentsQueryParams): Observable<McsApiCollection<McsTerraformDeployment>> {
    return this._mapToEntityRecords(this._terraformDeploymentsRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getTerraformDeployments'))
      )
    );
  }

  public getTerraformDeployment(id: string): Observable<McsTerraformDeployment> {
    return this._mapToEntityRecord(this._terraformDeploymentsRepository, id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getTerraformDeployment'))
      )
    );
  }

  public getTerraformDeploymentActivities(id: any, query?: McsQueryParam): Observable<McsApiCollection<McsTerraformDeploymentActivity>> {
    return this._terraformApi.getDeploymentActivities(id, query).pipe(
      map((response) => this._mapToCollection(response))
    );
  }

  public getTerraformDeploymentActivity(id: any): Observable<McsTerraformDeploymentActivity> {
    return this._terraformApi.getDeploymentActivity(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getTerraformDeploymentActivity'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createTerraformDeployment(deploymentData: McsTerraformDeploymentCreate): Observable<McsTerraformDeployment> {
    return this._terraformApi.createDeployment(deploymentData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createTerraformDeployment'))
      ),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityCreatedEvent, EntityRequester.TerraformDeployment)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateTerraformDeployment(id: any, deploymentData: McsTerraformDeploymentUpdate): Observable<McsTerraformDeployment> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.TerraformDeployment, id);

    return this._terraformApi.updateDeployment(id, deploymentData).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.TerraformDeployment, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateTerraformDeployment'));
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityUpdatedEvent, EntityRequester.TerraformDeployment, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteTerraformDeployment(id: any): Observable<boolean> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.TerraformDeployment, id, null, true);

    return this._terraformApi.deleteDeployment(id).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.TerraformDeployment, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteTerraformDeployment'))
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityDeletedEvent, EntityRequester.TerraformDeployment, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createTerraformDeploymentActivity(id: any, request: McsTerraformDeploymentCreateActivity): Observable<McsJob> {
    return this._terraformApi.createDeploymentActivity(id, request).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.TerraformDeployment, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createTerraformDeploymentActivity'))
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getTerraformModules(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsTerraformModule>> {
    return this._terraformApi.getModules(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getTerraformModules'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getTerraformModule(id: string, optionalHeaders?: Map<string, any>): Observable<McsTerraformModule> {
    return this._terraformApi.getModule(id, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getTerraformModule'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getTerraformTags(query?: McsTerraformTagQueryParams, optionalHeaders?: Map<string, any>)
    : Observable<McsApiCollection<McsTerraformTag>> {

    return this._terraformApi.getTags(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getTerraformTags'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getTerraformTag(id: string, optionalHeaders?: Map<string, any>): Observable<McsTerraformTag> {
    return this._terraformApi.getTag(id, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getTerraformTag'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getNetworkDbSites(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsNetworkDbSite>> {
    return this._networkDbApi.getSites(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDbSites'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getNetworkDbPods(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsNetworkDbPod>> {
    return this._networkDbApi.getPods(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDbPods'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getNetworkDbVlans(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsNetworkDbVlan>> {
    return this._networkDbApi.getVlans(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDbVlans'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getNetworkDbVlan(id: number): Observable<McsNetworkDbVlan> {
    return this._networkDbApi.getVlan(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDbVlan'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getNetworkDbVlanEvents(id: number): Observable<McsApiCollection<McsNetworkDbVlanEvent>> {
    return this._networkDbApi.getVlanEvents(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getVlanEvents'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }


  public getNetworkDbVnis(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsNetworkDbVni>> {
    return this._networkDbApi.getVnis(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDbVnis'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getNetworkDbUseCases(query?: McsQueryParam, optionalHeaders?: Map<string, any>):
    Observable<McsApiCollection<McsNetworkDbUseCase>> {

    return this._networkDbApi.getUseCases(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDbUseCases'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getNetworkDbMulticastIps(query?: McsQueryParam, optionalHeaders?: Map<string, any>):
    Observable<McsApiCollection<McsNetworkDbMulticastIp>> {

    return this._networkDbApi.getMulticastIps(query, optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDbMulticastIps'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getNetworkDbNetworks(
    query?: McsNetworkDbNetworkQueryParams
  ): Observable<McsApiCollection<McsNetworkDbNetwork>> {
    return this._mapToEntityRecords(this._networkDbNetworksRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDbNetworks'))
      )
    );
  }

  public getNetworkDbNetwork(id: string): Observable<McsNetworkDbNetwork> {
    return this._mapToEntityRecord(this._networkDbNetworksRepository, id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDbNetwork'))
      )
    );
  }

  public createNetworkDbNetwork(payload: McsNetworkDbNetworkCreate): Observable<McsJob> {
    return this._networkDbApi.createNetwork(payload).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createNetworkDbNetwork'))
      ),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityCreatedEvent, EntityRequester.NetworkDbNetwork)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateNetworkDbNetwork(id: string, payload: McsNetworkDbNetworkUpdate): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.NetworkDbNetwork, id);

    return this._networkDbApi.updateNetwork(id, payload).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.NetworkDbNetwork, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateNetworkDbNetwork'))
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityUpdatedEvent, EntityRequester.NetworkDbNetwork, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteNetworkDbNetwork(id: string, details: McsNetworkDbNetworkDelete): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.NetworkDbNetwork, id);

    return this._networkDbApi.deleteNetwork(id, details).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.NetworkDbNetwork, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteNetworkDbNetwork'));
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityDeletedEvent, EntityRequester.NetworkDbNetwork, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getNetworkDbNetworkEvents(id: any, query?: McsQueryParam): Observable<McsApiCollection<McsNetworkDbNetworkEvent>> {
    return this._networkDbApi.getNetworkEvents(id, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDbNetworkEvents'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getMazAaAvailablePods(query: McsNetworkDbMazAaQueryParams): Observable<McsNetworkDbPodMazAa> {
    return this._networkDbApi.getMazAaAvailablePods(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getNetworkDbNetworkEvents'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public reserveNetworkVlan(networkId: string, payload: McsNetworkDbNetworkReserve): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.NetworkDbNetwork, networkId);

    return this._networkDbApi.reserveNetworkVlan(networkId, payload).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.NetworkDbNetwork, networkId);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateNetworkDbNetwork'))
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityUpdatedEvent, EntityRequester.NetworkDbNetwork, networkId)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public recycleNetworkVlan(id: string, payload: McsNetworkDbVlanAction): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.NetworkDbVlan, id);

    return this._networkDbApi.recycleNetworkVlan(id, payload).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.NetworkDbVlan, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateNetworkDbNetwork'))
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityUpdatedEvent, EntityRequester.NetworkDbVlan, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public reclaimNetworkVlan(id: string, payload: McsNetworkDbVlanAction): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.NetworkDbVlan, id);

    return this._networkDbApi.reclaimNetworkVlan(id, payload).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.NetworkDbVlan, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateNetworkDbNetwork'))
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityUpdatedEvent, EntityRequester.NetworkDbVlan, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getSoftwareSubscriptionProductTypes(query?: McsSoftwareSubscriptionProductTypeQueryParams):
    Observable<McsApiCollection<McsSoftwareSubscriptionProductType>> {

    return this._azureSoftwareSubscriptionsApi.getSoftwareSubscriptionProductTypes(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getSoftwareSubscritionProductTypes'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getPlannedWork(query?: McsPlannedWorkQueryParams): Observable<McsApiCollection<McsPlannedWork>> {
    return this._plannedWorkApi.getPlannedWork(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getPlannedWork'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getPlannedWorkById(id: string): Observable<McsPlannedWork> {
    return this._plannedWorkApi.getPlannedWorkById(id).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getPlannedWork'))
      )
    );
  }

  public getPlannedWorkIcs(id: string): Observable<Blob> {
    return this._plannedWorkApi.getPlannedWorkIcs(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.downloadPlannedWorkIcs'))
      )
    );
  }

  public getPlannedWorkAffectedServices(id: string, query?: McsPlannedWorkQueryParams):
    Observable<McsApiCollection<McsPlannedWorkAffectedService>> {
    return this._plannedWorkApi.getPlannedWorkAffectedServices(id, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getPlannedWorkAffectedServices'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public extendSession(): Observable<string> {
    return this._authApi.extendSession().pipe(
      catchError((error) => {
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.extendSession'));
      }),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  //#region VCenter Services
  public getVCenterBaselines(
    query?: McsVCenterBaselineQueryParam,
    fromRepo: boolean = true
  ): Observable<McsApiCollection<McsVCenterBaseline>> {
    if (fromRepo) {
      return this._mapToEntityRecords(this._vCenterBaselinesRepository, query).pipe(
        catchError((error) =>
          this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getVCenterBaselines'))
        )
      );
    }

    return this._vCenterApi.getVCenterBaselines(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getVCenterBaselines'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getVCenterBaseline(id: string): Observable<McsVCenterBaseline> {
    return this._vCenterApi.getVCenterBaseline(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getVCenterBaseline'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public remediateBaseline(id: string, payload: McsVCenterBaselineRemediate): Observable<McsJob> {
    this._dispatchRequesterEvent(McsEvent.entityActiveEvent, EntityRequester.VCenterBaseline, id);

    return this._vCenterApi.remediateBaseline(id, payload).pipe(
      catchError((error) => {
        this._dispatchRequesterEvent(McsEvent.entityClearStateEvent, EntityRequester.VCenterBaseline, id);
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.remediateBaseline'))
      }),
      tap(() => this._dispatchRequesterEvent(McsEvent.entityUpdatedEvent, EntityRequester.VCenterBaseline, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getVCenterInstances(optionalHeaders?: Map<string, any>): Observable<McsApiCollection<McsVCenterInstance>> {
    return this._vCenterApi.getVCenterInstances(optionalHeaders).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getVCenterInstances'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getVCenterDataCentres(query?: McsVCenterDatacentreQueryParam): Observable<McsApiCollection<McsVCenterDataCentre>> {
    return this._vCenterApi.getVCenterDataCentres(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getVCenterDataCentres'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getVCenterHosts(query?: McsVCenterBaselineQueryParam,): Observable<McsApiCollection<McsVCenterHost>> {
    return this._vCenterApi.getVCenterHosts(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getVCenterHosts'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }
  //#endregion

  //#region Reports Billing AVD
  public getAvdDailyUsers(
    query?: McsReportBillingAvdDailyUsersParam
  ): Observable<McsApiCollection<McsReportBillingAvdDailyUser>> {
    return this._reportsApi.getAvdDailyUsersService(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAvdDailyUsers'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getAvdDailyUsersCsv(
    query?: McsReportBillingAvdDailyUsersParam
  ): Observable<Blob> {
    return this._reportsApi.getAvdDailyUsersServiceCsv(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAvdDailyUsersCsv'))
      ),
      map((response) => response)
    );
  }

  public getAvdDailyAverageUsers(
    query?: McsReportBillingAvdDailyAverageUsersParam
  ): Observable<McsApiCollection<McsReportBillingAvdDailyAverageUser>> {
    return this._reportsApi.getAvdDailyUsersAverage(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAvdDailyAverageUsers'))
      ),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getAvdDailyAverageUsersCsv(
    query?: McsReportBillingAvdDailyAverageUsersParam
  ): Observable<Blob> {
    return this._reportsApi.getAvdDailyUsersAverageCsv(query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getAvdDailyAverageUsersCsv'))
      ),
      map((response) => response)
    );
  }
  //#endregion

  /**
   * Dispatch the entity requester event based on the action provided
   * @param event Event to be dispatched
   * @param type Type of the entity to be dispatched
   * @param id Id of the entity to be dispatched
   * @param message Message of the entity to be dispatched
   * @param disabled Disabled flag to be acted on the entity
   */
  private _dispatchRequesterEvent(
    event: EventBusState<McsEntityRequester>, type: EntityRequester
  ): void;
  private _dispatchRequesterEvent(
    event: EventBusState<McsEntityRequester>, type: EntityRequester, id: string
  ): void;
  private _dispatchRequesterEvent(
    event: EventBusState<McsEntityRequester>, type: EntityRequester, id: string, message: string
  ): void;
  private _dispatchRequesterEvent(
    event: EventBusState<McsEntityRequester>, type: EntityRequester, id: string, message: string, disabled: boolean
  ): void;
  private _dispatchRequesterEvent(
    action: EventBusState<McsEntityRequester>,
    type: EntityRequester,
    id?: string,
    message?: string,
    disabled?: boolean
  ): void {
    let entityRequester = new McsEntityRequester();
    entityRequester.id = id;
    entityRequester.type = type;
    entityRequester.disabled = disabled;
    entityRequester.message = message || this._translate.instant('entityState.inProgress');
    this._eventDispatcher.dispatch(action, entityRequester);
  }

  /**
   * Handles the API Client error and rethrow it as an error context
   * @param errorDetails Error details to be rethrow
   * @param defaultMessage Default message to be displayed
   */
  private _handleApiClientError(errorDetails: McsApiErrorContext): Observable<never>;
  private _handleApiClientError(errorDetails: McsApiErrorResponse, defaultMessage?: string): Observable<never>;
  private _handleApiClientError(
    errorDetails: McsApiErrorContext | McsApiErrorResponse,
    defaultMessage?: string
  ): Observable<never> {
    if (errorDetails instanceof McsApiErrorContext) {
      errorDetails.message = errorDetails.message || defaultMessage;
      return throwError(() => errorDetails);
    } else {
      let errorContext = new McsApiErrorContext();
      errorContext.requester = ApiErrorRequester.Partial;
      errorContext.message = defaultMessage || getSafeProperty(errorDetails, (obj) => obj.message, '');
      errorContext.details = errorDetails;
      return throwError(() => errorContext);
    }
  }

  /**
   * Maps the entity records based on the repository provided
   * @param entityRepository Entity Repository on where to get the entities
   * @param query Query to be obtained
   * @param parentId Parent Id of the entity where it belongs to
   */
  private _mapToEntityRecords<T>(
    entityRepository: McsRepository<T>,
    query?: McsQueryParam,
    parentId?: string
  ): Observable<McsApiCollection<T>> {
    if (isNullOrEmpty(entityRepository)) {
      throw new Error('Unable to get the list of records from an empty repository.');
    }

    let dataCollection = isNullOrEmpty(query) ?
      entityRepository.getAll(parentId) :
      entityRepository.filterBy(query, parentId);

    return dataCollection.pipe(
      map((response) => this._mapToCollection(response, entityRepository.getTotalRecordsCount()))
    );
  }

  /**
   * Maps the entity record details on the repository
   * @param entityRepository Entity Repository on where to get the details of the entity
   * @param id Id of the entity to be obtained
   * @param parentId Parent Id of the entity where it belongs to
   */
  private _mapToEntityRecord<T>(entityRepository: McsRepository<T>, id: string, parentId?: string): Observable<T> {
    if (isNullOrEmpty(entityRepository)) {
      throw new Error('Unable to get the list of records from an empty repository.');
    }
    return entityRepository.getById(id, parentId);
  }

  /**
   * Map records to the collection list of the api
   * @param records Records to be converted into collection
   * @param totalRecordsCount Total records count of the collection
   */
  private _mapToCollection<T>(records: McsApiSuccessResponse<any>): McsApiCollection<T>;
  private _mapToCollection<T>(records: T[], totalRecordsCount?: number): McsApiCollection<T>;
  private _mapToCollection<T>(
    records: McsApiSuccessResponse<any> | T[],
    totalRecordsCount?: number
  ): McsApiCollection<T> {

    let apiCollection = new McsApiCollection<T>();
    if (records instanceof McsApiSuccessResponse) {
      apiCollection.collection = records && records.content;
      apiCollection.totalCollectionCount = records && records.totalCount;
    } else {
      apiCollection.collection = records && records;
      apiCollection.totalCollectionCount = totalRecordsCount;
    }

    apiCollection.collection = apiCollection.collection || [];
    apiCollection.totalCollectionCount = apiCollection.totalCollectionCount || 0;
    return apiCollection;
  }
}
