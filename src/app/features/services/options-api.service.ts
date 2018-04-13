import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  McsApiSuccessResponse,
  McsHttpStatusCode
} from '../../core';

@Injectable()
export class OptionsApiService {
  // TODO: Needs refactoring once ordering API is ready

  /**
   * Get anti-malware options
   * TODO: Will update this one when API is ready
   */
  public getAntiMalwareServiceOptions(): Observable<McsApiSuccessResponse<string[]>> {
    let response = new McsApiSuccessResponse<string[]>();
    response.status = McsHttpStatusCode.Success;
    response.totalCount = 2;
    response.content = ['Standard', 'Self-Managed'];

    return Observable.of(response);
  }
}
