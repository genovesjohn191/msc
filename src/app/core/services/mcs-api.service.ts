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
import { isUrlValid } from '../functions/url.function';

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
   * @param {string} url URL Path or Endpoint
   * @param {Headers} optHeaders Optional Header
   * @param {URLSearchParams} parameters Optional Parameters
   */
  public get(
    url: string,
    optHeaders?: Headers,
    parameters?: URLSearchParams
  ): Observable<Response> {
    return this._http.get(
      this._getFullUrl(url),
      {
        headers: this._getHeaders(optHeaders),
        search: parameters
      })
      .catch(this._handleError);
  }

  /**
   * POST Http Request
   * @param {string} url URL Path or Endpoint
   * @param {any} data Object Data (not undefined/null)
   * @param {Headers} optHeaders Optional Header
   * @param {URLSearchParams} parameters Optional Parameters
   */
  public post(
    url: string,
    data: any,
    optHeaders?: Headers,
    parameters?: URLSearchParams
  ): Observable<Response> {
    return this._http.post(
      this._getFullUrl(url),
      data,
      {
        headers: this._getHeaders(optHeaders),
        search: parameters
      })
      .catch(this._handleError);
  }

  /**
   * PUT Http Request
   * @param {string} url URL Path or Endpoint
   * @param {any} data Object Data (not undefined/null)
   * @param {Headers} optHeaders Optional Header
   */
  public put(url: string, data: any, optHeaders?: Headers): Observable<Response> {
    return this._http.put(
      this._getFullUrl(url),
      data,
      {
        headers: this._getHeaders(optHeaders)
      })
      .catch(this._handleError);
  }

  /**
   * DELETE Http Request
   * @param {string} url URL Path or Endpoint
   * @param {Headers} optHeaders Optional Header
   */
  public delete(url: string, optHeaders?: Headers): Observable<Response> {
    return this._http.delete(
      this._getFullUrl(url),
      {
        headers: this._getHeaders(optHeaders)
      })
      .catch(this._handleError);
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
    if (!optHeaders) { return; };

    optHeaders.forEach((_values, _name, _headers) => {
      headers.set(_name, _values);
    });
  }

  /**
   * Handle Error Exception
   * @param {any} error Error Response
   */
  private _handleError(error: Response | any) {
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
   * Get full url
   * @param url Full Url / Endpoint
   */
  private _getFullUrl(url: string) {
    let fullUrl: string;
    let urlValidFlag: boolean;

    // Check valid URL
    urlValidFlag = isUrlValid(url);
    if (urlValidFlag) {
      fullUrl = url;
    } else {
      fullUrl = this._config.apiHost.concat(url);
    }
    // Return Full URL
    return fullUrl;
  }
}
