import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  McsApiCompany,
  McsApiService,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsApiErrorResponse,
  McsCompanyStatus,
  McsLoggerService
} from '../core';
import {
  convertJsonStringToObject,
  reviverParser,
  isNullOrEmpty
} from '../utilities';

@Injectable()
export class CoreLayoutService {

  constructor(
    private _mcsApiService: McsApiService,
    private _loggerService: McsLoggerService
  ) { }

  /**
   * Get all the companies from the API
   * @param page Page index of the page to obtained
   * @param perPage Size of item per page
   * @param searchKeyword Keyword to be search during filtering
   */
  public getCompanies(args?: {
    page?: number,
    perPage?: number,
    searchKeyword?: string
  }): Observable<McsApiSuccessResponse<McsApiCompany[]>> {

    // Set default values if null
    if (isNullOrEmpty(args)) { args = {}; }

    let searchParams = new Map<string, any>();
    searchParams.set('page', args.page ? args.page.toString() : undefined);
    searchParams.set('per_page', args.perPage ? args.perPage.toString() : undefined);
    searchParams.set('search_keyword', args.searchKeyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/companies';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .finally(() => {
        this._loggerService.traceInfo(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<McsApiCompany[]>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<McsApiCompany[]>>(
          response,
          this._responseReviverParser
        );

        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, apiResponse);
        return apiResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Get company by ID (MCS API Response)
   * @param id Company identification
   */
  public getCompany(id: any): Observable<McsApiSuccessResponse<McsApiCompany>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/companies/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .finally(() => {
        this._loggerService.traceInfo(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<McsApiCompany>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<McsApiCompany>>(
          response,
          this._responseReviverParser
        );

        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, apiResponse);
        return apiResponse;
      });
  }

  /**
   * This will handle all error that correspond to HTTP request
   * @param error Error obtained
   */
  private _handleServerError(error: Response | any) {
    let mcsApiErrorResponse: McsApiErrorResponse;

    if (error instanceof Response) {
      mcsApiErrorResponse = new McsApiErrorResponse();
      mcsApiErrorResponse.message = error.statusText;
      mcsApiErrorResponse.status = error.status;
    } else {
      mcsApiErrorResponse = error;
    }
    return Observable.throw(mcsApiErrorResponse);
  }

  /**
   * Property conversion reviver in JSON format
   * @param key Key of the object
   * @param value Value of the object
   */
  private _responseReviverParser(key, value): any {
    switch (key) {
      case 'status':
        value = McsCompanyStatus[value];
        break;

      default:
        value = reviverParser(key, value);
        break;
    }
    return value;
  }
}
