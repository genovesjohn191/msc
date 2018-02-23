import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
// Services Declarations
import {
  McsApiService,
  McsApiRequestParameter,
  McsApiSuccessResponse,
  CoreDefinition,
  McsLoggerService
} from '../../../core/';
import { isNullOrEmpty } from '../../../utilities';
// Models
import {
  Firewall,
  FirewallDeviceStatus,
  FirewallConfigurationStatus,
  FirewallConnectionStatus,
  FirewallPolicy
} from './models';

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
  }): Observable<McsApiSuccessResponse<Firewall[]>> {

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
      .finally(() => {
        this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        // Deserialize json reponse
        let apiResponse = McsApiSuccessResponse
          .deserializeResponse<Firewall[]>(Firewall, response);

        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, apiResponse);
        return apiResponse;
      });
  }

  /**
   * Get firewall by ID (MCS API Response)
   * @param id Firewall identification
   */
  public getFirewall(id: any): Observable<McsApiSuccessResponse<Firewall>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/firewalls/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .finally(() => {
        this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        // Deserialize json reponse
        let apiResponse = McsApiSuccessResponse
          .deserializeResponse<Firewall>(Firewall, response);

        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, apiResponse);
        return apiResponse;
      });
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
    let searchParams = new Map<string, any>();
    searchParams.set('page', page ? page.toString() : undefined);
    searchParams.set('per_page', perPage ? perPage.toString() : undefined);
    searchParams.set('search_keyword', searchKeyword ? searchKeyword : undefined);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/firewalls/${id}/policies`;
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .finally(() => {
        this._loggerService.traceEnd(`"${mcsApiRequestParameter.endPoint}" request ended.`);
      })
      .map((response) => {
        // Deserialize json reponse
        let apiResponse = McsApiSuccessResponse
          .deserializeResponse<FirewallPolicy[]>(FirewallPolicy, response);

        this._loggerService.traceStart(mcsApiRequestParameter.endPoint);
        this._loggerService.traceInfo(`request:`, mcsApiRequestParameter);
        this._loggerService.traceInfo(`converted response:`, apiResponse);
        return apiResponse;
      });
  }

  /**
   * This will return the connection status icon key
   * based on the provided firewall connection status
   *
   * @param status Firewall connection status
   */
  public getFirewallConnectionStatusIconKey(
    status: FirewallConnectionStatus): string {

    let iconKey = '';

    switch (status) {
      case FirewallConnectionStatus.Up:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case FirewallConnectionStatus.Down:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case FirewallConnectionStatus.Unknown:
      default:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;
    }

    return iconKey;
  }

  /**
   * This will return the configuration status icon key
   * based on the provided firewall configuration status
   *
   * @param status Firewall configuration status
   */
  public getFirewallConfigurationStatusIconKey(
    status: FirewallConfigurationStatus): string {

    let iconKey = '';

    switch (status) {
      case FirewallConfigurationStatus.InSync:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case FirewallConfigurationStatus.OutOfSync:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case FirewallConfigurationStatus.Unknown:
      default:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;
    }

    return iconKey;
  }

  /**
   * This will return the device status icon key
   * based on the provided firewall device status
   *
   * @param status Firewall device status
   */
  public getFirewallDeviceStatusIconKey(
    status: FirewallDeviceStatus): string {

    let iconKey = '';

    switch (status) {
      case FirewallDeviceStatus.AutoUpdated:
      case FirewallDeviceStatus.InProgress:
      case FirewallDeviceStatus.Retrieved:
      case FirewallDeviceStatus.Reverted:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
        break;

      case FirewallDeviceStatus.Aborted:
      case FirewallDeviceStatus.Cancelled:
      case FirewallDeviceStatus.None:
      case FirewallDeviceStatus.SyncFailed:
      case FirewallDeviceStatus.Timeout:
      case FirewallDeviceStatus.Unknown:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
        break;

      case FirewallDeviceStatus.ChangedConfig:
      case FirewallDeviceStatus.CheckedIn:
      case FirewallDeviceStatus.Installed:
      case FirewallDeviceStatus.Pending:
      case FirewallDeviceStatus.Retry:
      case FirewallDeviceStatus.Sched:
      default:
        iconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
        break;
    }

    return iconKey;
  }
}
