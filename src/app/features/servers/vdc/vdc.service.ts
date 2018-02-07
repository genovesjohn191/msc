import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { ServerResource } from '../models';
import { isNullOrEmpty } from '../../../utilities';

@Injectable()
export class VdcService {

  /**
   * This will notify the subscriber everytime the server is selected or
   * everytime there are new data from the selected server
   */
  public selectedVdcStream: BehaviorSubject<ServerResource>;

  constructor() {
    this.selectedVdcStream = new BehaviorSubject<ServerResource>(undefined);
  }

  /**
   * This will update the selected VDC stream
   *
   * @param selectedVdc Selected VDC
   */
  public setSelectedVdc(selectedVdc: ServerResource): void {
    if (isNullOrEmpty(selectedVdc)) { return; }
    this.selectedVdcStream.next(selectedVdc);
  }
}
