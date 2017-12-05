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
   *
   * `@Note:` We need to this as a map since angular created the
   * HttpHeaders as immutable
   */
  private _optionalHeaders: Map<string, any>;
  public get optionalHeaders(): Map<string, any> {
    return this._optionalHeaders;
  }
  public set optionalHeaders(value: Map<string, any>) {
    this._optionalHeaders = value;
  }

  /**
   * Search parameters to be attached on the url
   *
   * `@Note:` We need to this as a map since angular created the
   * HttpHeaders as immutable
   */
  private _searchParameters: Map<string, any>;
  public get searchParameters(): Map<string, any> {
    return this._searchParameters;
  }
  public set searchParameters(value: Map<string, any>) {
    this._searchParameters = value;
  }

  /**
   * Response type parameters
   *
   * `@Note:` By default, this is TEXT Type
   */
  private _responseType: any;
  public get responseType(): any {
    return this._responseType;
  }
  public set responseType(value: any) {
    this._responseType = value;
  }

  /**
   * This will notify the global error handler when set to true,
   * otherwise false
   *
   * `@Note:` By default, this is TRUE
   */
  private _notifyGlobalErrorHandler: boolean;
  public get notifyGlobalErrorHandler(): boolean {
    return this._notifyGlobalErrorHandler;
  }
  public set notifyGlobalErrorHandler(value: boolean) {
    this._notifyGlobalErrorHandler = value;
  }

  constructor() {
    this._endPoint = '';
    this._recordData = undefined;
    this._optionalHeaders = new Map<string, any>();
    this._searchParameters = new Map<string, any>();
    this._responseType = 'text';
    this._notifyGlobalErrorHandler = true;
  }
}
