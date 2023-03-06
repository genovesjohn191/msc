import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsQueryParam,
  McsNonStandardBundle
} from '@app/models';
import { McsApiClientHttpService } from '../mcs-api-client-http.service';
import { IMcsApiNonStandardBundlesService } from '../interfaces/mcs-api-non-standard-bundles.interface';

@Injectable()
export class McsApiNonStandardBundlesService implements IMcsApiNonStandardBundlesService {

  constructor(private _mcsApiHttpService: McsApiClientHttpService) { }

  public getAzureNonStandardBundles(query?: McsQueryParam):
    Observable<McsApiSuccessResponse<McsNonStandardBundle[]>> {
    if (isNullOrEmpty(query)) { query = new McsQueryParam(); }

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/public-cloud/non-standard-bundles';
    mcsApiRequestParameter.searchParameters = McsQueryParam.convertCustomQueryToParamMap(query);

    return this._mcsApiHttpService.get(mcsApiRequestParameter)
      .pipe(
        map((response) => {
          return McsApiSuccessResponse.deserializeResponse<McsNonStandardBundle[]>(
            McsNonStandardBundle, response
        );
      })
    );
  }
}