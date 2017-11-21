import {
  ErrorHandler,
  isDevMode
} from '@angular/core';
import { resolveEnvVar } from './utilities';
const RAVEN = require('raven-js');
let ravenInstalled: boolean = false;

/**
 * Raven error handler class that logs all the error to the sentry
 * in case of production mode, otherwise in console.
 */
class RavenErrorHandler implements ErrorHandler {
  public handleError(error: any): void {
    if (!isDevMode()) {
      RAVEN.captureException(error.originalError || error);
    }
  }
}

/**
 * This will return the error handler provider based on the
 * environment settings (Production or Development) mode
 */
export function errorHandlerProvider() {
  if (!isDevMode()) {
    // Configure Raven Logger
    if (!ravenInstalled) {
      RAVEN.config(resolveEnvVar('SENTRY_DSN', SENTRY_DSN)).install();
      ravenInstalled = true;
    }
    return new RavenErrorHandler();
  } else {
    return new ErrorHandler();
  }
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
  if (!isDevMode()) {
    RAVEN.setUserContext({
      email: userEmail,
      id: userId,
      username: userName
    });
  }
}
