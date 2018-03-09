import { Injectable } from '@angular/core';
import {
  Router,
  NavigationEnd
} from '@angular/router';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';
import { McsApiService } from './mcs-api.service';
import { McsHttpStatusCode } from '../enumerations/mcs-http-status-code.enum';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '../../utilities';

@Injectable()
export class McsErrorHandlerService {

  // Subscriptions
  private _unauthorizedResponseSubscription: any;
  private _routerEventSubscription: any;
  private _initialized: boolean = false;

  constructor(
    private _apiService: McsApiService,
    private _authService: McsAuthenticationService,
    private _router: Router
  ) { }

  /**
   * Initialize all the error handlers to all the response
   *
   * `@Note:` This should be call once inside the APP component
   */
  public initializeErrorHandlers(): void {
    if (!this._initialized) {
      this._listenToUnauthorizedResponse();
      this._listenToRouterEvent();
      this._initialized = true;
    }
  }

  /**
   * Disposes all the error handlers subscriptions
   *
   * `@Note:` This should be call once inside the APP component
   */
  public dispose(): void {
    unsubscribeSafely(this._unauthorizedResponseSubscription);
    unsubscribeSafely(this._routerEventSubscription);
  }

  /**
   * Handle the common error for each HTTP request
   * @param errorCode Error code of the corresponding request
   * @param handleCodes Error codes to be handled/considered
   */
  public handleHttpRedirectionError(errorCode: number, handleCodes?: number[]): void {
    let codeExist: boolean = true;

    // Check if the error code is considered to be handle
    if (!isNullOrEmpty(handleCodes)) {
      let handleCode = handleCodes.find((err) => {
        return err === errorCode;
      });
      codeExist = !!(!isNullOrEmpty(handleCode));
    }

    // Do nothing when the code is not exist
    if (!codeExist) { return; }

    switch (errorCode) {
      case McsHttpStatusCode.InternalServerError:
      case McsHttpStatusCode.NotFound:
      case McsHttpStatusCode.Unprocessable:
      case McsHttpStatusCode.ServiceUnavailable:
        this._router.navigate(['**'], {
          skipLocationChange: true,
          queryParams: { code: errorCode }
        });
        break;
      default:
      // Do nothing if its not HTTP request
        break;
    }
  }

  /**
   * Listen to error response from api
   */
  private _listenToUnauthorizedResponse(): void {
    this._unauthorizedResponseSubscription = this._apiService.errorResponseStream
      .subscribe((errorResponse) => {
        if (!errorResponse) { return; }
        switch (errorResponse.status) {
          case McsHttpStatusCode.Unauthorized:
            this._authService.logIn();
            break;
        }
      });
  }

  /**
   * Listen to router events and check if the token is not expired
   */
  private _listenToRouterEvent(): void {
    this._routerEventSubscription = this._router.events
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          // This will check the token if its not expired.
          // If the token is expired it will redirect automatic to login page
          let authToken = this._authService.getAuthToken();
          if (isNullOrEmpty(authToken)) {
            this._authService.logIn();
          }
        }
      });
  }
}
