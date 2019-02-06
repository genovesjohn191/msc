import { Injectable } from '@angular/core';
import {
  Router
} from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  unsubscribeSubject,
  McsInitializer
} from '@app/utilities';
import { HttpStatusCode } from '@app/models';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';
import { McsApiService } from './mcs-api.service';

@Injectable()
export class McsErrorHandlerService implements McsInitializer {
  private _destroySubject = new Subject<void>();

  constructor(
    private _router: Router,
    private _apiService: McsApiService,
    private _authService: McsAuthenticationService
  ) { }

  /**
   * Initialize all the error handlers to all the response
   */
  public initialize(): void {
    this._listenToApiResponse();
  }

  /**
   * Destroys all the resources
   */
  public destroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Redirects to error page based on the error code
   * @param errorCode Error code of the corresponding request
   */
  public redirectToErrorPage(errorCode: number): void {
    this._router.navigate(['**'], {
      skipLocationChange: true,
      queryParams: {
        code: errorCode,
        preservedUrl: location.pathname
      }
    });
  }

  /**
   * Listen to each api error response
   */
  private _listenToApiResponse(): void {
    this._apiService.errorResponseStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe((errorResponse) => {
        if (!errorResponse) { return; }
        switch (errorResponse.status) {
          case HttpStatusCode.ReadOnlyMode:
            this.redirectToErrorPage(HttpStatusCode.ReadOnlyMode);
            break;

          case HttpStatusCode.Unauthorized:
            this._authService.logIn();
            break;
        }
      });
  }
}
