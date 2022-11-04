import {
  BehaviorSubject,
  Observable,
  Subject
} from 'rxjs';
import {
  filter,
  map,
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import {
  isNullOrEmpty,
  unsubscribeSafely
} from '../../functions/mcs-object.function';
import { DataProcessStatus } from './data-process-status';
import { IDataProcess } from './data-process.interface';

export class DataProcess<TError> implements IDataProcess<TError> {
  public inProgress$: Observable<boolean>;
  public onError$: Observable<TError[]>;
  public onSuccess$: Observable<boolean>;
  public completed$: Observable<boolean>;

  private _errors: TError[];
  private _destroySubject = new Subject<void>();
  private _progressChange = new BehaviorSubject<DataProcessStatus>(null);

  constructor() {
    this._registerSubscriptions();
  }

  public dispose(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public get status(): DataProcessStatus {
    return this._progressChange.getValue();
  }

  public get errors(): TError[] {
    return this._errors;
  }

  public get ended(): boolean {
    return this.status === DataProcessStatus.Failed ||
      this.status === DataProcessStatus.Success;
  }

  public get inProgress(): boolean {
    return this.status === DataProcessStatus.InProgress;
  }

  public get completed(): boolean {
    return this.status === DataProcessStatus.Success;
  }

  public get failed(): boolean {
    return this.status === DataProcessStatus.Failed;
  }

  public get change(): Observable<DataProcessStatus> {
    return this._progressChange.asObservable();
  }

  public updateProcessSource(targetStatus: DataProcessStatus, errors?: TError[]): DataProcess<TError> {
    if (isNullOrEmpty(targetStatus)) { return this; }

    switch (targetStatus) {
      case DataProcessStatus.Failed:
        this.setError(errors)
        break;

      case DataProcessStatus.InProgress:
        this.setInProgress()
        break;

      case DataProcessStatus.Success:
        this.setCompleted();
        break;

      default:
        // Do nothing
        break;
    }
    return this;
  }

  public setInProgress(): DataProcess<TError> {
    this._progressChange.next(DataProcessStatus.InProgress);
    return this;
  }

  public setError(errors?: TError[]): DataProcess<TError> {
    this._errors = errors || [];
    this._progressChange.next(DataProcessStatus.Failed);
    return this;
  }

  public setCompleted(): DataProcess<TError> {
    this._progressChange.next(DataProcessStatus.Success);
    return this;
  }

  private _registerSubscriptions(): void {
    this.inProgress$ = this._progressChange.pipe(
      takeUntil(this._destroySubject),
      map(status => status === DataProcessStatus.InProgress),
      shareReplay(1)
    );

    this.onError$ = this._progressChange.pipe(
      takeUntil(this._destroySubject),
      filter(status => status === DataProcessStatus.Failed),
      map(() => this._errors),
      shareReplay(1)
    );

    this.onSuccess$ = this._progressChange.pipe(
      takeUntil(this._destroySubject),
      map(status => status === DataProcessStatus.Success),
      shareReplay(1)
    );

    this.completed$ = this._progressChange.pipe(
      takeUntil(this._destroySubject),
      map(status => status === DataProcessStatus.Failed ||
        status === DataProcessStatus.Success),
      shareReplay(1)
    );
  }
}
