import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsInternetPort,
  McsQueryParam
} from '@app/models';

export interface IMcsApiInternetService {

  /**
   * Get all the internet ports
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getInternetPorts(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsInternetPort[]>>;

  /**
   * Get the internet port
   * @param id Internet port identification
   */
  getInternetPort(id: string): Observable<McsApiSuccessResponse<McsInternetPort>>;
}
