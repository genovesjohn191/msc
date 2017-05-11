import {
  Injectable,
  Optional
} from '@angular/core';
import {
  Http,
  Headers,
  Response,
  URLSearchParams
} from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { CoreConfig } from '../core.config';
import { isUrlValid } from '../functions/mcs-url.function';
import { McsApiRequestParameter } from './mcs-api-request-parameter';

/**
 * Macquarie Portal Api Service class
 * @McsPortalApiService
 */
@Injectable()
export class McsApiService {
  constructor(
    private _http: Http,
    @Optional() private _config: CoreConfig
  ) { }

  /**
   * GET Http Request
   * @param {McsApiRequestParameter} apiRequest
   * MCS Api request consist of endpoint/url, data, headers, params, etc...
   */
  public get(apiRequest: McsApiRequestParameter): Observable<Response> {
    return this._http.get(
      this.getFullUrl(apiRequest.endPoint),
      {
        headers: this._getHeaders(apiRequest.optionalHeaders),
        search: apiRequest.searchParameters
      })
      .catch(this.handleError);
  }

  /**
   * POST Http Request
   * @param {McsApiRequestParameter} apiRequest
   * MCS Api request consist of endpoint/url, data, headers, params, etc...
   */
  public post(apiRequest: McsApiRequestParameter): Observable<Response> {
    return this._http.post(
      this.getFullUrl(apiRequest.endPoint),
      apiRequest.recordData,
      {
        headers: this._getHeaders(apiRequest.optionalHeaders),
        search: apiRequest.searchParameters
      })
      .catch(this.handleError);
  }

  /**
   * PUT Http Request
   * @param {McsApiRequestParameter} apiRequest
   * MCS Api request consist of endpoint/url, data, headers, params, etc...
   */
  public put(apiRequest: McsApiRequestParameter): Observable<Response> {
    return this._http.put(
      this.getFullUrl(apiRequest.endPoint),
      apiRequest.recordData,
      {
        headers: this._getHeaders(apiRequest.optionalHeaders)
      })
      .catch(this.handleError);
  }

  /**
   * DELETE Http Request
   * @param {McsApiRequestParameter} apiRequest
   * MCS Api request consist of endpoint/url, data, headers, params, etc...
   */
  public delete(apiRequest: McsApiRequestParameter): Observable<Response> {
    return this._http.delete(
      this.getFullUrl(apiRequest.endPoint),
      {
        headers: this._getHeaders(apiRequest.optionalHeaders)
      })
      .catch(this.handleError);
  }

  /**
   * Get full url
   * @param url Full Url / Endpoint
   */
  public getFullUrl(url: string) {
    let fullUrl: string;
    let validUrl: boolean;

    // Check valid URL
    validUrl = isUrlValid(url);
    if (validUrl) {
      fullUrl = url;
    } else {
      fullUrl = this._config.apiHost.concat(url);
    }
    return fullUrl;
  }

  /**
   * Handle Error Exception
   * @param {any} error Error Response
   */
  public handleError(error: Response | any) {
    // TODO: Log the general Error here
    // e.g: Console Logs
    console.error('Error thrown from fusion api client service.');
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error('MFP Errors: ' + errMsg);
    return Observable.throw(error);
  }

  /**
   * Get Headers Value
   * @param {Headers} optHeaders Optional Header
   */
  private _getHeaders(optHeaders?: Headers) {
    let headers = new Headers();

    this._setDefaultHeaders(headers);
    this._setAuthorizationHeaders(headers);
    this._setOptionalHeaders(headers, optHeaders);

    return headers;
  }

  /**
   * Set Default Headers
   * @param {Headers} headers Header Instance
   */
  private _setDefaultHeaders(headers: Headers) {
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');
    headers.set('Api-Version', '1.0');
  }

  /**
   * Set setAuthorizationHeaders
   * @param {Headers} headers Header Instance
   */
  private _setAuthorizationHeaders(headers: Headers) {
    // TODO: Implement when authorization is under
  }

  /**
   * Set Optional Headers
   * @param {Headers} headers Header Instance
   * @param {Headers} optHeaders Optional Header
   */
  private _setOptionalHeaders(headers: Headers, optHeaders: Headers) {
    if (!optHeaders) { return; }

    optHeaders.forEach((_values, _name, _headers) => {
      headers.set(_name, _values);
    });
  }
}
