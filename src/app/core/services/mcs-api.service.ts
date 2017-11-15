import {
  Injectable,
  Optional
} from '@angular/core';
import {
  Http,
  Headers,
  Response
} from '@angular/http';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import { CookieService } from 'ngx-cookie';
import { CoreConfig } from '../core.config';
import { CoreDefinition } from '../core.definition';
import {
  isUrlValid,
  resolveEnvVar
} from '../../utilities';
import { McsApiRequestParameter } from '../models/request/mcs-api-request-parameter';

/**
 * Macquarie Portal Api Service class
 * @McsPortalApiService
 */
@Injectable()
export class McsApiService {

  /**
   * Subscribe to this stream to get the
   * error response in case of unexpected error
   */
  private _errorResponseStream: Subject<Response | any>;
  public get errorResponseStream(): Subject<Response | any> {
    return this._errorResponseStream;
  }
  public set errorResponseStream(value: Subject<Response | any>) {
    this._errorResponseStream = value;
  }

  private _jwtCookieName: string;

  constructor(
    private _http: Http,
    private _cookieService: CookieService,
    @Optional() private _config: CoreConfig
  ) {
    this._errorResponseStream = new Subject<Response | any>();
    this._jwtCookieName = resolveEnvVar('JWT_COOKIE_NAME', CoreDefinition.COOKIE_AUTH_TOKEN);
  }

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
        search: apiRequest.searchParameters,
        responseType: apiRequest.responseType
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
        search: apiRequest.searchParameters,
        responseType: apiRequest.responseType
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
        search: apiRequest.searchParameters,
        responseType: apiRequest.responseType
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
        headers: this._getHeaders(apiRequest.optionalHeaders),
        responseType: apiRequest.responseType
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
        headers: this._getHeaders(apiRequest.optionalHeaders),
        body: apiRequest.recordData,
        responseType: apiRequest.responseType
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
    // Notify all the subscribers for the error
    this._errorResponseStream.next(error);

    // TODO: Log the general Error here
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
    this._setAccountHeader(headers);
    this._setAuthorizationHeader(headers);
    this._setOptionalHeaders(headers, optHeaders);

    return headers;
  }

  /**
   * Set Default Headers
   * @param {Headers} headers Header Instance
   */
  private _setDefaultHeaders(headers: Headers) {
    headers.set(CoreDefinition.HEADER_ACCEPT, 'application/json');
    headers.set(CoreDefinition.HEADER_CONTENT_TYPE, 'application/json');
    headers.set(CoreDefinition.HEADER_API_VERSION, '1.0');
  }

  /**
   * Set account header based on active account
   *
   * `@Note:` When active account is default, the cookie content for active account is undefined
   * @param headers Header Instance
   */
  private _setAccountHeader(headers: Headers) {
    let activeAccount = this._cookieService.get(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    if (activeAccount) {
      headers.set(CoreDefinition.HEADER_COMPANY_ID, JSON.parse(activeAccount).id);
    }
  }

  /**
   * Set setAuthorizationHeaders
   *
   * `@Note:` This will automatically navigate to login page
   * when cookie is empty because the API will throw error if
   * no token provided
   * @param {Headers} headers Header Instance
   */
  private _setAuthorizationHeader(headers: Headers) {
    let authToken = this._cookieService.get(this._jwtCookieName);
    if (authToken) {
      headers.set(CoreDefinition.HEADER_AUTHORIZATION,
        `${CoreDefinition.HEADER_BEARER} ${authToken}`);
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
