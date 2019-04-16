import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsConsole
} from '@app/models';

export interface IMcsApiConsoleService {
  /**
   * Get the server console for the commands to be executed
   * @param id Server identification
   */
  getServerConsole(id: string): Observable<McsApiSuccessResponse<McsConsole>>;
}
