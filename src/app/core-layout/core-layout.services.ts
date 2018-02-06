import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import {
  McsApiCompany,
  McsApiService,
  McsApiSuccessResponse,
  McsApiRequestParameter,
  McsApiErrorResponse,
  McsCompanyStatus
} from '../core';
import {
  convertJsonStringToObject,
  reviverParser,
  isNullOrEmpty
} from '../utilities';

@Injectable()
export class CoreLayoutService {

  constructor(private _mcsApiService: McsApiService) { }

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
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<McsApiCompany[]>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<McsApiCompany[]>>(
          response,
          this._convertProperty
        );

        return apiResponse;
      })
      .catch(this._handleServerError);
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
  private _convertProperty(key, value): any {
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
