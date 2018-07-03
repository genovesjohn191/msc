import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Resource } from '../../resources';
import { isNullOrEmpty } from '../../../utilities';

@Injectable()
export class VdcService {

  /**
   * This will notify the subscriber everytime the server is selected or
   * everytime there are new data from the selected server
   */
  public selectedVdcStream: BehaviorSubject<Resource>;

  constructor() {
    this.selectedVdcStream = new BehaviorSubject<Resource>(undefined);
  }

  /**
   * This will update the selected VDC stream
   *
   * @param selectedVdc Selected VDC
   */
  public setSelectedVdc(selectedVdc: Resource): void {
    if (isNullOrEmpty(selectedVdc)) { return; }
    this.selectedVdcStream.next(selectedVdc);
  }
}
