import {
  Observable,
  throwError
} from 'rxjs';
import { ApiErrorRequester } from '../enumerations/api-error-requester.enum';
import { McsApiErrorResponse } from './mcs-api-error-response';

export interface IMcsApiErrorContext {
  requester: ApiErrorRequester;
  message: string;
  details: McsApiErrorResponse;
}

export class McsApiErrorContext {
  public requester: ApiErrorRequester;
  public details: McsApiErrorResponse;
  public message: string;

  /**
   * Throws a primary error with a custom message according to input
   * @param errorDetails Error details to be re throw
   * @param customMessage Custom message to be displayed otherwise it will use the default
   */
  public static throwPrimaryError(errorDetails: McsApiErrorContext, customMessage?: string): Observable<never> {
    errorDetails.requester = ApiErrorRequester.Primary;
    errorDetails.message = customMessage || errorDetails.message;
    return throwError(errorDetails);
  }

  /**
   * Throws a partial error with a custom message according to input
   * @param errorDetails Error details to be re throw
   * @param customMessage Custom message to be displayed otherwise it will use the default
   */
  public static throwPartialError(errorDetails: McsApiErrorContext, customMessage?: string): Observable<never> {
    errorDetails.requester = ApiErrorRequester.Partial;
    errorDetails.message = customMessage || errorDetails.message;
    return throwError(errorDetails);
  }
}
