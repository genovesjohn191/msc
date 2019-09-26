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
  McsApiErrorResponse
} from '@app/models';
import { McsApiClientDefinition } from './mcs-api-client.definition';
import { McsApiClientConfig } from './mcs-api-client.config';

/**
 * Macquarie Portal Api Client HTTP Service class
 * @ApiClientHttpService
 */
@Injectable()
export class McsApiClientHttpService {

  constructor(
    private _httpClient: HttpClient,
    @Optional() private _config: McsApiClientConfig
  ) { }

  /**
   * This method will get the record based on the given id or endpoint
   * @param apiRequest MCS Api request consist of endpoint/url, data, headers, params, etc...
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
   * @param apiRequest MCS Api request consist of endpoint/url, data, headers, params, etc...
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
   * @param apiRequest MCS Api request consist of endpoint/url, data, headers, params, etc...
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
   * @param apiRequest MCS Api request consist of endpoint/url, data, headers, params, etc...
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
   * @param apiRequest MCS Api request consist of endpoint/url, data, headers, params, etc...
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
    return throwError(deserializedError);
  }

  /**
   * Get Headers Value
   * @param optHeaders Optional Header
   */
  private _getHeaders(optHeaders?: Map<string, any>): any {
    let headers = new Map<string, any>();

    this._setDefaultHeaders(headers);
    this._setOptionalHeaders(headers, optHeaders);
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
   * @param headers Header Instance
   */
  private _setDefaultHeaders(headers: Map<string, any>) {
    if (!isNullOrEmpty(this._config.headers)) {
      this._config.headers.forEach((value, key) => {
        headers.set(key, value);
      });
      return;
    }
    headers.set(McsApiClientDefinition.HEADER_ACCEPT, 'application/json');
    headers.set(McsApiClientDefinition.HEADER_CONTENT_TYPE, 'application/json');
    headers.set(McsApiClientDefinition.HEADER_API_VERSION, '1.0');
  }

  /**
   * Set Optional Headers
   * @param headers Header Instance
   * @param optHeaders Optional Header
   */
  private _setOptionalHeaders(headers: Map<string, any>, optHeaders: Map<string, any>) {
    if (isNullOrEmpty(optHeaders)) { return; }
    optHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }
}
