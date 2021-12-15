import {
  BehaviorSubject,
  Observable,
  Subscription
} from 'rxjs';
import { map } from 'rxjs/operators';

import { ChangeDetectorRef } from '@angular/core';
import { DataStatus } from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

export class McsDataStatusFactory<T> {

  private _dataStatus: DataStatus;
  public get dataStatus(): DataStatus { return this._dataStatus; }
  public set dataStatus(value: DataStatus) {
    if (this._dataStatus !== value) {
      this._dataStatus = value;
      this._notifyStatusChanged();
      if (!isNullOrEmpty(this._changeDetectorRef)) {
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  public inProgress$: Observable<boolean>;
  public completed$: Observable<boolean>;

  /**
   * Event that emits when status has changed
   */
  private _statusChanged = new BehaviorSubject<DataStatus>(undefined);
  public get statusChanged(): BehaviorSubject<DataStatus> { return this._statusChanged; }

  /**
   * Returns the instance of subscription when the status is in-progress
   */
  private _statusSubscription: Subscription;
  public get statusSubscription(): Subscription { return this._statusSubscription; }

  constructor(
    private _changeDetectorRef?: ChangeDetectorRef
  ) {
    this._dataStatus = DataStatus.Success;
    this._subscribeToStatusChange();
  }

  /**
   * Set data status to in progress
   */
  public setInProgress(): void {
    this._statusSubscription = new Subscription();
    this.dataStatus = DataStatus.Active;
  }

  /**
   * Set data status to in error
   */
  public setError(): void {
    unsubscribeSafely(this._statusSubscription);
    this.dataStatus = DataStatus.Error;
  }

  /**
   * Set data status to in success or empty based on the record provided
   */
  public setSuccessful(data?: T): void {
    unsubscribeSafely(this._statusSubscription);
    this.dataStatus = isNullOrEmpty(data) ?
      DataStatus.Empty : DataStatus.Success;
  }

  /**
   * Notify status changed event
   */
  private _notifyStatusChanged(): void {
    this._statusChanged.next(this.dataStatus);
  }

  private _subscribeToStatusChange(): void {
    this.inProgress$ = this._statusChanged.pipe(
      map(status => status === DataStatus.PreActive ||
        status === DataStatus.Active)
    );

    this.completed$ = this.statusChanged.pipe(
      map(status => status === DataStatus.Empty ||
        status === DataStatus.Success)
    );
  }
}
