import { Observable } from 'rxjs';
import {
  McsSystemMessage,
  McsQueryParam,
  McsApiSuccessResponse,
  McsSystemMessageCreate
} from '@app/models';

export interface IMcsApiSystemService {
  /**
   * Get all the messages from the API
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getMessages(query?: McsQueryParam): Observable<McsApiSuccessResponse<McsSystemMessage[]>>;

  /**
   * Get message by ID (MCS API Response)
   * @param id MESSAGE identification
   */
  getMessage(id: string): Observable<McsApiSuccessResponse<McsSystemMessage>>;

  /**
   * This will create the new message based on the inputted information
   * @param messageData Message data to be created
   */
  createMessage(messageData: McsSystemMessageCreate): Observable<McsApiSuccessResponse<McsSystemMessageCreate>>;

  /**
   * This will validate the new message based on the inputted information
   * @param messageData Message data to be validated
   */
  validateMessage(messageData: McsSystemMessageCreate): Observable<McsApiSuccessResponse<McsSystemMessage[]>>;
}
