import {
  Injectable,
  Injector
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsInternetPort,
  McsQueryParam,
  McsJob,
  McsApiCollection,
  McsServerPowerstateCommand,
  McsServerRename,
  McsServerDelete,
  McsServerPasswordReset,
  JobStatus,
  McsApiSuccessResponse
} from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  IMcsApiServersService,
  McsApiClientFactory,
  McsApiServersFactory,
  IMcsApiJobsService
} from '@app/api-client';
import { McsJobsRepository } from './repositories/mcs-jobs.repository';
import { McsInternetRepository } from './repositories/mcs-internet.repository';

@Injectable()
export class McsApiService {
  private readonly _jobsRepository: McsJobsRepository;
  private readonly _internetRepository: McsInternetRepository;

  private readonly _jobsApi: IMcsApiJobsService;
  private readonly _serversApi: IMcsApiServersService;

  constructor(_injector: Injector) {
    // Register api repositories
    this._jobsRepository = _injector.get(McsJobsRepository);
    this._internetRepository = _injector.get(McsInternetRepository);

    // Register api services
    let apiClientFactory = _injector.get(McsApiClientFactory);
    this._serversApi = apiClientFactory.getService(new McsApiServersFactory());
  }

  public getJobsByStatus(...statuses: JobStatus[]): Observable<McsApiCollection<McsJob>> {
    return this._jobsApi.getJobsByStatus(...statuses).pipe(
      map((response) => this._mapToCollection(response))
    );
  }

  public getJobs(query: McsQueryParam): Observable<McsApiCollection<McsJob>> {
    let dataCollection = isNullOrEmpty(query) ?
      this._jobsRepository.getAll() :
      this._jobsRepository.filterBy(query);

    return dataCollection.pipe(
      map((response) => this._mapToCollection(response, this._jobsRepository.getTotalRecordsCount()))
    );
  }

  public getJob(id: string): Observable<McsJob> {
    return this._jobsRepository.getById(id);
  }

  public getInternetPorts(query: McsQueryParam): Observable<McsApiCollection<McsInternetPort>> {
    let dataCollection = isNullOrEmpty(query) ?
      this._internetRepository.getAll() :
      this._internetRepository.filterBy(query);

    return dataCollection.pipe(
      map((response) => this._mapToCollection(response, this._internetRepository.getTotalRecordsCount()))
    );
  }

  public getInternetPort(id: string): Observable<McsInternetPort> {
    return this._internetRepository.getById(id);
  }

  public sendServerPowerState(id: string, powerstate: McsServerPowerstateCommand): Observable<McsJob> {
    return this._serversApi.sendServerPowerState(id, powerstate).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public renameServer(id: string, rename: McsServerRename): Observable<McsJob> {
    return this._serversApi.renameServer(id, rename).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public deleteServer(id: string, details: McsServerDelete): Observable<McsJob> {
    return this._serversApi.deleteServer(id, details).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
  }

  public resetServerPassword(id: string, details: McsServerPasswordReset): Observable<McsJob> {
    return this._serversApi.resetVmPassword(id, details).pipe(
      map((response) => getSafeProperty(response, (obj) => obj.content))
    );
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
