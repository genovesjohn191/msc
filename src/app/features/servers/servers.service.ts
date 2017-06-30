import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import {
  Observable,
  BehaviorSubject
} from 'rxjs/Rx';
/** Services and Models */
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  McsApiRequestParameter,
  McsNotificationContextService,
  McsApiJob,
  McsApiRequestServerUpdate
} from '../../core/';
import { reviverParser } from '../../utilities';
import {
  Server,
  ServerClientObject,
  ServerPowerState
} from './models';

/**
 * Servers Services Class
 */
@Injectable()
export class ServersService {

  /**
   * Subscribe in this stream to get all the active servers on the given notification stream
   * based on the COG command action triggered
   */
  private _activeServersStream: BehaviorSubject<ServerClientObject[]>;
  public get activeServersStream(): BehaviorSubject<ServerClientObject[]> {
    return this._activeServersStream;
  }
  public set activeServersStream(value: BehaviorSubject<ServerClientObject[]>) {
    this._activeServersStream = value;
  }

  constructor(
    private _mcsApiService: McsApiService,
    private _notificationContextService: McsNotificationContextService
  ) {
    this._activeServersStream = new BehaviorSubject<ServerClientObject[]>(new Array());
    this._listenToNotificationUpdate();
  }

  /**
   * Get Servers (MCS API Response)
   * @param page Page Number
   * @param perPage Count per page
   * @param serverName Server name filter
   */
  public getServers(
    page?: number,
    perPage?: number,
    serverName?: string): Observable<McsApiSuccessResponse<Server[]>> {

    let searchParams: URLSearchParams = new URLSearchParams();
    searchParams.set('page', page ? page.toString() : undefined);
    searchParams.set('per_page', perPage ? perPage.toString() : undefined);
    searchParams.set('search_keyword', serverName);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers';
    mcsApiRequestParameter.searchParameters = searchParams;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let serversResponse: McsApiSuccessResponse<Server[]>;
        serversResponse = JSON.parse(response.text(),
          this._convertProperty) as McsApiSuccessResponse<Server[]>;

        return serversResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Get server by ID (MCS API Response)
   * @param id Server identification
   */
  public getServer(id: any): Observable<McsApiSuccessResponse<Server>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers/' + id;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<Server>;
        serverResponse = JSON.parse(response.text(),
          this._convertProperty) as McsApiSuccessResponse<Server>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Post server command/action to process the server
   * *Note: This will send a job (notification)
   * @param id Server identification
   * @param command Command type (Start, Stop, Restart)
   * @param referenceObject Reference object of the server client to determine the status of job
   */
  public postServerCommand(id: any, action: string, referenceObject: any) {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers/' + id + '/command';
    mcsApiRequestParameter.recordData = JSON.stringify({
      command: action,
      clientReferenceObject: referenceObject
    });

    return this._mcsApiService.post(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response.text(),
          reviverParser) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Patch server data to process the scaling updates
   * *Note: This will send a job (notification)
   * @param id Server identification
   * @param serverData Server data for the patch update
   */
  public patchServer(id: any, serverData: McsApiRequestServerUpdate) {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers/' + id;
    mcsApiRequestParameter.recordData = JSON.stringify(serverData);

    return this._mcsApiService.patch(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response.text(),
          reviverParser) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  private _listenToNotificationUpdate(): void {
    // listener for the notification updates
    this._notificationContextService.notificationsStream
      .subscribe((updatedNotifications) => {
        let activeServers: ServerClientObject[] = new Array();

        // Filter only those who have client reference object on notification jobs
        updatedNotifications.forEach((notification) => {
          if (notification.clientReferenceObject) {

            activeServers.push({
              serverId: notification.clientReferenceObject.serverId,
              powerState: notification.clientReferenceObject.powerState,
              commandAction: notification.clientReferenceObject.commandAction,
              notificationStatus: notification.status,
              tooltipInformation: notification.summaryInformation

            } as ServerClientObject);
          }
        });

        // Notify active servers listener/subscriber
        if (activeServers) {
          this._activeServersStream.next(activeServers);
        }
      });
  }

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
    // Convert powerState to enumeration
    if (key === 'powerState') {
      value = ServerPowerState[value];
    }

    return value;
  }
}
