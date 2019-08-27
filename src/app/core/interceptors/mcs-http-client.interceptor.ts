import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';
import { McsGuid } from '../factory/unique-generators/mcs-guid';

@Injectable()
export class McsHttpClientInterceptor implements HttpInterceptor {
  private _requestsMap = new Map<string, HttpRequest<any>>();

  constructor(private _eventDispatcher: EventBusDispatcherService) { }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let pendingRequestId = McsGuid.newGuid().toString();
    this._requestsMap.set(pendingRequestId, request);
    this._setLoadingStatus();

    return next.handle(request).pipe(
      finalize(() => {
        this._requestsMap.delete(pendingRequestId);
        this._setLoadingStatus();
      })
    );
  }

  /**
   * Sets the loading indicator based on the map content
   */
  private _setLoadingStatus(): void {
    let hasPendingRequest = this._requestsMap.size !== 0;

    hasPendingRequest ?
      this._eventDispatcher.dispatch(McsEvent.loaderShow) :
      this._eventDispatcher.dispatch(McsEvent.loaderHide);
  }
}
