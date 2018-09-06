import { Injectable } from '@angular/core';
import {
  Router
} from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '../../utilities';
import { McsAuthenticationService } from '../authentication/mcs-authentication.service';
import { McsHttpStatusCode } from '../enumerations/mcs-http-status-code.enum';
import { McsInitializer } from '../interfaces/mcs-initializer.interface';
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

    // Redirect to error page
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
          case McsHttpStatusCode.ReadOnlyMode:
            this.handleHttpRedirectionError(McsHttpStatusCode.ReadOnlyMode);
            break;

          case McsHttpStatusCode.Unauthorized:
            this._authService.logIn();
            break;
        }
      });
  }
}
