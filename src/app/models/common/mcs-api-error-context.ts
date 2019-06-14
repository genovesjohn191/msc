import {
  Observable,
  throwError
} from 'rxjs';
import { getSafeProperty } from '@app/utilities';
import { ApiErrorRequester } from '../enumerations/api-error-requester.enum';
import { McsApiErrorResponse } from './mcs-api-error-response';

export interface IMcsApiErrorContext {
  requester: ApiErrorRequester;
  message: string;
  details: McsApiErrorResponse;
}

export class McsApiErrorContext {
  /**
   * Rethrow the exception context from the API calls
   * @param context Context to be rethrown
   */
  public static throwCustomError(context: IMcsApiErrorContext): Observable<never> {
    let errorContext = new McsApiErrorContext();
    errorContext.requester = getSafeProperty(context, (obj) => obj.requester, ApiErrorRequester.Partial);
    errorContext.message = getSafeProperty(context, (obj) => obj.message, 'Unexpected error occured');
    errorContext.details = getSafeProperty(context, (obj) => obj.details, {});
    return throwError(errorContext);
  }

  public static throwPrimaryError<T>(errorDetails: T, customMessage?: string): Observable<never> {
    let errorMessage = getSafeProperty(errorDetails as any, (obj) => obj.message, 'Unexpected error occured.');
    let primaryError = new McsApiErrorContext();

    primaryError.details = errorDetails as any;
    primaryError.requester = ApiErrorRequester.Primary;
    primaryError.message = customMessage || errorMessage;
    return throwError(primaryError);
  }

  public static throwPartialError<T>(errorDetails: T, customMessage?: string): Observable<never> {
    let errorMessage = getSafeProperty(errorDetails as any, (obj) => obj.message, 'Unexpected error occured.');
    let partialError = new McsApiErrorContext();

    partialError.requester = ApiErrorRequester.Partial;
    partialError.details = errorDetails as any;
    partialError.message = customMessage || errorMessage;
    return throwError(partialError);
  }

  public requester: ApiErrorRequester;
  public details: McsApiErrorResponse;
  public message: string;
}
