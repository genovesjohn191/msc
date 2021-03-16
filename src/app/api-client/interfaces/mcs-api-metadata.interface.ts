import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsKeyValue
} from '@app/models';

export interface IMcsApiMetadataService {
  /**
   * Get all available links based for current users
   */
  getLinks(): Observable<McsApiSuccessResponse<McsKeyValue[]>>;
}
