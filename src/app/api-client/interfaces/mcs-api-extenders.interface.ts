import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsExtenderService,
  McsExtendersQueryParams
} from '@app/models';

export interface IMcsApiExtendersService {

  /**
   * Gets all Extender services
   */
  getExtenders(query?: McsExtendersQueryParams, optionalHeaders?: Map<string, any>):
    Observable<McsApiSuccessResponse<McsExtenderService[]>>;

  /**
   * Gets a Extender service by ID
   */
  getExtenderServiceById(uuid: string, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsExtenderService>>;
}
