import {
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import {
  isDevMode,
  ErrorHandler,
  Injectable,
  Injector
} from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  ApiErrorRequester,
  HttpStatusCode,
  McsApiErrorContext,
  McsApiErrorResponse,
  McsIdentity,
  McsStateNotification
} from '@app/models';
import {
  isNullOrEmpty,
  resolveEnvVar,
  McsEnvironmentVariables
} from '@app/utilities';

import { McsAuthenticationService } from '../authentication/mcs-authentication.service';
import { McsErrorHandlerService } from '../services/mcs-error-handler.service';

const RAVEN = require('raven-js');

@Injectable()
export class McsErrorHandlerInterceptor implements ErrorHandler {
  private _httpErrorHandlerMap = new Map<HttpStatusCode, () => void>();
  private _previouslyHandledError: any;

  constructor(
    private _injector: Injector,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    this._registerEvents();
    this._createHttpHandlerTable();
  }

  /**
   * Handles the error for HTTP calls and exceptions
   * @param error Error to be handled
   */
  public handleError(error: HttpErrorResponse | McsApiErrorResponse | McsApiErrorContext | any): void {
    let customError = error.rejection || error;
    let isHttpResponse = (customError instanceof HttpResponse) ||
      (customError instanceof McsApiErrorResponse) ||
      (customError instanceof McsApiErrorContext);

    isHttpResponse ?
      this._handlerHttpError(customError) :
      this._handleExceptionError(customError);
  }

  /**
   * Handles the http response error
   * @param error Error to be handled
   */
  private _handlerHttpError(error: McsApiErrorContext | McsApiErrorResponse | HttpErrorResponse): void {
    // We need to check the previously handled error because there
    // are some circumstances where the shareReplay() subscribes
    // twice and throws an error twice or more.
    if (this._previouslyHandledError === error) {
      return;
    }

    let isAuthorized = (error instanceof McsApiErrorContext) ?
      this._isAuthorized(error.details.status) :
      this._isAuthorized(error.status);
    if (!isAuthorized) { return; }

    (error instanceof McsApiErrorContext) ?
      this._handleApiErrorContext(error) :
      this._handleApiErrorResponse(error);
    this._previouslyHandledError = error;
  }

  /**
   * Handles the common api error response
   * @param error Error to be handled
   */
  private _handleApiErrorResponse(error: McsApiErrorResponse | HttpErrorResponse): void {
    this._eventDispatcher.dispatch(McsEvent.stateNotificationShow,
      new McsStateNotification('error', error.message)
    );
  }

  /**
   * Handles the api error context response
   * @param error Error to be handled
   */
  private _handleApiErrorContext(error: McsApiErrorContext): void {
    let forbiddenAccessError = error?.details?.status === HttpStatusCode.Forbidden;
    if (error.requester === ApiErrorRequester.None || forbiddenAccessError) { return; }

    if (error.requester === ApiErrorRequester.Primary) {
      let errorHandlerService = this._injector.get(McsErrorHandlerService);
      errorHandlerService.redirectToErrorPage(error.details.status);
      return;
    }
    this._eventDispatcher.dispatch(McsEvent.stateNotificationShow,
      new McsStateNotification('error', error.message)
    );
  }

  /**
   * Returns true when the status code is unauthorized
   * @param status Status to be checked
   */
  private _isAuthorized(status: number): boolean {
    if (status !== HttpStatusCode.Unauthorized) { return true; }
    let authService = this._injector.get(McsAuthenticationService);
    authService.logIn();
    return false;
  }

  /**
   * Handles the exceptions errors
   * @param error Error to be handled
   */
  private _handleExceptionError(error: any): void {
    isDevMode() ?
      console.error(error) :
      RAVEN.captureException(error.originalError || error);
  }

  /**
   * Creates the httphandler table map
   */
  private _createHttpHandlerTable(): void {
    this._httpErrorHandlerMap.set(HttpStatusCode.Unauthorized, this._navigateToLoginPage.bind(this));
    this._httpErrorHandlerMap.set(HttpStatusCode.Forbidden, this._noopMethod.bind(this));
    this._httpErrorHandlerMap.set(HttpStatusCode.Unprocessable, this._noopMethod.bind(this));
  }

  /**
   * Navigate to login page
   */
  private _navigateToLoginPage(): void {
    let authService = this._injector.get(McsAuthenticationService);
    authService.logIn();
  }

  /**
   * Noop method for no-action calls
   */
  private _noopMethod(): void {
    // Do nothing
  }

  /**
   * Registers the events
   */
  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(
      McsEvent.userChange, this._onUserChanged.bind(this));
  }

  /**
   * Event that emits when user has been changed
   * @param user User emitted
   */
  private _onUserChanged(user: McsIdentity): void {
    if (isNullOrEmpty(user)) { return; }
    this._initializeRavenSettings(user);
  }

  /**
   * Initializes the raven sentry settings
   * @param user User to be registered on the sentry
   */
  private _initializeRavenSettings(user: McsIdentity): void {
    if (isDevMode()) { return; }
    RAVEN.setUserContext({
      email: user.email,
      id: user.userId,
      username: user.fullName
    });
    RAVEN.config(resolveEnvVar(McsEnvironmentVariables.SentryDns)).install();
  }
}
