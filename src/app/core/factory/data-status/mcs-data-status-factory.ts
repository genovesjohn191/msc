import { BehaviorSubject } from 'rxjs/Rx';
import { McsDataStatus } from '../../enumerations/mcs-data-status.enum';
import { isNullOrEmpty } from '../../../utilities';

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
    }
  }

  /**
   * Event that emits when status has changed
   */
  private _statusChanged = new BehaviorSubject<McsDataStatus>(undefined);
  public get statusChanged(): BehaviorSubject<McsDataStatus> { return this._statusChanged; }

  constructor() {
    this._dataStatus = McsDataStatus.Success;
  }

  /**
   * Set data status to in progress
   */
  public setInProgress(): void {
    this.dataStatus = McsDataStatus.InProgress;
  }

  /**
   * Set data status to in error
   */
  public setError(): void {
    this.dataStatus = McsDataStatus.Error;
  }

  /**
   * Set data status to in success or empty based on the record provided
   */
  public setSuccesfull(data?: T): void {
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
