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
  McsApiCollection
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { McsJobsRepository } from './repositories/mcs-jobs.repository';
import { McsInternetRepository } from './repositories/mcs-internet.repository';

@Injectable()
export class McsApiService {
  private readonly _jobsRepository: McsJobsRepository;
  private readonly _internetRepository: McsInternetRepository;

  constructor(_injector: Injector) {
    this._jobsRepository = _injector.get(McsJobsRepository);
    this._internetRepository = _injector.get(McsInternetRepository);
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
}
