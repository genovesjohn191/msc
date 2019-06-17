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
  catchError
} from 'rxjs/operators';
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
  ObtainmentMethod,
  McsServerOperatingSystem
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
  McsApiResourcesFactory
} from '@app/api-client';
import {
  EventBusDispatcherService,
  EventBusState
} from '@app/event-bus';
import { McsEvent } from '@app/event-manager';
import { McsJobsRepository } from './repositories/mcs-jobs.repository';
import { McsInternetRepository } from './repositories/mcs-internet.repository';
import { McsServersRepository } from './repositories/mcs-servers.repository';
import { McsResourcesRepository } from './repositories/mcs-resources.repository';

interface DataChangeEmitter<T> {
  eventEmitter: Observable<T>;
  event: EventBusState<any>;
}

@Injectable()
export class McsApiService {
  private readonly _jobsRepository: McsJobsRepository;
  private readonly _internetRepository: McsInternetRepository;
  private readonly _serversRepository: McsServersRepository;
  private readonly _resourcesRepository: McsResourcesRepository;

  private readonly _serversApi: IMcsApiServersService;
  private readonly _jobsApi: IMcsApiJobsService;
  private readonly _identityApi: IMcsApiIdentityService;
  private readonly _resourcesApi: IMcsApiResourcesService;

  private readonly _eventDispatcher: EventBusDispatcherService;
  private readonly _entitiesDataChangeMap: Array<DataChangeEmitter<any>>;

  constructor(_injector: Injector) {
    // Register api repositories
    this._jobsRepository = _injector.get(McsJobsRepository);
    this._internetRepository = _injector.get(McsInternetRepository);
    this._serversRepository = _injector.get(McsServersRepository);
    this._resourcesRepository = _injector.get(McsResourcesRepository);

    // Register api services
    let apiClientFactory = _injector.get(McsApiClientFactory);
    this._serversApi = apiClientFactory.getService(new McsApiServersFactory());
    this._jobsApi = apiClientFactory.getService(new McsApiJobsFactory());
    this._identityApi = apiClientFactory.getService(new McsApiIdentityFactory());
    this._resourcesApi = apiClientFactory.getService(new McsApiResourcesFactory());

    // Register events
    this._entitiesDataChangeMap = [];
    this._eventDispatcher = _injector.get(EventBusDispatcherService);
    this._createEntitySubscribers();
  }

