import { Injectable } from '@angular/core';
import {
  Router,
  NavigationEnd
} from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '../../utilities';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';
import { McsApiService } from './mcs-api.service';
import { McsHttpStatusCode } from '../enumerations/mcs-http-status-code.enum';
import { McsInitializer } from '../interfaces/mcs-initializer.interface';

@Injectable()
export class McsErrorHandlerService implements McsInitializer {
  private _destroySubject = new Subject<void>();

  constructor(
    private _apiService: McsApiService,
    private _authService: McsAuthenticationService,
    private _router: Router
  ) { }

  /**
   * Initialize all the error handlers to all the response
   */
  public initialize(): void {
    this._listenToUnauthorizedResponse();
    this._listenToRouterEvent();
  }

  /**
   * Destroys all the resources
   */
  public destroy(): void {
    unsubscribeSubject(this._destroySubject);
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
      case McsHttpStatusCode.Forbidden:
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
    this._apiService.errorResponseStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe((errorResponse) => {
        if (!errorResponse) { return; }
        switch (errorResponse.status) {
          case McsHttpStatusCode.Unauthorized:
            this._authService.logOut();
            break;
        }
      });
  }

  /**
   * Listen to router events and check if the token is not expired
   */
  private _listenToRouterEvent(): void {
    this._router.events
      .pipe(takeUntil(this._destroySubject))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          // This will check the token if its not expired.
          // If the token is expired it will redirect automatic to login page
          let authToken = this._authService.getAuthToken();
          if (isNullOrEmpty(authToken)) {
            this._authService.logOut();
          }
        }
      });
  }
}
