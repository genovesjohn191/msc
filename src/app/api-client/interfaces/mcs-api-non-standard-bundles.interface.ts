import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsNonStandardBundle
} from '@app/models';

export interface IMcsApiNonStandardBundlesService {

  /**
   * Gets all azure non standard bundles
   */
  getAzureNonStandardBundles(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsNonStandardBundle[]>>;
}
