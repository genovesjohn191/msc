import { Subject } from 'rxjs';

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  unsubscribeSafely,
  McsDisposable
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
    setTimeout(() => {
      this._router.navigate(['**'], {
        skipLocationChange: true,
        queryParams: {
          code: errorCode,
          preservedUrl: location.pathname
        }
      });
    }, 500);
  }
}
