import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
  Observable,
  throwError
} from 'rxjs';
import { catchError } from 'rxjs/operators';

import { isNullOrEmpty } from '@app/utilities';

@Injectable()
export class McsAutomationInterceptor implements HttpInterceptor {

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let correlationIds = error.headers.get('correlation-ids');
        if (!isNullOrEmpty(correlationIds)) {
          sessionStorage.setItem('correlation-ids', correlationIds);
        }
        return throwError(error);
      })
    )
  }
}
