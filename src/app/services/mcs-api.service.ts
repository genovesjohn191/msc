import {
  Injectable,
  Injector
} from '@angular/core';
import {
  Observable,
  throwError
} from 'rxjs';
import {
  map,
  catchError,
  tap,
  finalize
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  EventBusDispatcherService,
  EventBusState
} from '@peerlancers/ngx-event-bus';
import { LogClass } from '@peerlancers/ngx-logger';
import {
  JobStatus,
  McsInternetPort,
  McsQueryParam,
  McsJob,
  McsApiCollection,
  McsServerPowerstateCommand,
  McsServerRename,
  McsServerDelete,
  McsServerPasswordReset,
  McsApiSuccessResponse,
  McsIdentity,
  McsJobConnection,
  McsApiErrorResponse,
  McsApiErrorContext,
  ApiErrorRequester,
  McsServer,
  McsServerStorageDevice,
  McsServerNic,
  McsServerCompute,
  McsServerMedia,
  McsServerSnapshot,
  McsServerOsUpdates,
  McsServerOsUpdatesDetails,
  McsServerOsUpdatesRequest,
  McsServerOsUpdatesSchedule,
  McsServerOsUpdatesScheduleRequest,
  McsServerOsUpdatesCategory,
  McsServerCreate,
  McsServerClone,
  McsServerStorageDeviceUpdate,
  McsServerCreateNic,
  McsServerUpdate,
  McsServerAttachMedia,
  McsServerDetachMedia,
  McsServerThumbnail,
  McsServerSnapshotCreate,
  McsServerSnapshotRestore,
  McsServerSnapshotDelete,
  McsResource,
  McsResourceCompute,
  McsResourceStorage,
  McsResourceNetwork,
  McsResourceCatalog,
  McsResourceCatalogItem,
  McsResourceVApp,
  McsResourceCatalogItemCreate,
  McsValidation,
  McsServerOperatingSystem,
  McsPortal,
  McsTicket,
  McsTicketCreate,
  McsTicketCreateComment,
  McsTicketComment,
  McsTicketCreateAttachment,
  McsTicketAttachment,
  McsOrder,
  McsOrderCreate,
  McsOrderWorkflow,
  McsOrderItem,
  McsBilling,
  McsOrderApprover,
  McsOrderItemType,
  McsResourceMedia,
  McsResourceMediaServer,
  McsFirewallPolicy,
  McsConsole,
  McsCompany,
  McsFirewall,
  McsProduct,
  McsProductCatalog,
  McsSystemMessage,
  McsSystemMessageCreate,
  McsSystemMessageEdit,
  McsSystemMessageValidate,
  McsEntityRequester,
  EntityRequester,
  McsServerOsUpdatesInspectRequest,
  McsOrderAvailable,
  McsStorageBackUpAggregationTarget,
  McsServerBackupVm,
  McsServerBackupServer,
  McsServerHostSecurity,
  McsServerHostSecurityHidsLog,
  McsServerHostSecurityAvLog,
  McsServerHostSecurityAntiVirus,
  McsServerHostSecurityHids
} from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  McsApiClientFactory,
  IMcsApiServersService,
  McsApiServersFactory,
  IMcsApiJobsService,
  McsApiJobsFactory,
  IMcsApiIdentityService,
  McsApiIdentityFactory,
  IMcsApiResourcesService,
  McsApiResourcesFactory,
  IMcsApiTicketsService,
  McsApiTicketsFactory,
  IMcsApiOrdersService,
  McsApiOrdersFactory,
  IMcsApiMediaService,
  McsApiMediaFactory,
  IMcsApiFirewallsService,
  McsApiFirewallsFactory,
  IMcsApiConsoleService,
  McsApiConsoleFactory,
  IMcsApiSystemService,
  McsApiSystemFactory,
  IMcsApiToolsService,
  McsApiToolsFactory,
  IMcsApiStoragesService,
  McsApiStoragesFactory
} from '@app/api-client';
import { McsEvent } from '@app/events';
import { McsRepository } from './core/mcs-repository.interface';

