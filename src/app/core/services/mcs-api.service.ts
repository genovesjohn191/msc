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
import { isUrlValid } from '../../utilities';
import { McsApiRequestParameter } from '../models/request/mcs-api-request-parameter';
import { McsAuthService } from './mcs-auth.service';

/**
 * Macquarie Portal Api Service class
 * @McsPortalApiService
 */
@Injectable()
export class McsApiService {
  constructor(
    private _http: Http,
    private _authService: McsAuthService,
    @Optional() private _config: CoreConfig
  ) { }

  /**
   * This method will get the record based on the given id or endpoint
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
      .catch((error) => this.handleError(error));
  }

  /**
   * This method will insert a new record based on the given data
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
      .catch((error) => this.handleError(error));
  }

  /**
   * This method will update some of the fields of an existing record
   * based on the given data
   * @param {McsApiRequestParameter} apiRequest
   * MCS Api request consist of endpoint/url, data, headers, params, etc...
   */
  public patch(apiRequest: McsApiRequestParameter): Observable<Response> {
    return this._http.patch(
      this.getFullUrl(apiRequest.endPoint),
      apiRequest.recordData,
      {
        headers: this._getHeaders(apiRequest.optionalHeaders),
        search: apiRequest.searchParameters
      })
      .catch((error) => this.handleError(error));
  }

  /**
   * This method will replace the existing record based on the given data
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
      .catch((error) => this.handleError(error));
  }

  /**
   * The method will delete the corresponding record based on the give ID
   * @param {McsApiRequestParameter} apiRequest
   * MCS Api request consist of endpoint/url, data, headers, params, etc...
   */
  public delete(apiRequest: McsApiRequestParameter): Observable<Response> {
    return this._http.delete(
      this.getFullUrl(apiRequest.endPoint),
      {
        headers: this._getHeaders(apiRequest.optionalHeaders)
      })
      .catch((error) => this.handleError(error));
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
    // Navigate to login page when unauthorized
    if (error.status === 401 ) {
      this._authService.navigateToLoginPage();
      return;
    }
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }

    return Observable.throw(error);
  }

  /**
   * Get Headers Value
   * @param {Headers} optHeaders Optional Header
   */
  private _getHeaders(optHeaders?: Headers) {
    let headers = new Headers();

    this._setDefaultHeaders(headers);
    this._setAuthorizationHeader(headers);
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
  private _setAuthorizationHeader(headers: Headers) {
    let authToken = this._authService.authToken;
    if (authToken) {
      headers.set('Authorization', 'Bearer ' + authToken);
    }
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
