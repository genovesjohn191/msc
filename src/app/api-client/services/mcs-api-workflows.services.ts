import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsJob,
  McsWorkflowCreate
} from '@app/models';

import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiWorkflowsService } from '../interfaces/mcs-api-workflows.interface';
import { serializeObjectToJson } from '@app/utilities';

@Injectable()
export class McsApiWorkflowsService implements IMcsApiWorkflowsService {

  constructor(private _mcsApiService: McsApiClientHttpService) { }

  public provisionWorkflows(workflows: McsWorkflowCreate[]): Observable<McsApiSuccessResponse<McsJob[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/workflows';
    mcsApiRequestParameter.recordData = serializeObjectToJson(workflows);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsJob[]>(McsJob, response);
        })
      );
  }
}
