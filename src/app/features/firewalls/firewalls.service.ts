import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  finalize,
  map
} from 'rxjs/operators';
import {
  McsApiService,
  McsLoggerService
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsFirewall,
  McsFirewallPolicy
} from '@app/models';

@Injectable()
export class FirewallsService {

  constructor(
    private _mcsApiService: McsApiService,
    private _loggerService: McsLoggerService
  ) { }

  /**
   * Get Firewalls (MCS API Response)
   * @param page Page Number
   * @param perPage Count per page
   * @param searchKeyword Search filter
   */
  public getFirewalls(args?: {
    page?: number,
    perPage?: number,
    searchKeyword?: string
  }): Observable<McsApiSuccessResponse<McsFirewall[]>> {

    // Set default values if null
    if (isNullOrEmpty(args)) { args = {}; }

    let searchParams = new Map<string, any>();
    searchParams.set('page', args.page ? args.page.toString() : undefined);
    searchParams.set('per_page', args.perPage ? args.perPage.toString() : undefined);
    searchParams.set('search_keyword', args.searchKeyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/firewalls';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsFirewall[]>(McsFirewall, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Get firewall by ID (MCS API Response)
   * @param id Firewall identification
   */
  public getFirewall(id: any): Observable<McsApiSuccessResponse<McsFirewall>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/firewalls/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsFirewall>(McsFirewall, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }

  /**
   * Get all firewall policies (MCS API Response)
   * @param id Firewall identification
   * @param page Page index of the page to obtained
   * @param perPage Size of item per page
   * @param searchKeyword Keyword to be search during filtering
   */
  public getFirewallPolicies(
    id: any,
    args?: {
      page?: number,
      perPage?: number,
      searchKeyword?: string
    }): Observable<McsApiSuccessResponse<McsFirewallPolicy[]>> {
    let searchParams = new Map<string, any>();
    searchParams.set('page', args.page ? args.page.toString() : undefined);
    searchParams.set('per_page', args.perPage ? args.perPage.toString() : undefined);
    searchParams.set('search_keyword', args.searchKeyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/firewalls/${id}/policies`;
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .pipe(
        finalize(() => {
          this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
        }),
        map((response) => {
          // Deserialize json reponse
          let apiResponse = McsApiSuccessResponse
            .deserializeResponse<McsFirewallPolicy[]>(McsFirewallPolicy, response);

          this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
          this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
          this._loggerService.traceInfo(`converted response:`, apiResponse);
          return apiResponse;
        })
      );
  }
}
