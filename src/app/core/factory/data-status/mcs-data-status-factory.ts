import { ChangeDetectorRef } from '@angular/core';
import {
  BehaviorSubject,
  Subscription
} from 'rxjs';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { McsDataStatus } from '@app/models';

export class McsDataStatusFactory<T> {
  /**
   * Get the data status of the model
   */
  private _dataStatus: McsDataStatus;
  public get dataStatus(): McsDataStatus { return this._dataStatus; }
  public set dataStatus(value: McsDataStatus) {
    if (this._dataStatus !== value) {
      this._dataStatus = value;
      this._notifyStatusChanged();
      if (!isNullOrEmpty(this._changeDetectorRef)) {
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  /**
   * Event that emits when status has changed
   */
  private _statusChanged = new BehaviorSubject<McsDataStatus>(undefined);
  public get statusChanged(): BehaviorSubject<McsDataStatus> { return this._statusChanged; }

  /**
   * Returns the instance of subscription when the status is in-progress
   */
  private _statusSubscription: Subscription;
  public get statusSubscription(): Subscription { return this._statusSubscription; }

  constructor(private _changeDetectorRef?: ChangeDetectorRef) {
    this._dataStatus = McsDataStatus.Success;
  }

  /**
   * Set data status to in progress
   */
  public setInProgress(): void {
    this._statusSubscription = new Subscription();
    this.dataStatus = McsDataStatus.InProgress;
  }

  /**
   * Set data status to in error
   */
  public setError(): void {
    unsubscribeSafely(this._statusSubscription);
    this.dataStatus = McsDataStatus.Error;
  }

  /**
   * Set data status to in success or empty based on the record provided
   */
  public setSuccessful(data?: T): void {
    unsubscribeSafely(this._statusSubscription);
    this.dataStatus = isNullOrEmpty(data) ?
      McsDataStatus.Empty : McsDataStatus.Success;
  }

  /**
   * Notify status changed event
   */
  private _notifyStatusChanged(): void {
    this._statusChanged.next(this.dataStatus);
  }
}