import { McsJobsRepository } from './repositories/mcs-jobs.repository';
import { McsInternetRepository } from './repositories/mcs-internet.repository';
import { McsServersRepository } from './repositories/mcs-servers.repository';
import { McsResourcesRepository } from './repositories/mcs-resources.repository';
import { McsTicketsRepository } from './repositories/mcs-tickets.repository';
import { McsSystemMessagesRepository } from './repositories/mcs-system-messages.repository';
import { McsProductsRepository } from './repositories/mcs-products.repository';
import { McsProductCatalogRepository } from './repositories/mcs-product-catalog.repository';
import { McsOrdersRepository } from './repositories/mcs-orders.repository';
import { McsMediaRepository } from './repositories/mcs-media.repository';
import { McsFirewallsRepository } from './repositories/mcs-firewalls.repository';
import { McsConsoleRepository } from './repositories/mcs-console.repository';
import { McsCompaniesRepository } from './repositories/mcs-companies.repository';
import { McsStorageBackupAggregationTargetsRepository } from './repositories/mcs-storage-backup-aggregation-targets.repository';

interface DataEmitter<T> {
  eventEmitter: Observable<T>;
  event: EventBusState<any>;
}

@Injectable()
@LogClass()
export class McsApiService {
  private readonly _translate: TranslateService;

  private readonly _jobsRepository: McsJobsRepository;
  private readonly _internetRepository: McsInternetRepository;
  private readonly _serversRepository: McsServersRepository;
  private readonly _resourcesRepository: McsResourcesRepository;
  private readonly _ticketsRepository: McsTicketsRepository;
  private readonly _systemMessagesRepository: McsSystemMessagesRepository;
  private readonly _productsRepository: McsProductsRepository;
  private readonly _productCatalogRepository: McsProductCatalogRepository;
  private readonly _ordersRepository: McsOrdersRepository;
  private readonly _mediaRepository: McsMediaRepository;
  private readonly _firewallsRepository: McsFirewallsRepository;
  private readonly _storageBackupAggregationTargetRepository: McsStorageBackupAggregationTargetsRepository;
  private readonly _consoleRepository: McsConsoleRepository;
  private readonly _companiesRepository: McsCompaniesRepository;

  private readonly _serversApi: IMcsApiServersService;
  private readonly _jobsApi: IMcsApiJobsService;
  private readonly _identityApi: IMcsApiIdentityService;
  private readonly _resourcesApi: IMcsApiResourcesService;
  private readonly _storagesApi: IMcsApiStoragesService;
  private readonly _ticketsApi: IMcsApiTicketsService;
  private readonly _ordersApi: IMcsApiOrdersService;
  private readonly _mediaApi: IMcsApiMediaService;
  private readonly _firewallsApi: IMcsApiFirewallsService;
  private readonly _consoleApi: IMcsApiConsoleService;
  private readonly _systemMessageApi: IMcsApiSystemService;
  private readonly _toolsService: IMcsApiToolsService;

  private readonly _eventDispatcher: EventBusDispatcherService;
  private readonly _entitiesEventMap: Array<DataEmitter<any>>;

