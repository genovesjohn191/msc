import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isNullOrEmpty } from '@app/utilities';
import { McsResource } from '@app/models';

@Injectable()
export class VdcService {
  public selectedVdcStream: BehaviorSubject<McsResource>;
  private _resourceId: string;

  constructor() {
    this.selectedVdcStream = new BehaviorSubject<McsResource>(undefined);
  }

  /**
   * This will update the selected VDC stream
   *
   * @param selectedVdc Selected VDC
   */
  public setSelectedVdc(selectedVdc: McsResource): void {
    if (isNullOrEmpty(selectedVdc)) { return; }
    this.selectedVdcStream.next(selectedVdc);
  }

  /**
   * Sets the resource id of the resource
   */
  public setResourceId(resourceId: string): void {
    this._resourceId = resourceId;
  }

  /**
   * Gets the resource id
   */
  public getResourceId(): string {
    return this._resourceId;
  }
}