  public getIdentity(): Observable<McsIdentity> {
    return this._identityApi.getIdentity().pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getJobsByStatus(...statuses: JobStatus[]): Observable<McsApiCollection<McsJob>> {
    return this._jobsApi.getJobsByStatus(...statuses).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response)),
    );
  }

  public getJobs(query?: McsQueryParam): Observable<McsApiCollection<McsJob>> {
    let dataCollection = isNullOrEmpty(query) ?
      this._jobsRepository.getAll() :
      this._jobsRepository.filterBy(query);

    return dataCollection.pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response, this._jobsRepository.getTotalRecordsCount()))
    );
  }

  public getJob(id: string, obtainment?: ObtainmentMethod): Observable<McsJob> {
    return this._jobsRepository.getById(id, obtainment).pipe(
      catchError(this._handleApiClientError.bind(this))
    );
  }

  public getJobConnection(): Observable<McsJobConnection> {
    return this._jobsApi.getJobConnection().pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getInternetPorts(query?: McsQueryParam): Observable<McsApiCollection<McsInternetPort>> {
    let dataCollection = isNullOrEmpty(query) ?
      this._internetRepository.getAll() :
      this._internetRepository.filterBy(query);

    return dataCollection.pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response, this._internetRepository.getTotalRecordsCount()))
    );
  }

  public getInternetPort(id: string, obtainment?: ObtainmentMethod): Observable<McsInternetPort> {
    return this._internetRepository.getById(id, obtainment).pipe(
      catchError(this._handleApiClientError.bind(this))
    );
  }

  public getResources(query?: McsQueryParam): Observable<McsApiCollection<McsResource>> {
    let dataCollection = isNullOrEmpty(query) ?
      this._resourcesRepository.getAll() :
      this._resourcesRepository.filterBy(query);

    return dataCollection.pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response, this._resourcesRepository.getTotalRecordsCount()))
    );
  }

  public getResource(id: string, obtainment?: ObtainmentMethod): Observable<McsResource> {
    return this._resourcesRepository.getById(id, obtainment).pipe(
      catchError(this._handleApiClientError.bind(this))
    );
  }

  public getResourceCompute(id: string): Observable<McsResourceCompute> {
    return this._resourcesApi.getResourceCompute(id).pipe(
      catchError(this._handleApiClientError.bind(this))
    );
  }

  public getResourceStorages(id: string): Observable<McsApiCollection<McsResourceStorage>> {
    return this._resourcesApi.getResourceStorage(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getResourceNetworks(id: string): Observable<McsApiCollection<McsResourceNetwork>> {
    return this._resourcesApi.getResourceNetworks(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getResourceNetwork(id: string, networkId: string): Observable<McsResourceNetwork> {
    return this._resourcesApi.getResourceNetwork(id, networkId).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getResourceCatalogs(id: string): Observable<McsApiCollection<McsResourceCatalog>> {
    return this._resourcesApi.getResourceCatalogs(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getResourceCatalog(id: string, catalogId: string): Observable<McsResourceCatalog> {
    return this._resourcesApi.getResourceCatalog(id, catalogId).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getResourceCatalogItems(id: string, catalogId: string): Observable<McsApiCollection<McsResourceCatalogItem>> {
    return this._resourcesApi.getResourceCatalogItems(id, catalogId).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getResourceCatalogItem(id: string, catalogId: string, itemId: string): Observable<McsResourceCatalog> {
    return this._resourcesApi.getResourceCatalogItem(id, catalogId, itemId).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getResourceVApps(id: string): Observable<McsApiCollection<McsResourceVApp>> {
    return this._resourcesApi.getResourceVApps(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public createResourceCatalogItem(
    id: string,
    catalogId: string,
    catalogItem: McsResourceCatalogItemCreate
  ): Observable<McsJob> {
    return this._resourcesApi.createResourceCatalogItem(id, catalogId, catalogItem).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public validateResourceCatalogItems(
    id: string,
    catalogItem: McsResourceCatalogItemCreate
  ): Observable<McsApiCollection<McsValidation>> {
    return this._resourcesApi.validateCatalogItems(id, catalogItem).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServers(query?: McsQueryParam): Observable<McsApiCollection<McsServer>> {
    let dataCollection = isNullOrEmpty(query) ?
      this._serversRepository.getAll() :
      this._serversRepository.filterBy(query);

    return dataCollection.pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response, this._serversRepository.getTotalRecordsCount()))
    );
  }

  public getServer(id: string, obtainment?: ObtainmentMethod): Observable<McsServer> {
    return this._serversRepository.getById(id, obtainment).pipe(
      catchError(this._handleApiClientError.bind(this))
    );
  }

  public getServerStorage(id: string): Observable<McsApiCollection<McsServerStorageDevice>> {
    return this._serversApi.getServerStorage(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerNics(id: string): Observable<McsApiCollection<McsServerNic>> {
    return this._serversApi.getServerNics(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerCompute(id: string): Observable<McsApiCollection<McsServerCompute>> {
    return this._serversApi.getServerCompute(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerMedia(id: string): Observable<McsApiCollection<McsServerMedia>> {
    return this._serversApi.getServerMedias(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerSnapshots(id: string): Observable<McsApiCollection<McsServerSnapshot>> {
    return this._serversApi.getServerSnapshots(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerOsUpdates(id: string, query?: McsQueryParam): Observable<McsApiCollection<McsServerOsUpdates>> {
    return this._serversApi.getServerOsUpdates(id, query).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerOsUpdatesDetails(id: string): Observable<McsServerOsUpdatesDetails> {
    return this._serversApi.getServerOsUpdatesDetails(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getServerOsUpdatesSchedule(id: string): Observable<McsApiCollection<McsServerOsUpdatesSchedule>> {
    return this._serversApi.getServerOsUpdatesSchedule(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerOsUpdatesCategories(): Observable<McsApiCollection<McsServerOsUpdatesCategory>> {
    return this._serversApi.getServerOsUpdatesCategories().pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public getServerOs(): Observable<McsApiCollection<McsServerOperatingSystem>> {
    return this._serversApi.getServerOs().pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => this._mapToCollection(response))
    );
  }

  public updateServerOs(id: string, updates: McsServerOsUpdatesRequest): Observable<McsJob> {
    return this._serversApi.updateServerOs(id, updates).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateServerOsUpdatesSchedule(
    id: string,
    schedule: McsServerOsUpdatesScheduleRequest
  ): Observable<McsServerOsUpdatesSchedule> {
    return this._serversApi.updateServerOsUpdatesSchedule(id, schedule).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServerOsUpdatesSchedule(id: string): Observable<boolean> {
    return this._serversApi.deleteServerOsUpdatesSchedule(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  // TODO: Change the reference object into a model
  public inspectServerForAvailableOsUpdates(id: string, referenceObject: any): Observable<McsJob> {
    return this._serversApi.inspectServerForAvailableOsUpdates(id, referenceObject).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public sendServerPowerState(id: string, powerstate: McsServerPowerstateCommand): Observable<McsJob> {
    return this._serversApi.sendServerPowerState(id, powerstate).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public renameServer(id: string, rename: McsServerRename): Observable<McsJob> {
    return this._serversApi.renameServer(id, rename).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createServer(serverData: McsServerCreate): Observable<McsJob> {
    return this._serversApi.createServer(serverData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public cloneServer(id: string, serverData: McsServerClone): Observable<McsJob> {
    return this._serversApi.cloneServer(id, serverData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServer(id: string, details: McsServerDelete): Observable<McsJob> {
    return this._serversApi.deleteServer(id, details).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public resetServerPassword(id: string, details: McsServerPasswordReset): Observable<McsJob> {
    return this._serversApi.resetVmPassword(id, details).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateServerStorage(
    serverId: string,
    storageId: string,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsJob> {
    return this._serversApi.updateServerStorage(serverId, storageId, storageData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createServerStorage(id: string, storageData: McsServerStorageDeviceUpdate): Observable<McsJob> {
    return this._serversApi.createServerStorage(id, storageData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public addServerNic(id: string, nicData: McsServerCreateNic): Observable<McsJob> {
    return this._serversApi.addServerNic(id, nicData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateServerCompute(id: string, serverData: McsServerUpdate): Observable<McsJob> {
    return this._serversApi.updateServerCompute(id, serverData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public attachServerMedia(id: string, mediaData: McsServerAttachMedia): Observable<McsJob> {
    return this._serversApi.attachServerMedia(id, mediaData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public detachServerMedia(
    serverId: string,
    mediaId: string,
    mediaDetails: McsServerDetachMedia
  ): Observable<McsJob> {
    return this._serversApi.detachServerMedia(serverId, mediaId, mediaDetails).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public getServerThumbnail(id: string): Observable<McsServerThumbnail> {
    return this._serversApi.getServerThumbnail(id).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public createServerSnapshot(id: string, snapshotData: McsServerSnapshotCreate): Observable<McsJob> {
    return this._serversApi.createServerSnapshot(id, snapshotData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public restoreServerSnapshot(id: string, snapshotData: McsServerSnapshotRestore): Observable<McsJob> {
    return this._serversApi.restoreServerSnapshot(id, snapshotData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServerSnapshot(id: string, snapshotData: McsServerSnapshotDelete): Observable<McsJob> {
    return this._serversApi.deleteServerSnapshot(id, snapshotData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public updateServerNic(serverId: string, nicId: string, nicData: McsServerCreateNic): Observable<McsJob> {
    return this._serversApi.updateServerNic(serverId, nicId, nicData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServerNic(serverId: string, nicId: string, nicData: McsServerCreateNic): Observable<McsJob> {
    return this._serversApi.deleteServerNic(serverId, nicId, nicData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServerStorage(
    serverId: string,
    storageId: string,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsJob> {
    return this._serversApi.deleteServerStorage(serverId, storageId, storageData).pipe(
      catchError(this._handleApiClientError.bind(this)),
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  /**
   * Handles the API Client error and rethrow it as an error context
   * @param errorDetails Error details to be rethrow
   */
  private _handleApiClientError(errorDetails: McsApiErrorResponse): Observable<never> {
    let errorContext = new McsApiErrorContext();
    errorContext.requester = ApiErrorRequester.None;
    errorContext.message = getSafeProperty(errorDetails, (obj) => obj.message, '');
    errorContext.details = errorDetails;
    return throwError(errorContext);
  }

  /**
   * Creates the entity subscribers to dispatch in the event bus state
   */
  private _createEntitySubscribers(): void {
    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeServers,
      eventEmitter: this._serversRepository.dataChange()
    });

    this._entitiesDataChangeMap.push({
      event: McsEvent.dataChangeResources,
      eventEmitter: this._resourcesRepository.dataChange()
    });

    // Dispatch all associated events
    this._entitiesDataChangeMap.forEach((dataChange) => {
      dataChange.eventEmitter.subscribe((entities) =>
        this._eventDispatcher.dispatch(dataChange.event, entities)
      );
    });
  }

  /**
   * Map records to the collection list of the api
   * @param records Records to be converted into collection
   */
  private _mapToCollection<T>(records: McsApiSuccessResponse<any>): McsApiCollection<T>;

  /**
   * Map records to the collection list of the api
   * @param records Records to be converted into collection
   * @param totalRecordsCount Total records count of the collection
   */
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