  constructor(_injector: Injector) {
    this._translate = _injector.get(TranslateService);
    // Register api repositories
    this._jobsRepository = _injector.get(McsJobsRepository);
    this._internetRepository = _injector.get(McsInternetRepository);
    this._serversRepository = _injector.get(McsServersRepository);
    this._resourcesRepository = _injector.get(McsResourcesRepository);
    this._ticketsRepository = _injector.get(McsTicketsRepository);
    this._systemMessagesRepository = _injector.get(McsSystemMessagesRepository);
    this._productsRepository = _injector.get(McsProductsRepository);
    this._productCatalogRepository = _injector.get(McsProductCatalogRepository);
    this._ordersRepository = _injector.get(McsOrdersRepository);
    this._mediaRepository = _injector.get(McsMediaRepository);
    this._firewallsRepository = _injector.get(McsFirewallsRepository);
    this._storageBackupAggregationTargetRepository = _injector.get(McsStorageBackupAggregationTargetsRepository);
    this._consoleRepository = _injector.get(McsConsoleRepository);
    this._companiesRepository = _injector.get(McsCompaniesRepository);

    // Register api services
    let apiClientFactory = _injector.get(McsApiClientFactory);
    this._serversApi = apiClientFactory.getService(new McsApiServersFactory());
    this._jobsApi = apiClientFactory.getService(new McsApiJobsFactory());
    this._identityApi = apiClientFactory.getService(new McsApiIdentityFactory());
    this._resourcesApi = apiClientFactory.getService(new McsApiResourcesFactory());
    this._storagesApi = apiClientFactory.getService(new McsApiStoragesFactory());
    this._ticketsApi = apiClientFactory.getService(new McsApiTicketsFactory());
    this._ordersApi = apiClientFactory.getService(new McsApiOrdersFactory());
    this._mediaApi = apiClientFactory.getService(new McsApiMediaFactory());
    this._firewallsApi = apiClientFactory.getService(new McsApiFirewallsFactory());
    this._consoleApi = apiClientFactory.getService(new McsApiConsoleFactory());
    this._systemMessageApi = apiClientFactory.getService(new McsApiSystemFactory());
    this._toolsService = apiClientFactory.getService(new McsApiToolsFactory());

    // Register events
    this._entitiesEventMap = [];
    this._eventDispatcher = _injector.get(EventBusDispatcherService);
    this._createEntityEventDispatcher();
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

  public getResources(query?: McsQueryParam): Observable<McsApiCollection<McsResource>> {
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

  public getResourceStorages(id: string): Observable<McsApiCollection<McsResourceStorage>> {
    return this._resourcesApi.getResourceStorage(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceStorages'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getResourceNetworks(id: string): Observable<McsApiCollection<McsResourceNetwork>> {
    return this._resourcesApi.getResourceNetworks(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getResourceNetworks'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getResourceNetwork(id: string, networkId: string): Observable<McsResourceNetwork> {
    return this._resourcesApi.getResourceNetwork(id, networkId).pipe(
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

  public getServers(query?: McsQueryParam): Observable<McsApiCollection<McsServer>> {
    let dataCollection = isNullOrEmpty(query) ?
      this._serversRepository.getAll() :
      this._serversRepository.filterBy(query);

    return dataCollection.pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServers'))
      ),
      map((response) => this._mapToCollection(response, this._serversRepository.getTotalRecordsCount()))
    );
  }

  public getServer(id: string): Observable<McsServer> {
    return this._serversRepository.getById(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServer'))
      )
    );
  }

  public getServerStorage(id: string): Observable<McsApiCollection<McsServerStorageDevice>> {
    return this._serversApi.getServerStorage(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getServerStorage'))
      ),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerNics(id: string): Observable<McsApiCollection<McsServerNic>> {
    return this._serversApi.getServerNics(id).pipe(
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

  public getServerOs(): Observable<McsApiCollection<McsServerOperatingSystem>> {
    return this._serversApi.getServerOs().pipe(
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

  public getStorageBackupAggregationTarget(id: string): Observable<McsStorageBackUpAggregationTarget> {
    return this._mapToEntityRecord(this._storageBackupAggregationTargetRepository, id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getStorageBackupAggregationTarget'))
      )
    );
  }

  public getStorageBackupAggregationTargets(query?: McsQueryParam): Observable<McsApiCollection<McsStorageBackUpAggregationTarget>> {
    return this._storagesApi.getBackUpAggregationTargets(query).pipe(
      catchError((error) => {
        return this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getStorageBackupAggregationTargets'));
      }),
      map((response) => this._mapToCollection(response.content, response.totalCount))
    );
  }

  public getPortals(_query?: McsQueryParam): Observable<McsApiCollection<McsPortal>> {
    return this._toolsService.getPortals().pipe(
      map((response) => this._mapToCollection(response.content, response.totalCount)),
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getPortals'))
      )
    );
  }

  public getTickets(query?: McsQueryParam): Observable<McsApiCollection<McsTicket>> {
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

  public getProducts(query?: McsQueryParam): Observable<McsApiCollection<McsProduct>> {
    return this._mapToEntityRecords(this._productsRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getProducts'))
      )
    );
  }

  public getProduct(id: string): Observable<McsProduct> {
    return this._mapToEntityRecord(this._productsRepository, id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getProduct'))
      )
    );
  }

  public getProductCatalogs(query?: McsQueryParam): Observable<McsApiCollection<McsProductCatalog>> {
    return this._mapToEntityRecords(this._productCatalogRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getProductCatalogs'))
      )
    );
  }

  public getProductCatalog(id: string): Observable<McsProductCatalog> {
    return this._mapToEntityRecord(this._productCatalogRepository, id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getProductCatalog'))
      )
    );
  }

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
      return throwError(errorDetails);
    } else {
      let errorContext = new McsApiErrorContext();
      errorContext.requester = ApiErrorRequester.Partial;
      errorContext.message = defaultMessage || getSafeProperty(errorDetails, (obj) => obj.message, '');
      errorContext.details = errorDetails;
      return throwError(errorContext);
    }
  }

  /**
   * Maps the entity records based on the repository provided
   * @param entityRepository Entity Repository on where to get the entities
   * @param query Query to be obtained
   */
  private _mapToEntityRecords<T>(
    entityRepository: McsRepository<T>,
    query?: McsQueryParam
  ): Observable<McsApiCollection<T>> {
    if (isNullOrEmpty(entityRepository)) {
      throw new Error('Unable to get the list of records from an empty repository.');
    }

    let dataCollection = isNullOrEmpty(query) ?
      entityRepository.getAll() :
      entityRepository.filterBy(query);

    return dataCollection.pipe(
      map((response) => this._mapToCollection(response, entityRepository.getTotalRecordsCount()))
    );
  }

  /**
   * Maps the entity record details on the repository
   * @param entityRepository Entity Repository on where to get the details of the entity
   * @param id Id of the entity to be obtained
   */
  private _mapToEntityRecord<T>(entityRepository: McsRepository<T>, id: string): Observable<T> {
    if (isNullOrEmpty(entityRepository)) {
      throw new Error('Unable to get the list of records from an empty repository.');
    }
    return entityRepository.getById(id);
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

  /**
   * Creates the entity subscribers to dispatch in the event bus state
   */
  private _createEntityEventDispatcher(): void {
    // Data Change Events
    this._entitiesEventMap.push({
      event: McsEvent.dataChangeJobs,
      eventEmitter: this._jobsRepository.dataChange()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataChangeServers,
      eventEmitter: this._serversRepository.dataChange()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataChangeResources,
      eventEmitter: this._resourcesRepository.dataChange()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataChangeTickets,
      eventEmitter: this._ticketsRepository.dataChange()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataChangeSystemMessages,
      eventEmitter: this._systemMessagesRepository.dataChange()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataChangeProducts,
      eventEmitter: this._productsRepository.dataChange()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataChangeProductCatalog,
      eventEmitter: this._productCatalogRepository.dataChange()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataChangeOrders,
      eventEmitter: this._ordersRepository.dataChange()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataChangeMedia,
      eventEmitter: this._mediaRepository.dataChange()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataChangeFirewalls,
      eventEmitter: this._firewallsRepository.dataChange()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataChangeConsole,
      eventEmitter: this._consoleRepository.dataChange()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataChangeCompanies,
      eventEmitter: this._companiesRepository.dataChange()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataChangeInternetPorts,
      eventEmitter: this._internetRepository.dataChange()
    });

    // Data Clear Events
    this._entitiesEventMap.push({
      event: McsEvent.dataClearServers,
      eventEmitter: this._serversRepository.dataClear()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataClearMedia,
      eventEmitter: this._mediaRepository.dataClear()
    });

    this._entitiesEventMap.push({
      event: McsEvent.dataClearSystemMessage,
      eventEmitter: this._systemMessagesRepository.dataClear()
    });

    // Dispatch all associated events
    this._entitiesEventMap.forEach((dataChange) => {
      dataChange.eventEmitter.subscribe((entities) =>
        this._eventDispatcher.dispatch(dataChange.event, entities)
      );
    });
  }
}
