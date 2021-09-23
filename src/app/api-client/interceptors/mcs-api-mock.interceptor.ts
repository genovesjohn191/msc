import {
  of,
  Observable
} from 'rxjs';
import {
  delay,
  dematerialize,
  materialize,
  mergeMap
} from 'rxjs/operators';

import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IJsonObject } from '@app/utilities';

import { McsApiClientConfig } from '../mcs-api-client.config';

@Injectable({ providedIn: 'root' })
export class McsApiMockInterceptor implements HttpInterceptor {

  private _jsonObject: IJsonObject;

  constructor(private _coreConfig: McsApiClientConfig) {
    this._initializeJsonObject();
  }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let realApiObserver = next.handle(request);
    let mockApiObserver = of(null)
      .pipe(mergeMap(() => this.handleApiRoute(request, next)))
      .pipe(materialize())
      .pipe(delay(500))
      .pipe(dematerialize());

    return this._coreConfig.enableMockApi ? mockApiObserver : realApiObserver;
  }

  public handleApiRoute(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    switch (true) {
      case request.url.endsWith('/billing') && request.method === 'GET':
        return this._mapSuccessApi(this._jsonObject.apiResponse);
      default:
        return next.handle(request);
    }
  }

  private _mapSuccessApi<T>(mockData: T) {
    return of(new HttpResponse({ status: 200, body: mockData }));
  }

  private _initializeJsonObject(): void {
    if (!this._coreConfig.enableMockApi) { return; }
    this._jsonObject = require('./mcs-api-mock.json');
  }
}
