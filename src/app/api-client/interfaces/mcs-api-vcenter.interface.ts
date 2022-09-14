import { Observable } from 'rxjs';

import {
  McsApiSuccessResponse,
  McsJob,
  McsVCenterBaseline,
  McsVCenterBaselineQueryParam,
  McsVCenterBaselineRemediate,
  McsVCenterDatacentreQueryParam,
  McsVCenterDataCentre,
  McsVCenterHost,
  McsVCenterHostQueryParam,
  McsVCenterInstance
} from '@app/models';

export interface IMcsApiVCenterService {

  getVCenterBaselines(query?: McsVCenterBaselineQueryParam): Observable<McsApiSuccessResponse<McsVCenterBaseline[]>>;

  getVCenterBaseline(id: string): Observable<McsApiSuccessResponse<McsVCenterBaseline>>;

  remediateBaseline(id: string, request: McsVCenterBaselineRemediate): Observable<McsApiSuccessResponse<McsJob>>;

  getVCenterInstances(optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsVCenterInstance[]>>;

  getVCenterDataCentres(query?: McsVCenterDatacentreQueryParam): Observable<McsApiSuccessResponse<McsVCenterDataCentre[]>>;

  getVCenterHosts(query?: McsVCenterHostQueryParam): Observable<McsApiSuccessResponse<McsVCenterHost[]>>;
}
