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
  CoreDefinition
} from '../../core/';
import { reviverParser } from '../../utilities';
import {
  Server,
  ServerClientObject,
  ServerPowerState,
  ServerThumbnail,
  ServerUpdate,
  ServerCommand
} from './models';

/**
 * Servers Services Class
 */
@Injectable()
export class ServersService {

  /**
   * Get all the active servers on the given notification stream
   * based on the COG command action triggered
   */
  private _activeServers: ServerClientObject[];
  public get activeServers(): ServerClientObject[] {
    return this._activeServers;
  }
  public set activeServers(value: ServerClientObject[]) {
    this._activeServers = value;
  }

  /**
   * Subscribe to get notify when their is active server
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
    this._activeServers = new Array();
    this._activeServersStream = new BehaviorSubject(undefined);
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
  public postServerCommand(
    id: any,
    action: string,
    referenceObject: any
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
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
  public patchServer(
    id: any,
    serverData: ServerUpdate
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
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

  /**
   * Get the server thumbnail for the image of the console
   * * Note: This will return the thumbnail for display
   * @param id Server identification
   */
  public getServerThumbnail(id: any): Observable<McsApiSuccessResponse<ServerThumbnail>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/thumbnail`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<ServerThumbnail>;
        serverResponse = JSON.parse(response.text()) as McsApiSuccessResponse<ServerThumbnail>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Get the active server power state based on job status
   * @param server Corresponding server to be checked
   */
  public getActiveServerPowerState(activeServer: ServerClientObject): number {
    let serverPowerstate: number = 0;

    // Get actual server status
    switch (activeServer.notificationStatus) {
      case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
        serverPowerstate = activeServer.commandAction === ServerCommand.Start ?
          ServerPowerState.PoweredOn : ServerPowerState.PoweredOff;
        break;

      case CoreDefinition.NOTIFICATION_JOB_ACTIVE:
      case CoreDefinition.NOTIFICATION_JOB_PENDING:
        serverPowerstate = undefined;
        break;

      case CoreDefinition.NOTIFICATION_JOB_FAILED:
      case CoreDefinition.NOTIFICATION_JOB_TIMEDOUT:
      case CoreDefinition.NOTIFICATION_JOB_CANCELLED:
        serverPowerstate = activeServer.powerState;
      default:
        break;
    }
    return serverPowerstate;
  }

  /**
   * Get the active server information based on job status
   *
   * `@Note` This will be use in tooltip to display the on-going process information
   * @param serverId Server ID to be display
   */
  public getActiveServerInformation(serverId: any): string {
    let commandInformation: string = '';
    let activeServer = this._activeServers
      .find((severInformations) => {
        return severInformations.serverId === serverId;
      });

    if (activeServer) {
      return activeServer.tooltipInformation;
    } else {
      return 'This instance is being processed';
    }
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

        // Set active servers to property
        this._activeServers = activeServers;
        this._activeServersStream.next(activeServers);
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
