import {
  Injectable,
  Optional
} from '@angular/core';
import {
  HttpClient,
  HttpResponse
} from '@angular/common/http';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import { CoreConfig } from '../core.config';
import { CoreDefinition } from '../core.definition';
import {
  isUrlValid,
  isNullOrEmpty,
  resolveEnvVar,
  convertMapToJsonObject
} from '../../utilities';
import { McsApiRequestParameter } from '../models/request/mcs-api-request-parameter';
import { McsApiCompany } from '../models/response/mcs-api-company';
import { McsCookieService } from './mcs-cookie.service';
import { McsHttpMethod } from '../enumerations/mcs-http-method.enum';

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
  private _errorResponseStream: Subject<HttpResponse<any> | any>;
  public get errorResponseStream(): Subject<HttpResponse<any> | any> {
    return this._errorResponseStream;
  }
  public set errorResponseStream(value: Subject<HttpResponse<any> | any>) {
    this._errorResponseStream = value;
  }

  private _jwtCookieName: string;
  private _jwtRefreshTokenCookieName: string;

  constructor(
    private _httpClient: HttpClient,
    private _cookieService: McsCookieService,
    @Optional() private _config: CoreConfig
  ) {
    this._errorResponseStream = new Subject<Response | any>();
    this._jwtCookieName = resolveEnvVar('JWT_COOKIE_NAME', CoreDefinition.COOKIE_AUTH_TOKEN);
    this._jwtRefreshTokenCookieName =
      resolveEnvVar('JWT_REFRESH_TOKEN_COOKIE_NAME', CoreDefinition.COOKIE_REFRESH_TOKEN);
  }

  /**
   * This method will get the record based on the given id or endpoint
   * @param {McsApiRequestParameter} apiRequest
   * MCS Api request consist of endpoint/url, data, headers, params, etc...
   */
  public get(apiRequest: McsApiRequestParameter): Observable<any> {
    return this._httpClient.get(
      this.getFullUrl(apiRequest.endPoint),
      {
        headers: this._getHeaders(McsHttpMethod.Get, apiRequest.optionalHeaders),
        params: this._getParams(apiRequest.searchParameters),
        responseType: apiRequest.responseType
      })
      .catch((error) => this.handleServerError(error));
  }

  /**
   * This method will insert a new record based on the given data
   * @param {McsApiRequestParameter} apiRequest
   * MCS Api request consist of endpoint/url, data, headers, params, etc...
   */
  public post(apiRequest: McsApiRequestParameter): Observable<any> {
    return this._httpClient.post(
      this.getFullUrl(apiRequest.endPoint),
      apiRequest.recordData,
      {
        headers: this._getHeaders(McsHttpMethod.Post, apiRequest.optionalHeaders),
        params: this._getParams(apiRequest.searchParameters),
        responseType: apiRequest.responseType
      })
      .catch((error) => this.handleServerError(error));
  }

  /**
   * This method will update some of the fields of an existing record
   * based on the given data
   * @param {McsApiRequestParameter} apiRequest
   * MCS Api request consist of endpoint/url, data, headers, params, etc...
   */
  public patch(apiRequest: McsApiRequestParameter): Observable<any> {
    return this._httpClient.patch(
      this.getFullUrl(apiRequest.endPoint),
      apiRequest.recordData,
      {
        headers: this._getHeaders(McsHttpMethod.Patch, apiRequest.optionalHeaders),
        params: this._getParams(apiRequest.searchParameters),
        responseType: apiRequest.responseType
      })
      .catch((error) => this.handleServerError(error));
  }

  /**
   * This method will replace the existing record based on the given data
   * @param {McsApiRequestParameter} apiRequest
   * MCS Api request consist of endpoint/url, data, headers, params, etc...
   */
  public put(apiRequest: McsApiRequestParameter): Observable<any> {
    return this._httpClient.put(
      this.getFullUrl(apiRequest.endPoint),
      apiRequest.recordData,
      {
        headers: this._getHeaders(McsHttpMethod.Put, apiRequest.optionalHeaders),
        responseType: apiRequest.responseType
      })
      .catch((error) => this.handleServerError(error));
  }

  /**
   * The method will delete the corresponding record based on the give ID
   * @param {McsApiRequestParameter} apiRequest
   * MCS Api request consist of endpoint/url, data, headers, params, etc...
   */
  public delete(apiRequest: McsApiRequestParameter): Observable<any> {
    return this._httpClient.request(
      'DELETE',
      this.getFullUrl(apiRequest.endPoint),
      {
        headers: this._getHeaders(McsHttpMethod.Delete, apiRequest.optionalHeaders),
        body: apiRequest.recordData,
        responseType: apiRequest.responseType
      })
      .catch((error) => this.handleServerError(error));
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
  public handleServerError(error: HttpResponse<any> | any) {
    // Rethrow to notify outside subscribers that an error occured
    this._errorResponseStream.next(error);
    return Observable.throw(error);
  }

  /**
   * Get Headers Value
   * @param {Headers} optHeaders Optional Header
   */
  private _getHeaders(httpMethod: McsHttpMethod, optHeaders?: Map<string, any>): any {
    let headers = new Map<string, any>();

    this._setDefaultHeaders(headers);
    this._setAccountHeader(headers);
    this._setAuthorizationHeader(headers);

    if (httpMethod !== McsHttpMethod.Get) {
      this._setRefreshTokenHeader(optHeaders);
    }

    this._setOptionalHeaders(headers, optHeaders);

    // Return the converted headers
    return convertMapToJsonObject(headers);
  }

  /**
   * Returns the parameters based on HttpParams
   * @param params Param map to be converted
   */
  private _getParams(params: Map<string, any>): any {
    if (isNullOrEmpty(params)) { return undefined; }
    return convertMapToJsonObject(params);
  }

  /**
   * Set Default Headers
   * @param {Headers} headers Header Instance
   */
  private _setDefaultHeaders(headers: Map<string, any>) {
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
  private _setAccountHeader(headers: Map<string, any>) {
    let activeAccountId = this._cookieService
      .getEncryptedItem<McsApiCompany>(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    if (activeAccountId) {
      headers.set(CoreDefinition.HEADER_COMPANY_ID, activeAccountId);
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
  private _setAuthorizationHeader(headers: Map<string, any>) {
    let authToken = this._cookieService.getItem(this._jwtCookieName);

    if (authToken) {
      headers.set(CoreDefinition.HEADER_AUTHORIZATION,
        `${CoreDefinition.HEADER_BEARER} ${authToken}`);
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
  private _setRefreshTokenHeader(headers: Map<string, any>) {
    let refreshToken = this._cookieService.getItem(this._jwtRefreshTokenCookieName);

    if (refreshToken) {
      headers.set(CoreDefinition.HEADER_REFRESH_TOKEN, refreshToken);
    }
  }

  /**
   * Set Optional Headers
   * @param {Headers} headers Header Instance
   * @param {Headers} optHeaders Optional Header
   */
  private _setOptionalHeaders(headers: Map<string, any>, optHeaders: Map<string, any>) {
    if (isNullOrEmpty(optHeaders)) { return; }
    optHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }
}
