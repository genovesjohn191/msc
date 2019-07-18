import {
  ErrorHandler,
  isDevMode
} from '@angular/core';
import {
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import {
  resolveEnvVar,
  McsEnvironmentVariables
} from './utilities';

const RAVEN = require('raven-js');
let ravenInstalled: boolean = false;

/**
 * Raven error handler class that logs all the error to the sentry
 * in case of production mode, otherwise in console.
 *
 * `@Note:` Http Response error are not included in logging the sentry
 */
class RavenErrorHandler implements ErrorHandler {
  public handleError(error: HttpResponse<any> | any): void {
    let isHttpResponse = (error instanceof HttpResponse) ||
      (error instanceof HttpErrorResponse);

    if (!isDevMode() && !isHttpResponse) {
      RAVEN.captureException(error.originalError || error);
    }
  }
}

/**
 * This will return the error handler provider based on the
 * environment settings (Production or Development) mode
 */
export function errorHandlerProvider() {
  let displayErrorToSentry = !isDevMode() && ravenInstalled;
  return displayErrorToSentry ? new RavenErrorHandler() : new ErrorHandler();
}

/**
 * Set the RAVEN (Sentry) Identity information
 *
 * `@Note` Calling this function will override the original setting
 * @param userId User Id of the current user
 * @param userName User name of the current user
 * @param userEmail User Email of the current email
 */
export function setUserIdentity(userId: any, userName: string, userEmail: string) {
  if (isDevMode()) { return; }
  RAVEN.setUserContext({
    email: userEmail,
    id: userId,
    username: userName
  });
  RAVEN.config(resolveEnvVar(McsEnvironmentVariables.SentryDns)).install();
  ravenInstalled = true;
}
