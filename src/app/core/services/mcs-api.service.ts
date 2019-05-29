import {
  Injectable,
  Optional
} from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import {
  Observable,
  Subject,
  throwError
} from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  isUrlValid,
  isNullOrEmpty,
  convertMapToJsonObject,
  deserializeJsonToObject
} from '@app/utilities';
import {
  McsApiRequestParameter,
  McsCompany,
  McsApiErrorResponse
} from '@app/models';
import { CoreConfig } from '../core.config';
import { CoreDefinition } from '../core.definition';
import { McsCookieService } from '../services/mcs-cookie.service';

/**
 * Macquarie Portal Api Service class
 * @McsPortalApiService
 * @deprecated Use  the API-Client Instead,
 * @note before deleting this, make sure the api-client service is working
 * under notification-context getJobsByStatus and would not cause circular dependency issue
 * because as of now the cookie service of the core was called under api-client that
 * creates an issue of circular dependency
 */
@Injectable()
export class McsApiService {

  /**
   * Subscribe to this stream to get the
   * error response in case of unexpected error
   */
  private _errorResponseStream: Subject<HttpErrorResponse>;
  public get errorResponseStream(): Subject<HttpErrorResponse> {
    return this._errorResponseStream;
  }
  public set errorResponseStream(value: Subject<HttpErrorResponse>) {
    this._errorResponseStream = value;
  }

  constructor(
    private _httpClient: HttpClient,
    private _cookieService: McsCookieService,
    @Optional() private _config: CoreConfig
  ) {
    this._errorResponseStream = new Subject<Response | any>();
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
        headers: this._getHeaders(apiRequest.optionalHeaders),
        params: this._getParams(apiRequest.searchParameters),
        responseType: apiRequest.responseType,
        withCredentials: true
      })
      .pipe(catchError((error) => this._handleServerError(error)));
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
        headers: this._getHeaders(apiRequest.optionalHeaders),
        params: this._getParams(apiRequest.searchParameters),
        responseType: apiRequest.responseType,
        withCredentials: true
      })
      .pipe(catchError((error) => this._handleServerError(error)));
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
        headers: this._getHeaders(apiRequest.optionalHeaders),
        params: this._getParams(apiRequest.searchParameters),
        responseType: apiRequest.responseType,
        withCredentials: true
      })
      .pipe(catchError((error) => this._handleServerError(error)));
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
        headers: this._getHeaders(apiRequest.optionalHeaders),
        responseType: apiRequest.responseType,
        withCredentials: true
      })
      .pipe(catchError((error) => this._handleServerError(error)));
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
        headers: this._getHeaders(apiRequest.optionalHeaders),
        body: apiRequest.recordData,
        responseType: apiRequest.responseType,
        withCredentials: true
      })
      .pipe(catchError((error) => this._handleServerError(error)));
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
   * Handle server error
   * @param httpError HTTP Error Response
   */
  private _handleServerError(httpError: HttpErrorResponse) {
    let deserializedError = deserializeJsonToObject(McsApiErrorResponse, httpError.error);
    this._errorResponseStream.next(httpError);
    return throwError(deserializedError);
  }

  /**
   * Get Headers Value
   * @param {Headers} optHeaders Optional Header
   */
  private _getHeaders(optHeaders?: Map<string, any>): any {
    let headers = new Map<string, any>();

    this._setDefaultHeaders(headers);
    this._setAccountHeader(headers);
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
      .getEncryptedItem<McsCompany>(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    if (activeAccountId) {
      headers.set(CoreDefinition.HEADER_COMPANY_ID, activeAccountId);
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
