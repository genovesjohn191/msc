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
  finalize
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
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
  McsSystemMessage
} from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  IMcsApiServersService,
  McsApiClientFactory,
  McsApiServersFactory,
  IMcsApiJobsService,
  McsApiJobsFactory,
  IMcsApiIdentityService,
  McsApiIdentityFactory,
  IMcsApiResourcesService,
  McsApiResourcesFactory,
  IMcsApiTicketsService,
  IMcsApiOrdersService,
  IMcsApiMediaService,
  IMcsApiFirewallsService,
  IMcsApiConsoleService,
  McsApiTicketsFactory,
  McsApiOrdersFactory,
  McsApiMediaFactory,
  McsApiFirewallsFactory,
  McsApiConsoleFactory
} from '@app/api-client';
import {
  EventBusDispatcherService,
  EventBusState
} from '@app/event-bus';
import { McsEvent } from '@app/event-manager';
import { McsRepository } from './core/mcs-repository.interface';

import { McsJobsRepository } from './repositories/mcs-jobs.repository';
import { McsInternetRepository } from './repositories/mcs-internet.repository';
import { McsServersRepository } from './repositories/mcs-servers.repository';
import { McsResourcesRepository } from './repositories/mcs-resources.repository';
import { McsToolsRepository } from './repositories/mcs-tools.repository';
import { McsTicketsRepository } from './repositories/mcs-tickets.repository';
import { McsSystemMessagesRepository } from './repositories/mcs-system-messages.repository';
import { McsProductsRepository } from './repositories/mcs-products.repository';
import { McsProductCatalogRepository } from './repositories/mcs-product-catalog.repository';
import { McsOrdersRepository } from './repositories/mcs-orders.repository';
import { McsMediaRepository } from './repositories/mcs-media.repository';
import { McsFirewallsRepository } from './repositories/mcs-firewalls.repository';
import { McsConsoleRepository } from './repositories/mcs-console.repository';
import { McsCompaniesRepository } from './repositories/mcs-companies.repository';

interface DataChangeEmitter<T> {
  eventEmitter: Observable<T>;
  event: EventBusState<any>;
}

@Injectable()
export class McsApiService {
  private readonly _translate: TranslateService;

  private readonly _jobsRepository: McsJobsRepository;
  private readonly _internetRepository: McsInternetRepository;
  private readonly _serversRepository: McsServersRepository;
  private readonly _resourcesRepository: McsResourcesRepository;
  private readonly _toolsRepository: McsToolsRepository;
  private readonly _ticketsRepository: McsTicketsRepository;
  private readonly _systemMessagesRepository: McsSystemMessagesRepository;
  private readonly _productsRepository: McsProductsRepository;
  private readonly _productCatalogRepository: McsProductCatalogRepository;
  private readonly _ordersRepository: McsOrdersRepository;
  private readonly _mediaRepository: McsMediaRepository;
  private readonly _firewallsRepository: McsFirewallsRepository;
  private readonly _consoleRepository: McsConsoleRepository;
  private readonly _companiesRepository: McsCompaniesRepository;

  private readonly _serversApi: IMcsApiServersService;
  private readonly _jobsApi: IMcsApiJobsService;
  private readonly _identityApi: IMcsApiIdentityService;
  private readonly _resourcesApi: IMcsApiResourcesService;
  private readonly _ticketsApi: IMcsApiTicketsService;
  private readonly _ordersApi: IMcsApiOrdersService;
  private readonly _mediaApi: IMcsApiMediaService;
  private readonly _firewallsApi: IMcsApiFirewallsService;
  private readonly _consoleApi: IMcsApiConsoleService;

  private readonly _eventDispatcher: EventBusDispatcherService;
  private readonly _entitiesDataChangeMap: Array<DataChangeEmitter<any>>;

