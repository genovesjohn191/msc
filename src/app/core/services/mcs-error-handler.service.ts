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
import { McsSnackBarService } from './mcs-snack-bar.service';
import { McsSnackBarConfig } from '../factory/snack-bar/mcs-snack-bar-config';

const DEFAULT_READONLY_MODE_BAR_DURATION = 10000;

@Injectable()
export class McsErrorHandlerService implements McsInitializer {
  private _destroySubject = new Subject<void>();

  constructor(
    private _router: Router,
    private _apiService: McsApiService,
    private _authService: McsAuthenticationService,
    private _snackbarService: McsSnackBarService
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
    if (!codeExist) { return; }

    switch (errorCode) {
      // Show readonly mode snackbar
      case McsHttpStatusCode.ReadOnlyMode:
        this._showReadonlyModeBar();
        break;

      default:
        // Redirect to error page
        this._router.navigate(['**'], {
          skipLocationChange: true,
          queryParams: {
            code: errorCode,
            preservedUrl: location.pathname
          }
        });
        break;
    }
  }

  /**
   * Shows the readonly mode snackbar
   */
  private _showReadonlyModeBar(): void {
    this._snackbarService.open(
      'Unable to proccess your request',
      {
        id: 'snackbar-read-only-mode',
        duration: DEFAULT_READONLY_MODE_BAR_DURATION,
        verticalPlacement: 'bottom',
        horizontalAlignment: 'center'
      } as McsSnackBarConfig
    );
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
