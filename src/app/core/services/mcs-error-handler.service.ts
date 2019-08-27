import { Injectable } from '@angular/core';
import {
  Router
} from '@angular/router';
import { Subject } from 'rxjs';
import {
  McsDisposable,
  unsubscribeSafely
} from '@app/utilities';
import { LogClass } from '@peerlancers/ngx-logger';

@Injectable()
@LogClass()
export class McsErrorHandlerService implements McsDisposable {
  private _destroySubject = new Subject<void>();

  constructor(private _router: Router) { }

  /**
   * Destroys all the resources
   */
  public dispose(): void {
    unsubscribeSafely(this._destroySubject);
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
}