  constructor(_injector: Injector) {
    this._translate = _injector.get(TranslateService);
    // Register api repositories
    this._jobsRepository = _injector.get(McsJobsRepository);
    this._internetRepository = _injector.get(McsInternetRepository);
    this._serversRepository = _injector.get(McsServersRepository);
    this._resourcesRepository = _injector.get(McsResourcesRepository);
    this._toolsRepository = _injector.get(McsToolsRepository);
    this._ticketsRepository = _injector.get(McsTicketsRepository);
    this._systemMessagesRepository = _injector.get(McsSystemMessagesRepository);
    this._productsRepository = _injector.get(McsProductsRepository);
    this._productCatalogRepository = _injector.get(McsProductCatalogRepository);
    this._ordersRepository = _injector.get(McsOrdersRepository);
    this._mediaRepository = _injector.get(McsMediaRepository);
    this._firewallsRepository = _injector.get(McsFirewallsRepository);
    this._consoleRepository = _injector.get(McsConsoleRepository);
    this._companiesRepository = _injector.get(McsCompaniesRepository);

    // Register api services
    let apiClientFactory = _injector.get(McsApiClientFactory);
    this._serversApi = apiClientFactory.getService(new McsApiServersFactory());
    this._jobsApi = apiClientFactory.getService(new McsApiJobsFactory());
    this._identityApi = apiClientFactory.getService(new McsApiIdentityFactory());
    this._resourcesApi = apiClientFactory.getService(new McsApiResourcesFactory());
    this._ticketsApi = apiClientFactory.getService(new McsApiTicketsFactory());
    this._ordersApi = apiClientFactory.getService(new McsApiOrdersFactory());
    this._mediaApi = apiClientFactory.getService(new McsApiMediaFactory());
    this._firewallsApi = apiClientFactory.getService(new McsApiFirewallsFactory());
    this._consoleApi = apiClientFactory.getService(new McsApiConsoleFactory());

    // Register events
    this._entitiesDataChangeMap = [];
    this._eventDispatcher = _injector.get(EventBusDispatcherService);
    this._createEntitySubscribers();
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
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.validateResourceCatalogItems'))
      ),
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
    return this._serversApi.updateServerOs(id, updates).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateServerOs'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateServerOsUpdatesSchedule(
    id: string,
    schedule: McsServerOsUpdatesScheduleRequest
  ): Observable<McsServerOsUpdatesSchedule> {
    return this._serversApi.updateServerOsUpdatesSchedule(id, schedule).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateServerOsUpdatesSchedule'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServerOsUpdatesSchedule(id: string): Observable<boolean> {
    return this._serversApi.deleteServerOsUpdatesSchedule(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteServerOsUpdatesSchedule'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  // TODO: Change the reference object into a model
  public inspectServerForAvailableOsUpdates(id: string, referenceObject: any): Observable<McsJob> {
    return this._serversApi.inspectServerForAvailableOsUpdates(id, referenceObject).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.inspectServerForAvailableOsUpdates'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public sendServerPowerState(id: string, powerstate: McsServerPowerstateCommand): Observable<McsJob> {
    return this._serversApi.sendServerPowerState(id, powerstate).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.sendServerPowerState'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public renameServer(id: string, rename: McsServerRename): Observable<McsJob> {
    return this._serversApi.renameServer(id, rename).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.renameServer'))
      ),
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
    return this._serversApi.cloneServer(id, serverData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.cloneServer'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServer(id: string, details: McsServerDelete): Observable<McsJob> {
    return this._serversApi.deleteServer(id, details).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteServer'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public resetServerPassword(id: string, details: McsServerPasswordReset): Observable<McsJob> {
    return this._serversApi.resetVmPassword(id, details).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.resetServerPassword'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateServerStorage(
    serverId: string,
    storageId: string,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsJob> {
    return this._serversApi.updateServerStorage(serverId, storageId, storageData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateServerStorage'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createServerStorage(id: string, storageData: McsServerStorageDeviceUpdate): Observable<McsJob> {
    return this._serversApi.createServerStorage(id, storageData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createServerStorage'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public addServerNic(id: string, nicData: McsServerCreateNic): Observable<McsJob> {
    return this._serversApi.addServerNic(id, nicData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.addServerNic'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateServerCompute(id: string, serverData: McsServerUpdate): Observable<McsJob> {
    return this._serversApi.updateServerCompute(id, serverData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateServerCompute'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public attachServerMedia(id: string, mediaData: McsServerAttachMedia): Observable<McsJob> {
    return this._serversApi.attachServerMedia(id, mediaData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.attachServerMedia'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public detachServerMedia(
    serverId: string,
    mediaId: string,
    mediaDetails: McsServerDetachMedia
  ): Observable<McsJob> {
    return this._serversApi.detachServerMedia(serverId, mediaId, mediaDetails).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.detachServerMedia'))
      ),
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
    return this._serversApi.createServerSnapshot(id, snapshotData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createServerSnapshot'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public restoreServerSnapshot(id: string, snapshotData: McsServerSnapshotRestore): Observable<McsJob> {
    return this._serversApi.restoreServerSnapshot(id, snapshotData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.restoreServerSnapshot'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServerSnapshot(id: string, snapshotData: McsServerSnapshotDelete): Observable<McsJob> {
    return this._serversApi.deleteServerSnapshot(id, snapshotData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteServerSnapshot'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateServerNic(serverId: string, nicId: string, nicData: McsServerCreateNic): Observable<McsJob> {
    return this._serversApi.updateServerNic(serverId, nicId, nicData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateServerNic'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServerNic(serverId: string, nicId: string, nicData: McsServerCreateNic): Observable<McsJob> {
    return this._serversApi.deleteServerNic(serverId, nicId, nicData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteServerNic'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServerStorage(
    serverId: string,
    storageId: string,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsJob> {
    return this._serversApi.deleteServerStorage(serverId, storageId, storageData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteServerStorage'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getPortals(query?: McsQueryParam): Observable<McsApiCollection<McsPortal>> {
    return this._mapToEntityRecords(this._toolsRepository, query).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getPortals'))
      )
    );
  }

  public getPortal(id: string): Observable<McsPortal> {
    return this._mapToEntityRecord(this._toolsRepository, id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getPortal'))
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
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createComment(id: string, commentData: McsTicketCreateComment): Observable<McsTicketComment> {
    return this._ticketsApi.createComment(id, commentData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createComment'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createAttachment(id: string, attachmentData: McsTicketCreateAttachment): Observable<McsTicketAttachment> {
    return this._ticketsApi.createAttachment(id, attachmentData).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createAttachment'))
      ),
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
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createOrderWorkFlow(id: string, workflow: McsOrderWorkflow): Observable<McsOrder> {
    this._eventDispatcher.dispatch(McsEvent.orderStateBusy, id);

    return this._ordersApi.createOrderWorkflow(id, workflow).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.createOrderWorkFlow'))
      ),
      finalize(() => this._eventDispatcher.dispatch(McsEvent.orderStateEnded, id)),
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

  public getItemOrderType(typeId: string): Observable<McsOrderItemType> {
    return this._ordersApi.getOrderItemType(typeId).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.getItemOrderType'))
      ),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateOrder(id: string, updatedOrder: McsOrderCreate): Observable<McsOrder> {
    this._eventDispatcher.dispatch(McsEvent.orderStateBusy, id);

    return this._ordersApi.updateOrder(id, updatedOrder).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.updateOrder'))
      ),
      finalize(() => this._eventDispatcher.dispatch(McsEvent.orderStateEnded, id)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteOrder(id: string): Observable<McsOrder> {
    this._eventDispatcher.dispatch(McsEvent.orderStateBusy, id);

    return this._ordersApi.deleteOrder(id).pipe(
      catchError((error) =>
        this._handleApiClientError(error, this._translate.instant('apiErrorMessage.deleteOrder'))
      ),
      finalize(() => this._eventDispatcher.dispatch(McsEvent.orderStateEnded, id)),
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
      errorContext.requester = ApiErrorRequester.None;
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
  private _createEntitySubscribers(): void {
    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeJobs,
      eventEmitter: this._jobsRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeServers,
      eventEmitter: this._serversRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeResources,
      eventEmitter: this._resourcesRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeTools,
      eventEmitter: this._toolsRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeTickets,
      eventEmitter: this._ticketsRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeSystemMessages,
      eventEmitter: this._systemMessagesRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeProducts,
      eventEmitter: this._productsRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeProductCatalog,
      eventEmitter: this._productCatalogRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeOrders,
      eventEmitter: this._ordersRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeMedia,
      eventEmitter: this._mediaRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeFirewalls,
      eventEmitter: this._firewallsRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeConsole,
      eventEmitter: this._consoleRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeCompanies,
      eventEmitter: this._companiesRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeInternetPorts,
      eventEmitter: this._internetRepository.dataChange()
    });

    // Dispatch all associated events
    this._entitiesDataChangeMap.forEach((dataChange) => {
      dataChange.eventEmitter.subscribe((entities) =>
        this._eventDispatcher.dispatch(dataChange.event, entities)
      );
    });
  }
}
