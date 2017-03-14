import {
  Injectable,
  Optional
} from '@angular/core';
import {
  Http,
  Headers,
  Response
} from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { CoreConfig } from '../core.config';

/**
 * Macquarie Portal Api Service class
 * @McsPortalApiService
 */
@Injectable()
export class McsPortalApiService {
  constructor(
    private _http: Http,
    @Optional() private _config: CoreConfig
  ) { }

  /**
   * GET Http Request
   * @param {string} endpoint URL Path endpoint
   * @param {Headers} optHeaders Optional Header
   */
  public get(endpoint: string, optHeaders?: Headers): Observable<Response> {
    return this._http.get(
      `${this._config.apiHost + endpoint}`,
      { headers: this._getHeaders(optHeaders) })
      .catch(this._handleError);
  }

  /**
   * POST Http Request
   * @param {string} endpoint URL Path endpoint
   * @param {any} data Object Data (not undefined/null)
   * @param {Headers} optHeaders Optional Header
   */
  public post(endpoint: string, data: any, optHeaders?: Headers): Observable<Response> {
    return this._http.post(
      `${this._config.apiHost + endpoint}`,
      data,
      { headers: this._getHeaders(optHeaders) })
      .catch(this._handleError);
  }

  /**
   * PUT Http Request
   * @param {string} endpoint URL Path endpoint
   * @param {any} data Object Data (not undefined/null)
   * @param {Headers} optHeaders Optional Header
   */
  public put(endpoint: string, data: any, optHeaders?: Headers): Observable<Response> {
    return this._http.put(
      `${this._config.apiHost + endpoint}`,
      data,
      { headers: this._getHeaders(optHeaders) })
      .catch(this._handleError);
  }

  /**
   * DELETE Http Request
   * @param {string} endpoint URL Path endpoint
   * @param {Headers} optHeaders Optional Header
   */
  public delete(endpoint: string, optHeaders?: Headers): Observable<Response> {
    return this._http.delete(
      `${this._config.apiHost + endpoint}`,
      { headers: this._getHeaders(optHeaders) })
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
    // TODO: Refactor error handling
    // In a real world app, we might use a remote logging infrastructure
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
    return Observable.throw(errMsg);
  }
}
