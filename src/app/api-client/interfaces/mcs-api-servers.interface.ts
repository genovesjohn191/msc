import { Observable } from 'rxjs';
import {
  McsQueryParam,
  McsApiSuccessResponse,
  McsServer,
  McsServerOsUpdates,
  McsServerOsUpdatesDetails,
  McsServerOsUpdatesRequest,
  McsJob,
  McsServerOsUpdatesCategory,
  McsServerOsUpdatesSchedule,
  McsServerOsUpdatesScheduleRequest,
  McsServerPowerstateCommand,
  McsServerRename,
  McsServerUpdate,
  McsServerCreate,
  McsServerClone,
  McsServerOperatingSystem,
  McsServerStorageDeviceUpdate,
  McsServerStorageDevice,
  McsServerThumbnail,
  McsServerNic,
  McsServerCreateNic,
  McsServerCompute,
  McsServerMedia,
  McsServerAttachMedia,
  McsServerDelete,
  McsServerSnapshot,
  McsServerSnapshotCreate,
  McsServerDetachMedia,
  McsServerSnapshotRestore,
  McsServerSnapshotDelete,
  McsServerPasswordReset,
  McsServerOsUpdatesInspectRequest,
  McsServerBackupVm,
  McsServerBackupServer,
  McsServerHostSecurity,
  McsServerHostSecurityHidsLog,
  McsServerHostSecurityAvLog,
  McsServerHostSecurityAntiVirus,
  McsServerHostSecurityHids,
  McsServerBackupVmDetails,
  McsServerBackupServerDetails,
} from '@app/models';

export interface IMcsApiServersService {

