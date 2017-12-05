import { Injectable } from '@angular/core';
import {
  Router,
  NavigationEnd
} from '@angular/router';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';
import { McsApiService } from './mcs-api.service';
import { McsHttpStatusCode } from '../enumerations/mcs-http-status-code.enum';
import { isNullOrEmpty } from '../../utilities';

@Injectable()
export class McsErrorHandlerService {

  // Subscriptions
  private _apiErrorResponseSubscription: any;
  private _routerEventSubscription: any;

  constructor(
    private _apiService: McsApiService,
    private _authService: McsAuthenticationService,
    private _router: Router
  ) { }

  /**
   * Initialize all the error handlers to all the response
   */
  public initializeErrorHandlers(): void {
    this._listenToErrorApiResponse();
    this._listenToRouterEvent();
  }

  /**
   * Disposes all the error handlers subscriptions
   */
  public dispose(): void {
    if (!isNullOrEmpty(this._apiErrorResponseSubscription)) {
      this._apiErrorResponseSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this._routerEventSubscription)) {
      this._routerEventSubscription.unsubscribe();
    }
  }

  /**
   * Listen to error response from api
   */
  private _listenToErrorApiResponse(): void {
    this._apiErrorResponseSubscription = this._apiService.errorResponseStream
      .subscribe((errorResponse) => {
        if (!errorResponse) { return; }

        switch (errorResponse.status) {
          case McsHttpStatusCode.Unauthorized:
            this._authService.logIn();
            break;

          case McsHttpStatusCode.NotFound:
            this._router.navigate(['**'], { skipLocationChange: true });
            break;

          case McsHttpStatusCode.Forbidden:
            // TODO: Confirm if modal here or alert should be displayed
            break;

          case McsHttpStatusCode.InternalServerError:
          case McsHttpStatusCode.ServiceUnavailable:
          case McsHttpStatusCode.BadRequest:
          case McsHttpStatusCode.Success:
          default:
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
          // If the token is expired it will redirect automatic to logout page
          let authToken = this._authService.getAuthToken();
          if (isNullOrEmpty(authToken)) {
            this._authService.logIn();
          }
        }
      });
  }
}
