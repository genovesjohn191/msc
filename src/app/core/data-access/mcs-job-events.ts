import {
  map,
  shareReplay,
  takeUntil,
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';

import { Injector } from '@angular/core';
import {
  DataStatus,
  McsJob
} from '@app/models';
import {
  unsubscribeSafely,
  McsDisposable
} from '@app/utilities';

export class McsJobEvents implements McsDisposable {
  public jobs$: Observable<McsJob[]>;
  public dataStatus$: Observable<DataStatus>;
  public inProgress$: Observable<boolean>;

  private _destroySubject = new Subject<void>();
  private _jobsChange = new BehaviorSubject<McsJob[]>(null);
  private _dataStatusChange = new BehaviorSubject<DataStatus>(null);

  constructor(injector: Injector) {
    this._subscribeJobsChange();
    this._subscribeDataStatusChange();
  }

  public setJobs(...jobs: McsJob[]): McsJobEvents {
    this._jobsChange.next(jobs);
    return this;
  }

  public setStatus(status: DataStatus): McsJobEvents {
    this._dataStatusChange.next(status);
    return this;
  }

  public dispose(): void {
    unsubscribeSafely(this._destroySubject);
  }

  private _subscribeJobsChange(): void {
    this.jobs$ = this._jobsChange.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );
  }

  private _subscribeDataStatusChange(): void {
    this.dataStatus$ = this._dataStatusChange.pipe(
      takeUntil(this._destroySubject),
      shareReplay(1)
    );

    this.inProgress$ = this._dataStatusChange.pipe(
      takeUntil(this._destroySubject),
      map(dataStatus => dataStatus === DataStatus.PreActive ||
        dataStatus === DataStatus.Active),
      shareReplay(1)
    );
  }
}
