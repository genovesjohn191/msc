import { Injectable } from '@angular/core';
import {
  Observable,
  BehaviorSubject
} from 'rxjs/Rx';
import { Router } from '@angular/router';
/** Services and Models */
import {
  McsApiService,
  McsApiSuccessResponse,
  McsApiErrorResponse,
  McsApiRequestParameter,
  McsNotificationContextService,
  McsApiJob,
  McsJobType,
  CoreDefinition,
  McsDialogService,
  McsAuthenticationIdentity
} from '../../core/';
import {
  reviverParser,
  convertJsonStringToObject,
  isNullOrEmpty,
  getEnumString
} from '../../utilities';
import {
  Server,
  ServerClientObject,
  ServerPowerState,
  ServerThumbnail,
  ServerCreate,
  ServerClone,
  ServerUpdate,
  ServerCommand,
  ServerPlatform,
  ServerResource,
  ServerStorage,
  ServerGroupedOs,
  ServerStorageDevice,
  ServerStorageDeviceUpdate,
  ServerServiceType,
  ServerImageType,
  ServerCatalogType,
  ServerCatalogItemType,
  ServerNetworkSummary,
  ServerManageNetwork,
  ServerIpAllocationMode,
  ServerManageMedia,
  ServerPlatformType
} from './models';
import { ResetPasswordFinishedDialogComponent } from './shared';

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

  /**
   * Subscribe to get notify when job is ended or ongoing
   */
  private _jobsStream: BehaviorSubject<McsApiJob[]>;
  public get jobsStream(): BehaviorSubject<McsApiJob[]> {
    return this._jobsStream;
  }
  public set jobsStream(value: BehaviorSubject<McsApiJob[]>) {
    this._jobsStream = value;
  }

  constructor(
    private _mcsApiService: McsApiService,
    private _dialogService: McsDialogService,
    private _authIdentity: McsAuthenticationIdentity,
    private _notificationContextService: McsNotificationContextService,
    private _router: Router
  ) {
    this._activeServers = new Array();
    this._jobsStream = new BehaviorSubject(undefined);
    this._activeServersStream = new BehaviorSubject(undefined);
    this._listenToResetPassword();
    this._listenToNotificationUpdate();
  }

  /**
   * Get Servers (MCS API Response)
   * @param page Page Number
   * @param perPage Count per page
   * @param serverName Server name filter
   * @param notifyError Notify global error flag
   */
  public getServers(args?: {
    page?: number,
    perPage?: number,
    searchKeyword?: string,
    notifyError?: boolean
  }): Observable<McsApiSuccessResponse<Server[]>> {

    // Set default values if null
    if (isNullOrEmpty(args)) { args = {}; }

    let searchParams = new Map<string, any>();
    searchParams.set('page', args.page ? args.page.toString() : undefined);
    searchParams.set('per_page', args.perPage ? args.perPage.toString() : undefined);
    searchParams.set('search_keyword', args.searchKeyword);

    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers';
    mcsApiRequestParameter.searchParameters = searchParams;
    mcsApiRequestParameter.notifyGlobalErrorHandler = args.notifyError ? args.notifyError : true;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let serversResponse: McsApiSuccessResponse<Server[]>;
        serversResponse = JSON.parse(response,
          this._responseReviverParser) as McsApiSuccessResponse<Server[]>;

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
    mcsApiRequestParameter.endPoint = `/servers/${id}`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<Server>;
        serverResponse = JSON.parse(response,
          this._responseReviverParser) as McsApiSuccessResponse<Server>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Put server command/action to process the server
   * *Note: This will send a job (notification)
   * @param id Server identification
   * @param command Command type (Start, Stop, Restart)
   * @param referenceObject Reference object of the server client to determine the status of job
   */
  public putServerCommand(
    id: any,
    action: ServerCommand,
    referenceObject: any
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/power`;
    mcsApiRequestParameter.recordData = JSON.stringify({
      command: getEnumString(ServerCommand, action),
      clientReferenceObject: referenceObject
    });

    return this._mcsApiService.put(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response,
          reviverParser) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Post server reset vm password
   * @param id Server identification
   * @param referenceObject Reference object to obtain during subscribe
   */
  public resetVmPassowrd(id: any, referenceObject: any):
    Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/password/reset`;
    mcsApiRequestParameter.recordData = JSON.stringify({
      clientReferenceObject: referenceObject
    });

    return this._mcsApiService.post(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response,
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
    mcsApiRequestParameter.endPoint = `/servers/${id}`;
    mcsApiRequestParameter.recordData = JSON.stringify(serverData);

    return this._mcsApiService.patch(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response,
          reviverParser) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * This will create the new server based on the inputted information
   * @param serverData Server data to be created
   */
  public createServer(serverData: ServerCreate):
    Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers';
    mcsApiRequestParameter.recordData = JSON.stringify(serverData, this._requestReviverParser);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response,
          reviverParser) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * This will clone an existing server
   * @param id Server id to be cloned
   * @param serverData Server data to be cloned
   */
  public cloneServer(
    id: string,
    serverData: ServerClone
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}/clone`;
    mcsApiRequestParameter.recordData = JSON.stringify(serverData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response,
          reviverParser) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * This will delete an existing server
   * @param id Server id to delete
   * @param referenceObject Reference object
   */
  public deleteServer(
    id: string,
    referenceObject: any
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${id}`;
    mcsApiRequestParameter.recordData = JSON.stringify({
      clientReferenceObject: referenceObject
    });

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response.text(),
          reviverParser) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * This will get the server os data from the API
   */
  public getServerOs(): Observable<McsApiSuccessResponse<ServerGroupedOs[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers/os';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<ServerGroupedOs[]>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<ServerGroupedOs[]>>(
          response,
          this._responseReviverParser
        );
        return apiResponse ? apiResponse : new McsApiSuccessResponse<ServerGroupedOs[]>();
      })
      .catch(this._handleServerError);
  }

  /**
   * This will get the server storage data from the API
   */
  public getServerStorage(serverId: any): Observable<McsApiSuccessResponse<ServerStorageDevice[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/disks`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<ServerStorageDevice[]>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<ServerStorageDevice[]>>(
          response,
          this._responseReviverParser
        );
        return apiResponse ? apiResponse : new McsApiSuccessResponse<ServerStorageDevice[]>();
      })
      .catch(this._handleServerError);
  }

  /**
   * Creating server storage
   * *Note: This will send a job (notification)
   * @param serverId Server identification
   * @param storageData Server storage data
   */
  public createServerStorage(
    serverId: any,
    storageData: ServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/disks`;
    mcsApiRequestParameter.recordData = JSON.stringify(storageData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response,
          reviverParser) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Updating server storage
   * *Note: This will send a job (notification)
   * @param serverId Server identification
   * @param storageId Server storage identification
   * @param storageData Server storage data
   */
  public updateServerStorage(
    serverId: any,
    storageId: any,
    storageData: ServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/disks/${storageId}`;
    mcsApiRequestParameter.recordData = JSON.stringify(storageData);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response,
          reviverParser) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Deleting server storage
   * *Note: This will send a job (notification)
   * @param serverId Server identification
   * @param storageId Server storage identification
   * @param storageData Server storage data
   */
  public deleteServerStorage(
    serverId: any,
    storageId: any,
    storageData: ServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/disks/${storageId}`;
    mcsApiRequestParameter.recordData = JSON.stringify(storageData);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response,
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
        serverResponse = JSON.parse(response) as McsApiSuccessResponse<ServerThumbnail>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * This will get the server networks from the API
   */
  public getServerNetworks(
    serverId: any): Observable<McsApiSuccessResponse<ServerNetworkSummary[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/networks`;

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<ServerNetworkSummary[]>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<ServerNetworkSummary[]>>(
          response, this._responseReviverParser);
        return apiResponse ? apiResponse : new McsApiSuccessResponse<ServerNetworkSummary[]>();
      })
      .catch(this._handleServerError);
  }

  /**
   * Adding server network
   * *Note: This will send a job (notification)
   * @param serverId Server identification
   * @param networkData Server network data
   */
  public addServerNetwork(
    serverId: any,
    networkData: ServerManageNetwork
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/networks`;
    mcsApiRequestParameter.recordData = JSON.stringify(networkData, this._requestReviverParser);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response,
          this._responseReviverParser) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Updating server network
   * *Note: This will send a job (notification)
   * @param serverId Server identification
   * @param networkId Network identification
   * @param networkData Server network data
   */
  public updateServerNetwork(
    serverId: any,
    networkId: any,
    networkData: ServerManageNetwork
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/networks/${networkId}`;
    mcsApiRequestParameter.recordData = JSON.stringify(networkData, this._requestReviverParser);

    return this._mcsApiService.put(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response,
          this._responseReviverParser) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Deleting server network
   * *Note: This will send a job (notification)
   * @param serverId Server identification
   * @param networkId Network identification
   */
  public deleteServerNetwork(
    serverId: any,
    networkId: any,
    networkData: ServerManageNetwork
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/networks/${networkId}`;
    mcsApiRequestParameter.recordData = JSON.stringify(networkData, this._requestReviverParser);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response,
          this._responseReviverParser) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Attaching server media
   * *Note: This will send a job (notification)
   *
   * @param serverId Server Identification
   * @param mediaData Server media data
   */
  public attachServerMedia(
    serverId: any,
    mediaData: ServerManageMedia
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/media`;
    mcsApiRequestParameter.recordData = JSON.stringify(mediaData);

    return this._mcsApiService.post(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response) as McsApiSuccessResponse<McsApiJob>;

        return serverResponse;
      })
      .catch(this._handleServerError);
  }

  /**
   * Detaching server media
   * *Note: This will send a job (notification)
   *
   * @param serverId Server Identification
   * @param mediaId Media Identification
   * @param mediaData Server media data
   */
  public detachServerMedia(
    serverId: any,
    mediaId: any,
    mediaData: ServerManageMedia
  ): Observable<McsApiSuccessResponse<McsApiJob>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = `/servers/${serverId}/media/${mediaId}`;
    mcsApiRequestParameter.recordData = JSON.stringify(mediaData);

    return this._mcsApiService.delete(mcsApiRequestParameter)
      .map((response) => {
        let serverResponse: McsApiSuccessResponse<McsApiJob>;
        serverResponse = JSON.parse(response) as McsApiSuccessResponse<McsApiJob>;

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
        if (isNullOrEmpty(activeServer.commandAction)) {
          serverPowerstate = activeServer.powerState;
        } else {
          serverPowerstate = activeServer.commandAction === ServerCommand.Stop ?
            ServerPowerState.PoweredOff : ServerPowerState.PoweredOn;
        }
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

  /**
   * Get Platform Data (MCS API Response)
   */
  public getServerPlatforms(): Observable<McsApiSuccessResponse<ServerPlatform[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers/platforms';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<ServerPlatform>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<ServerPlatform>>(
          response,
          this._responseReviverParser
        );
        return apiResponse ? apiResponse : new McsApiSuccessResponse<ServerPlatform>();
      })
      .catch(this._handleServerError);
  }

  /**
   * Get Resources Data (MCS API Response)
   */
  public getResources(): Observable<McsApiSuccessResponse<ServerResource[]>> {
    let mcsApiRequestParameter: McsApiRequestParameter = new McsApiRequestParameter();
    mcsApiRequestParameter.endPoint = '/servers/resources';

    return this._mcsApiService.get(mcsApiRequestParameter)
      .map((response) => {
        let apiResponse: McsApiSuccessResponse<ServerResource[]>;
        apiResponse = convertJsonStringToObject<McsApiSuccessResponse<ServerResource[]>>(
          response,
          this._responseReviverParser
        );
        return apiResponse ? apiResponse : new McsApiSuccessResponse<ServerResource[]>();
      })
      .catch(this._handleServerError);
  }

  /**
   * Execute the server command according to inputs
   * @param server Server to process the action
   * @param action Action to be execute
   */
  public executeServerCommand(server: Server, action: ServerCommand) {
    switch (action) {
      case ServerCommand.ViewVCloud:
        window.open(server.portalUrl);
        break;

      case ServerCommand.Scale:
        this._router.navigate(
          [`/servers/${server.id}/management`],
          { queryParams: { scale: true } }
        );
        break;

      case ServerCommand.Clone:
        this._router.navigate(
          [`/servers/create`],
          { queryParams: { clone: server.id } }
        );
        break;

      case ServerCommand.ResetVmPassword:
        this.resetVmPassowrd(server.id,
          {
            serverId: server.id,
            userId: this._authIdentity.userId,
            commandAction: action,
            powerState: server.powerState,
          })
          .subscribe(() => {
            // Subscribe to execute the reset vm password
          });
        break;

      case ServerCommand.Delete:
        this.deleteServer(server.id,
          {
            serverId: server.id,
            commandAction: action,
            powerState: server.powerState
          })
          .subscribe();
        this._router.navigate(['/servers']);
        break;

      default:
        this.putServerCommand(server.id, action,
          {
            serverId: server.id,
            powerState: server.powerState,
            commandAction: action
          } as ServerClientObject)
          .subscribe(() => {
            // Subscribe to execute the command post
          });
        break;
    }
  }

  /**
   * Return the active server status
   * @param server Server to be check
   */
  public getServerStatus(server: Server): ServerClientObject {
    let serverStatus = new ServerClientObject();

    if (!isNullOrEmpty(server)) {
      serverStatus.powerState = server.powerState;
      serverStatus.commandAction = ServerCommand.None;

      if (!isNullOrEmpty(this.activeServers)) {
        for (let active of this.activeServers) {
          if (active.serverId === server.id) {
            // Update the powerstate of the corresponding server based on the row
            serverStatus = active;
            serverStatus.powerState = this.getActiveServerPowerState(active);
            server.powerState = serverStatus.powerState;
            break;
          }
        }
      }
    }

    return serverStatus;
  }

  public computeAvailableMemoryMB(resource: ServerResource): number {
    let availableMemoryMB = 0;

    if (!isNullOrEmpty(resource)) {
      let resourceCompute = resource.compute;

      availableMemoryMB = !isNullOrEmpty(resourceCompute) ?
        resourceCompute.memoryLimitMB - resourceCompute.memoryUsedMB : 0;
    }

    return availableMemoryMB;
  }

  public computeAvailableCpu(resource: ServerResource): number {
    let availableCpu = 0;

    if (!isNullOrEmpty(resource)) {
      let resourceCompute = resource.compute;

      availableCpu = !isNullOrEmpty(resourceCompute) ?
        resourceCompute.cpuLimit - resourceCompute.cpuUsed : 0;
    }

    return availableCpu;
  }

  public computeAvailableStorageMB(storage: ServerStorage): number {
    return !isNullOrEmpty(storage) ? storage.limitMB - storage.usedMB : 0;
  }

  /**
   * Listener to all servers that reset their password
   */
  private _listenToResetPassword(): void {
    this.jobsStream.subscribe((updatedJobs) => {
      if (isNullOrEmpty(updatedJobs)) { return; }

      let resettedPasswords = updatedJobs.filter((job) => {
        return job.clientReferenceObject &&
          job.clientReferenceObject.userId === this._authIdentity.userId &&
          job.type === McsJobType.ResetServerPassword &&
          !isNullOrEmpty(job.tasks[0].referenceObject);
      });
      if (!isNullOrEmpty(resettedPasswords)) {
        resettedPasswords.forEach((resettedPassword) => {
          let credentialObject = resettedPassword.tasks[0].referenceObject.credential;

          // Display dialog
          this._dialogService.open(ResetPasswordFinishedDialogComponent, {
            data: credentialObject,
            size: 'medium',
            disableClose: true
          });
        });
      }
    });
  }

  /**
   * Listen to notifications update in the job context
   */
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
        this._jobsStream.next(updatedNotifications);
      });
  }

  /**
   * Server error obtainment in API Handler
   * @param error Error content from API
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
   * Convert the json object to corresponding object as response
   * by comparing its key
   * @param key Property name of the object to be change
   * @param value Value of the item
   */
  private _responseReviverParser(key, value): any {

    switch (key) {
      case 'powerState':
        value = ServerPowerState[value];
        break;

      case 'serviceType':
        value = ServerServiceType[value];
        break;

      case 'imageType':
        value = ServerImageType[value];
        break;

      case 'type':
        value = ServerCatalogType[value] || ServerPlatformType[value];
        break;

      case 'itemType':
        value = ServerCatalogItemType[value];
        break;

      case 'ipAllocationMode':
        value = ServerIpAllocationMode[value];
        break;

      default:
        break;
    }

    return value;
  }

  /**
   * Convert the json object to corresponding object as request
   * by comparing its key
   * @param key Property name of the object to be change
   * @param value Value of the item
   */
  private _requestReviverParser(key, value): any {

    switch (key) {
      case 'imageType':
        value = getEnumString(ServerImageType, value);
        break;

      case 'ipAllocationMode':
        value = getEnumString(ServerIpAllocationMode, value);
        break;

      default:
        break;
    }

    return value;
  }
}
