import {
  Headers,
  URLSearchParams,
  ResponseContentType
} from '@angular/http';

export class McsApiRequestParameter {
  /**
   * Endpoint / Full URL
   */
  private _endPoint: string;
  public get endPoint(): string {
    return this._endPoint;
  }
  public set endPoint(value: string) {
    this._endPoint = value;
  }

  /**
   * Record data of any type to be save during Put/Post
   */
  private _recordData: any;
  public get recordData(): any {
    return this._recordData;
  }
  public set recordData(value: any) {
    this._recordData = value;
  }

  /**
   * Optional header to be added aside from the default headers
   */
  private _optionalHeaders: Headers;
  public get optionalHeaders(): Headers {
    return this._optionalHeaders;
  }
  public set optionalHeaders(value: Headers) {
    this._optionalHeaders = value;
  }

  /**
   * Search parameters to be attached on the url
   */
  private _searchParameters: URLSearchParams;
  public get searchParameters(): URLSearchParams {
    return this._searchParameters;
  }
  public set searchParameters(value: URLSearchParams) {
    this._searchParameters = value;
  }

  /**
   * Response type parameters
   *
   * `@Note:` By default, this is JSON Type
   */
  private _responseType: ResponseContentType;
  public get responseType(): ResponseContentType {
    return this._responseType;
  }
  public set responseType(value: ResponseContentType) {
    this._responseType = value;
  }

  constructor() {
    this._endPoint = '';
    this._recordData = undefined;
    this._optionalHeaders = new Headers();
    this._searchParameters = new URLSearchParams();
    this._responseType = ResponseContentType.Json;
  }
}
