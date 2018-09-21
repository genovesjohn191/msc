import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isNullOrEmpty } from '@app/utilities';
import { McsResource } from '@app/models';

@Injectable()
export class VdcService {

  /**
   * This will notify the subscriber everytime the server is selected or
   * everytime there are new data from the selected server
   */
  public selectedVdcStream: BehaviorSubject<McsResource>;

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
}
