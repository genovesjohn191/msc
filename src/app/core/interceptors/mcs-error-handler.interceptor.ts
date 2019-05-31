import {
  Injectable,
  ErrorHandler,
  isDevMode,
  Injector
} from '@angular/core';
import {
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import {
  resolveEnvVar,
  isNullOrEmpty
} from '@app/utilities';
import { EventBusDispatcherService } from '@app/event-bus';
import {
  McsIdentity,
  McsApiErrorResponse,
  HttpStatusCode
} from '@app/models';
import { McsEvent } from '@app/event-manager';
import { McsErrorHandlerService } from '../services/mcs-error-handler.service';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';

const RAVEN = require('raven-js');

@Injectable()
export class McsErrorHandlerInterceptor implements ErrorHandler {
  private _httpErrorHandlerMap = new Map<HttpStatusCode, () => void>();

  constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _injector: Injector
  ) {
    this._registerEvents();
    this._createHttpHandlerTable();
  }

  /**
   * Handles the error for HTTP calls and exceptions
   * @param error Error to be handled
   */
  public handleError(error: HttpErrorResponse | McsApiErrorResponse | any): void {
    let isHttpResponse = (error instanceof HttpResponse) ||
      (error instanceof HttpErrorResponse) ||
      (error instanceof McsApiErrorResponse);

    isHttpResponse ?
      this._handlerHttpError(error) :
      this._handleExceptionError(error);
  }

  /**
   * Handles the http response error
   * @param error Error to be handled
   */
  private _handlerHttpError(error: McsApiErrorResponse | HttpErrorResponse): void {
    let errorHandlerFuncPointer = this._httpErrorHandlerMap.get(error.status);
    if (isNullOrEmpty(errorHandlerFuncPointer)) {
      this._injector.get(McsErrorHandlerService).redirectToErrorPage(error.status);
      return;
    }
    errorHandlerFuncPointer();
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
    RAVEN.config(resolveEnvVar('SENTRY_DSN', SENTRY_DSN)).install();
  }
}
