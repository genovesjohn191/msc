import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
// Services Declarations
import {
  McsApiService,
  McsApiRequestParameter,
  McsApiSuccessResponse,
  McsApiErrorResponse
} from '../../../core/';
// Models
import {
  Firewall,
  FirewallDeviceStatus,
  FirewallConfigurationStatus,
  FirewallConnectionStatus,
  FirewallPolicy,
  FirewallPolicyAction,
  FirewallPolicyNat
} from './models';

@Injectable()
export class FirewallsService {

  constructor(private _mcsApiService: McsApiService) { }

  /**
   * Get Firewalls (MCS API Response)
   */
  public getFirewalls(
    page?: number,
    perPage?: number,
    searchKeyword?: string): Observable<McsApiSuccessResponse<Firewall[]>> {
    let searchParams: URLSearchParams = new URLSearchParams();
    searchParams.set('page', page ? page.toString() : undefined);
    searchParams.set('per_page', perPage ? perPage.toString() : undefined);
    searchParams.set('search_keyword', searchKeyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/firewalls';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let firewallsResponse: McsApiSuccessResponse<Firewall[]>;
        firewallsResponse = JSON.parse(response.text(),
          this._convertProperty) as McsApiSuccessResponse<Firewall[]>;

        return firewallsResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Get firewall by ID (MCS API Response)
   * @param id Firewall identification
   */
  public getFirewall(id: any): Observable<McsApiSuccessResponse<Firewall>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/firewalls/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let firewallResponse: McsApiSuccessResponse<Firewall>;
        firewallResponse = JSON.parse(response.text(),
          this._convertProperty) as McsApiSuccessResponse<Firewall>;

        return firewallResponse;
      })
      .catch(this._handleServerError);
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
    page?: number,
    perPage?: number,
    searchKeyword?: string): Observable<McsApiSuccessResponse<FirewallPolicy[]>> {
    let searchParams: URLSearchParams = new URLSearchParams();
    searchParams.set('page', page ? page.toString() : undefined);
    searchParams.set('per_page', perPage ? perPage.toString() : undefined);
    searchParams.set('search_keyword', searchKeyword ? searchKeyword : undefined);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/firewalls/${id}/policies`;
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let firewallPoliciesResponse: McsApiSuccessResponse<FirewallPolicy[]>;
        firewallPoliciesResponse = JSON.parse(response.text(),
          this._convertProperty) as McsApiSuccessResponse<FirewallPolicy[]>;

        return firewallPoliciesResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Handle Error Exception
   * @param {any} error Error Response
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

  private _convertProperty(key, value): any {

    switch (key) {
      // Convert firewall deviceStatus to enumeration
      case 'deviceStatus':
        value = FirewallDeviceStatus[value];
        break;

      // Convert firewall configurationStatus to enumeration
      case 'configurationStatus':
        value = FirewallConfigurationStatus[value];
        break;

      // Convert firewall policy action to enumeration
      case 'connectionStatus':
        value = FirewallConnectionStatus[value];
        break;

      // Convert firewall policy action to enumeration
      case 'haMode':
        value = FirewallDeviceStatus[value];
        break;

      // Convert firewall policy action to enumeration
      case 'action':
        value = FirewallPolicyAction[value];
        break;

      // Convert firewall policy nat to enumeration
      case 'nat':
        value = FirewallPolicyNat[value];
        break;

      default:
        // do nothing
        break;
    }

    return value;
  }
}
