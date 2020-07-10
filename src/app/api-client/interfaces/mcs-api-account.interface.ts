import { Observable } from 'rxjs';
import {
  McsApiSuccessResponse,
  McsQueryParam,
  McsAccount
} from '@app/models';

export interface IMcsApiAccountService {

  /**
   * Gets the current account information
   */
  getAccount(): Observable<McsApiSuccessResponse<McsAccount>>;

  /**
   * Gets the list of users
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getUsers(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsAccount[]>>;

  /**
   * Get a user by username
   * @param username username to search
   */
  getUser(username: string): Observable<McsApiSuccessResponse<McsAccount>>;
}
