import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsVcloudInstance,
  McsVcloudInstanceProviderVdc,
} from '@app/models';

export interface IMcsApiVcloudInstanceService {

  /**
   * Get Vcloud Instances (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getVcloudInstances(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsVcloudInstance[]>>;

  /**
   * Get Vcloud Instances Provider VDCs by ID (MCS API Response)
   * @param id Location identification
   */
  getVcloudInstanceProviderVdc(id: string,
    isDedicated: boolean,
    optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsVcloudInstanceProviderVdc[]>>;
}