  /**
   * Get Servers (MCS API Response)
   * @param query Query predicate that serves as the parameter of the endpoint
   */
  getServers(query?: McsQueryParam, optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsServer[]>>;

  /**
   * Get server by ID (MCS API Response)
   * @param id Server identification
   */
  getServer(id: any): Observable<McsApiSuccessResponse<McsServer>>;

  /**
   * Get the os-updates of the server
   * @param id Server identification
   * @param query contains the keyword, page index and size
   */
  getServerOsUpdates(id: any, query?: McsQueryParam): Observable<McsApiSuccessResponse<McsServerOsUpdates[]>>;

  /**
   * Get the os-updates details of the server
   * @param id Server identification
   * @param query contains the keyword, page index and size
   */
  getServerOsUpdatesDetails(id: any): Observable<McsApiSuccessResponse<McsServerOsUpdatesDetails>>;

  /**
   * Update server os by ID
   * *Note: This will send a job (notification)
   * @param id Server identification
   * @param updateRequestDetails Can be update IDs or/and categories
   */
  updateServerOs(id: any, updateRequestDetails: McsServerOsUpdatesRequest): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Gets all the server os-updates categories
   */
  getServerOsUpdatesCategories(): Observable<McsApiSuccessResponse<McsServerOsUpdatesCategory[]>>;

  /**
   * Inspect the Server for available updates
   * @param id Server identification
   */
  inspectServerForAvailableOsUpdates(
    id: string,
    inspectRequest: McsServerOsUpdatesInspectRequest
  ): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Get the schedule of the Server OS update
   * @param id Server identification
   */
  getServerOsUpdatesSchedule(id: any): Observable<McsApiSuccessResponse<McsServerOsUpdatesSchedule[]>>;

  /**
   * Update the schedule of the Server OS update
   * @param id Server identification
   * @param schedule Model that contains the cron and the schedule details
   */
  updateServerOsUpdatesSchedule(id: any, schedule: McsServerOsUpdatesScheduleRequest):
    Observable<McsApiSuccessResponse<McsServerOsUpdatesSchedule>>;

  /**
   * Delete the schedule of the Server OS update
   * @param id Server identification
   */
  deleteServerOsUpdatesSchedule(id: any): Observable<McsApiSuccessResponse<boolean>>;

  /**
   * Put server command/action to process the server
   * *Note: This will send a job (notification)
   * @param id Server identification
   * @param command Command type (Start, Stop, Restart)
   * @param referenceObject Reference object of the server client to determine the status of job
   */
  sendServerPowerState(id: any, powerstate: McsServerPowerstateCommand): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Post server reset vm password
   * @param id Server identification
   * @param resetDetails Server details to be reset
   */
  resetVmPassword(id: any, resetDetails: McsServerPasswordReset): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Renames a server based on the new name provided
   * @param id Server identification
   * @param referenceObject Reference object to obtain during subscribe
   */
  renameServer(id: any, serverData: McsServerRename): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Updates server compute data to process the scaling updates
   * @param id Server identification
   * @param serverData Server data for the patch update
   */
  updateServerCompute(id: any, serverData: McsServerUpdate): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * This will create the new server based on the inputted information
   * @param serverData Server data to be created
   */
  createServer(serverData: McsServerCreate): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * This will clone an existing server
   * @param id Server id to be cloned
   * @param serverData Server data to be cloned
   */
  cloneServer(id: string, serverData: McsServerClone): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * This will delete an existing server
   * @param id Server id to delete
   * @param serverDelete Server delete model details
   */
  deleteServer(id: string, serverDelete: McsServerDelete): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * This will get the server os data from the API
   */
  getServerOs(optionalHeaders?: Map<string, any>): Observable<McsApiSuccessResponse<McsServerOperatingSystem[]>>;

  /**
   * This will get the server storage data from the API
   */
  getServerStorage(serverId: any, query?: McsQueryParam): Observable<McsApiSuccessResponse<McsServerStorageDevice[]>>;

  /**
   * Creates server storage based on the data provided
   * @param serverId Server identification
   * @param storageData Server storage data
   */
  createServerStorage(serverId: any, storageData: McsServerStorageDeviceUpdate):
    Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Updates server storage based on the data provided
   * @param serverId Server identification
   * @param storageId Server storage identification
   * @param storageData Server storage data
   */
  updateServerStorage(
    serverId: any,
    storageId: any,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Deletes server storage based on the data provided
   * @param serverId Server identification
   * @param storageId Server storage identification
   * @param storageData Server storage data
   */
  deleteServerStorage(
    serverId: string,
    storageId: string,
    storageData: McsServerStorageDeviceUpdate
  ): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Get the server thumbnail for the image of the console
   * * Note: This will return the thumbnail for display
   * @param id Server identification
   */
  getServerThumbnail(id: any): Observable<McsApiSuccessResponse<McsServerThumbnail>>;

  /**
   * This will get the server networks from the API
   */
  getServerNics(serverId: any, query?: McsQueryParam): Observable<McsApiSuccessResponse<McsServerNic[]>>;

  /**
   * Adds server nic based on the nic data provided
   * @param serverId Server identification
   * @param nicData Server nic data
   */
  addServerNic(serverId: any, nicData: McsServerCreateNic): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Updates server nic based on the ID provided
   * @param serverId Server identification
   * @param nicId NIC identification
   * @param nicData Server network data
   */
  updateServerNic(
    serverId: any,
    nicId: any,
    nicData: McsServerCreateNic
  ): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Deletes server nic based on the ID provided
   * @param serverId Server identification
   * @param nicId Network identification
   * @param nicData Server network data
   */
  deleteServerNic(
    serverId: any,
    nicId: any,
    nicData: McsServerCreateNic
  ): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * This will get the server compute from the API
   */
  getServerCompute(serverId: any): Observable<McsApiSuccessResponse<McsServerCompute>>;

  /**
   * This will get the server medias from the API
   */
  getServerMedias(serverId: any): Observable<McsApiSuccessResponse<McsServerMedia[]>>;

  /**
   * Attaches the server media based on the given server id
   * @param serverId Server Identification
   * @param mediaData Server media data
   */
  attachServerMedia(serverId: any, mediaDetails: McsServerAttachMedia): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Detaches the server media based on the given server id
   * @param serverId Server Identification
   * @param mediaDetails Media Details to be deleted
   */
  detachServerMedia(
    serverId: string,
    mediaId: string,
    mediaDetails: McsServerDetachMedia
  ): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Get server snapshots from API
   * @param id Server identification
   */
  getServerSnapshots(serverId: any): Observable<McsApiSuccessResponse<McsServerSnapshot[]>>;

  /**
   * Creates server snapshot
   * @param serverId Server identification
   * @param data Snapshot model to be created
   */
  createServerSnapshot(id: any, createSnapshot: McsServerSnapshotCreate):
    Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Restores server snapshot
   * @param serverId Server identification
   * @param snapshotRestore Restore details of the snapshot
   */
  restoreServerSnapshot(id: any, snapshotRestore: McsServerSnapshotRestore): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Deletes the existing server snapshot
   * @param serverId Server id to where the snapshot will be deleted
   * @param snapshotDelete Delete details of the snapshot
   */
  deleteServerSnapshot(id: string, snapshotDelete: McsServerSnapshotDelete): Observable<McsApiSuccessResponse<McsJob>>;

  /**
   * Gets the server vm summary
   * @param serverId Server id to where the vm backup will be coming from
   */
  getServerBackupVm(id: string): Observable<McsApiSuccessResponse<McsServerBackupVm>>;

  /**
   * Gets the server vm backup details
   * @param serverId Server id to where the vm backup details will be coming from
   */
  getServerBackupVmDetails(id: string, query?: McsQueryParam): Observable<McsApiSuccessResponse<McsServerBackupVmDetails>>;

  /**
   * Gets the servers with vm backup provision
   */
  getServerBackupVms(): Observable<McsApiSuccessResponse<McsServerBackupVm[]>>;

  /**
   * Gets the server backup summary
   * @param serverId Server id to where the server backup will be coming from
   */
  getServerBackupServer(id: string): Observable<McsApiSuccessResponse<McsServerBackupServer>>;

  /**
   * Gets the server server backup details
   * @param serverId Server id to where the server backup details will be coming from
   */
  getServerBackupServerDetails(id: string, query?: McsQueryParam): Observable<McsApiSuccessResponse<McsServerBackupServerDetails>>;

  /**
   * Gets the servers with server backup provision
   */
  getServerBackupServers(): Observable<McsApiSuccessResponse<McsServerBackupServer[]>>;

  /**
   * Gets the server host security details
   * @param serverId Server id to where the host security will be coming from
   */
  getServerHostSecurity(id: string): Observable<McsApiSuccessResponse<McsServerHostSecurity>>;

  /**
   * Gets the server host security anti-virus
   */
  getServerHostSecurityAntiVirus(): Observable<McsApiSuccessResponse<McsServerHostSecurityAntiVirus[]>>;

  /**
   * Gets the server av logs
   * @param id Server id to where the anti virus will be coming from
   */
  getServerHostSecurityAvLogs(id: string): Observable<McsApiSuccessResponse<McsServerHostSecurityAvLog[]>>;

  /**
   * Gets the server host security hids
   */
  getServerHostSecurityHids(): Observable<McsApiSuccessResponse<McsServerHostSecurityHids[]>>;

  /**
   * Gets the server hids logs
   * @param id Server id to where the hids will be coming from
   */
  getServerHostSecurityHidsLogs(id: string): Observable<McsApiSuccessResponse<McsServerHostSecurityHidsLog[]>>;
}
