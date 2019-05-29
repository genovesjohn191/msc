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
  McsServerPasswordReset
} from '@app/models';
import {
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';
import {
  IMcsApiServersService,
  McsApiClientFactory,
  McsApiServersFactory
} from '@app/api-client';
import { McsJobsRepository } from './repositories/mcs-jobs.repository';
import { McsInternetRepository } from './repositories/mcs-internet.repository';

@Injectable()
export class McsApiService {
  private readonly _jobsRepository: McsJobsRepository;
  private readonly _internetRepository: McsInternetRepository;

  private readonly _serversApi: IMcsApiServersService;

  constructor(_injector: Injector) {
    // Register api repositories
    this._jobsRepository = _injector.get(McsJobsRepository);
    this._internetRepository = _injector.get(McsInternetRepository);

    // Register api services
    let apiClientFactory = _injector.get(McsApiClientFactory);
    this._serversApi = apiClientFactory.getService(new McsApiServersFactory());
  }

  public getJobs(query: McsQueryParam): Observable<McsApiCollection<McsJob>> {
    let dataCollection = isNullOrEmpty(query) ?
      this._jobsRepository.getAll() :
      this._jobsRepository.filterBy(query);

    return dataCollection.pipe(
      map((response) => {
        return {
          collection: response,
          totalCollectionCount: this._jobsRepository.getTotalRecordsCount()
        } as McsApiCollection<McsJob>;
      })
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
      map((response) => {
        return {
          collection: response,
          totalCollectionCount: this._internetRepository.getTotalRecordsCount()
        } as McsApiCollection<McsInternetPort>;
      })
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
}
