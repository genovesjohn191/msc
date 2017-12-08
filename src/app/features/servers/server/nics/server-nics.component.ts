import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import {
  ServerResource,
  Server,
  ServerNetwork,
  ServerNetworkSummary,
  ServerManageNetwork,
  ServerIpAddress,
  ServerIpAllocationMode
} from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsNotificationContextService,
  McsApiJob,
  McsJobType,
  McsDialogService
} from '../../../../core';
import { ServerService } from '../server.service';
import {
  addOrUpdateArrayRecord,
  isNullOrEmpty,
  deleteArrayRecord
} from '../../../../utilities';

import {
  DeleteNicDialogComponent
} from '../../shared';

const STORAGE_MAXIMUM_NETWORKS = 10;

@Component({
  selector: 'mcs-server-nics',
  templateUrl: './server-nics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class ServerNicsComponent implements OnInit, OnDestroy {

  public textContent: any;
  public resourceNetworks: ServerNetwork[];
  public server: Server;
  public networks: ServerNetworkSummary[];
  public ipAddress: ServerIpAddress;

  public serverResourceSubscription: Subscription;
  public networksSubscription: Subscription;

  public activeServerJob: McsApiJob;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
  }

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  public get hasReachedNetworksLimit(): boolean {
    return this.networks.length === STORAGE_MAXIMUM_NETWORKS;
  }

  public get hasAvailableResourceNetwork(): boolean {
    return !isNullOrEmpty(this.resourceNetworks);
  }

  private _networkName: string;
  public get networkName(): string {
    return this._networkName;
  }
  public set networkName(value: string) {
    if (this._networkName !== value) {
      this._networkName = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _networkMask: string;
  public get networkNetmask(): string {
    return this._networkMask;
  }
  public set networkNetmask(value: string) {
    if (this._networkMask !== value) {
      this._networkMask = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _networkGateway: string;
  public get networkGateway(): string {
    return this._networkGateway;
  }
  public set networkGateway(value: string) {
    if (this._networkGateway !== value) {
      this._networkGateway = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _selectedNic: ServerNetworkSummary;
  public get selectedNic(): ServerNetworkSummary {
    return this._selectedNic;
  }
  public set selectedNic(value: ServerNetworkSummary) {
    if (this._selectedNic !== value) {
      this._selectedNic = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _isPrimary: boolean;
  public get isPrimary(): boolean {
    return this._isPrimary;
  }
  public set isPrimary(value: boolean) {
    if (this._isPrimary !== value) {
      this._isPrimary = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _isUpdate: boolean;
  public get isUpdate(): boolean {
    return this._isUpdate;
  }
  public set isUpdate(value: boolean) {
    if (this._isUpdate !== value) {
      this._isUpdate = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _isProcessing: boolean;
  public get isProcessing(): boolean {
    return this._isProcessing;
  }
  public set isProcessing(value: boolean) {
    if (this._isProcessing !== value) {
      this._isProcessing = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Server resource data mapping
   */
  private _resourceMap: Map<string, ServerResource>;

  private _serverSubscription: Subscription;
  private _notificationsSubscription: Subscription;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textProvider: McsTextContentProvider,
    private _serverService: ServerService,
    private _notificationContextService: McsNotificationContextService,
    private _dialogService: McsDialogService
  ) {
    // Constructor
    this.isProcessing = false;
    this.isUpdate = false;
    this._resourceMap = new Map<string, ServerResource>();
    this.resourceNetworks = new Array<ServerNetwork>();
    this.server = new Server();
    this.networks = new Array<ServerNetworkSummary>();
    this.ipAddress = new ServerIpAddress();
    this.activeServerJob = new McsApiJob();
    this.selectedNic = new ServerNetworkSummary();
  }

  public ngOnInit() {
    // OnInit
    this.textContent = this._textProvider.content.servers.server.nics;

    this._listenToSelectedServerStream();
    this._listenToNotificationsStream();
  }

  public ngOnDestroy() {
    if (this.serverResourceSubscription) {
      this.serverResourceSubscription.unsubscribe();
    }

    if (this.networksSubscription) {
      this.networksSubscription.unsubscribe();
    }

    if (this._serverSubscription) {
      this._serverSubscription.unsubscribe();
    }

    if (this._notificationsSubscription) {
      this._notificationsSubscription.unsubscribe();
    }
  }

  public onIpAddressChanged(ipAddress: ServerIpAddress): void {
    if (isNullOrEmpty(ipAddress)) { return; }

    this.ipAddress = (ipAddress.valid) ? ipAddress : new ServerIpAddress();
  }

  public validate(): boolean {
    let isValid = false;

    if (this.isUpdate) {
      isValid = this.ipAddress.valid && !isNullOrEmpty(this.networkName) &&
        (this.networkName !== this.selectedNic.name ||
        this.isPrimary !== this.selectedNic.isPrimary ||
        this.ipAddress.ipAllocationMode !== this.selectedNic.ipAllocationMode ||
        this.ipAddress.customIpAddress !== this.selectedNic.ipAddress);
    } else {
      isValid = !isNullOrEmpty(this.networkName) && this.ipAddress.valid;
    }

    return isValid;
  }

  public getActiveNic(network: ServerNetworkSummary): boolean {
    return !isNullOrEmpty(this.activeServerJob.clientReferenceObject) &&
      this.activeServerJob.clientReferenceObject.networkId === network.id;
  }

  public getNetworkSummaryInformation(network: ServerNetworkSummary): string {
    if (isNullOrEmpty(this.activeServerJob.clientReferenceObject)) { return ''; }

    return (this.activeServerJob.clientReferenceObject.networkId === network.id) ?
      this.activeServerJob.summaryInformation : '';
  }

  public getIpAllocationModeText(ipAllocationMode: ServerIpAllocationMode): string {
    let text: string;

    switch (ipAllocationMode) {
      case ServerIpAllocationMode.Dhcp:
        text = this.textContent.ipAllocationMode.dhcp;
        break;

      case ServerIpAllocationMode.Pool:
        text = this.textContent.ipAllocationMode.dynamic;
        break;

      case ServerIpAllocationMode.Manual:
        text = this.textContent.ipAllocationMode.static;
        break;

      default:
        text = '';
        break;
    }

    return text;
  }

  public onNetworkSelect(networkName: string): void {
    this.networkName = networkName;

    if (!isNullOrEmpty(networkName)) {
      let targetNetwork = this.resourceNetworks.find((result) => {
        return result.name === networkName;
      });

      if (!isNullOrEmpty(targetNetwork)) {
        this.networkNetmask = targetNetwork.netmask;
        this.networkGateway = targetNetwork.gateway;
      }
    }
  }

  public onUpdateNetwork(network: ServerNetworkSummary): void {
    if (isNullOrEmpty(network)) { return; }

    this.selectedNic = network;
    this.networkName = network.name;
    this.ipAddress.ipAllocationMode = network.ipAllocationMode;
    this.ipAddress.customIpAddress = network.ipAddress;
    this.isPrimary = network.isPrimary;
    this.isUpdate = true;
  }

  public closeUpdateWindow(): void {
    this._resetNetworkValues();
    this.isUpdate = false;
  }

  public onDeleteNetwork(network: ServerNetwork): void {
    let dialogRef = this._dialogService.open(DeleteNicDialogComponent, {
      data: network,
      size: 'medium'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteNetwork(network);
      }
    });
  }

  public addNetwork(): void {
    if (!this.validate()) { return; }

    this.isProcessing = true;

    let networkValues = new ServerManageNetwork();
    networkValues.name = this.networkName;
    networkValues.ipAllocationMode = this.ipAddress.ipAllocationMode;
    networkValues.ipAddress = this.ipAddress.customIpAddress;
    networkValues.clientReferenceObject = {
      serverId: this.server.id,
      networkName: this.networkName,
      ipAllocationMode: this.ipAddress.ipAllocationMode,
      ipAddress: this.ipAddress.customIpAddress,
      powerState: this.server.powerState
    };

    this._resetNetworkValues();
    this._serverService.addServerNetwork(this.server.id, networkValues).subscribe();
  }

  public updateNetwork(): void {
    if (!this.validate()) { return; }

    this.isProcessing = true;

    let networkValues = new ServerManageNetwork();
    networkValues.name = this.networkName;
    networkValues.ipAllocationMode = this.ipAddress.ipAllocationMode;
    networkValues.ipAddress = this.ipAddress.customIpAddress;
    networkValues.clientReferenceObject = {
      serverId: this.server.id,
      networkId: this.selectedNic.id,
      networkIndex: this.selectedNic.index,
      networkName: this.networkName,
      ipAllocationMode: this.ipAddress.ipAllocationMode,
      ipAddress: this.ipAddress.customIpAddress,
      powerState: this.server.powerState
    };

    this._serverService.updateServerNetwork(this.server.id, this.selectedNic.id, networkValues)
      .subscribe((response) => {
        if (!isNullOrEmpty(response)) {
          this.isUpdate = false;
          this._resetNetworkValues();
        }
      });
  }

  public deleteNetwork(network: ServerNetwork): void {
    if (isNullOrEmpty(network)) { return; }

    this.isProcessing = true;

    let networkValues = new ServerManageNetwork();
    networkValues.name = this.networkName;
    networkValues.clientReferenceObject = {
      serverId: this.server.id,
      networkId: network.id,
      powerState: this.server.powerState
    };

    this._serverService.deleteServerNetwork(this.server.id, network.id, networkValues).subscribe();
  }

  /**
   * This will get the server resources
   */
  private _getResources(): void {
    this.serverResourceSubscription = this._serverService.getServerResources(this.server)
    .subscribe((resources) => {
      if (!isNullOrEmpty(resources)) {
        this._setResourceMap(resources);
      }
    });

    this.serverResourceSubscription.add(() => {
      this._setResourceNetworks();
      this._getServerNetworks();
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * This will set the Platform data to platform mapping
   *
   * @param resources Server Resources
   */
  private _setResourceMap(resources: ServerResource[]): void {
    if (!isNullOrEmpty(resources)) {
      resources.forEach((resource) => {
        this._resourceMap.set(resource.name, resource);
      });

      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * This will set the resource networks
   */
  private _setResourceNetworks(): void {
    if (this.server.platform) {
      let resourceName = this.server.platform.resourceName;

      if (!isNullOrEmpty(resourceName) && this._resourceMap.has(resourceName)) {
        let resource = this._resourceMap.get(resourceName);
        this.resourceNetworks = resource.networks;
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  /**
   * This will get the server networks
   */
  private _getServerNetworks(): void {
    if (isNullOrEmpty(this.server.id) || !isNullOrEmpty(this.networks)) { return; }

    this.networksSubscription = this._serverService.getServerNetworks(this.server.id)
      .subscribe((response) => {
        this.networks = response.content as ServerNetworkSummary[];
        this._changeDetectorRef.markForCheck();
      });
  }

  private _resetNetworkValues(): void {
    this.networkName = undefined;
    this.ipAddress = new ServerIpAddress();
    this.networkGateway = undefined;
    this.networkNetmask = undefined;
    this.isPrimary = false;
  }

  /**
   * This will listen to the selected server
   * and set values for storage management
   */
  private _listenToSelectedServerStream(): void {
    this._serverSubscription = this._serverService.selectedServerStream
      .subscribe((server) => {
        if (isNullOrEmpty(server)) { return; }

        if (this.server.id !== server.id) {
          this.server = server;
          this._getResources();
        }
      });
  }

  /**
   * This will listen to the ongoing jobs and will update
   * the UI based on the executed storage action/s
   */
  private _listenToNotificationsStream(): void {
    this._notificationsSubscription = this._notificationContextService.notificationsStream
      .subscribe((notifications) => {
        if (!isNullOrEmpty(notifications) && !isNullOrEmpty(this.server.id)) {

          let activeServerJob = notifications.find((job) => {
            return job.clientReferenceObject &&
              job.clientReferenceObject.serverId === this.server.id;
          });

          if (!isNullOrEmpty(activeServerJob)) {
            let hasCompleted = activeServerJob.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED;
            let hasFailed = activeServerJob.status === CoreDefinition.NOTIFICATION_JOB_FAILED;

            this.isProcessing = !hasCompleted && !hasFailed;
            this.activeServerJob = (this.isProcessing) ? activeServerJob : new McsApiJob() ;

            let network = new ServerNetworkSummary();

            switch (activeServerJob.type) {
              case McsJobType.UpdateServerNetwork:
                network.id = activeServerJob.clientReferenceObject.networkId;
                if (!hasCompleted) { break; }

              case McsJobType.CreateServerNetwork:
                if (hasCompleted || hasFailed) {
                  deleteArrayRecord(this.networks, (targetNetwork) => {
                    return isNullOrEmpty(targetNetwork.id);
                  }, 1);
                }

                if (hasFailed) { break; }

                // Append Created Server Network / Update Network Data
                network.name = activeServerJob.clientReferenceObject.networkName;

                // Update the server network when completed
                if (hasCompleted) {
                  let clientReferenceObject = activeServerJob.clientReferenceObject;
                  network.index = clientReferenceObject.networkIndex;
                  network.isPrimary = clientReferenceObject.primaryNic;

                  let ipAllocationMode: string = clientReferenceObject.ipAllocationMode;
                  network.ipAllocationMode = ServerIpAllocationMode[ipAllocationMode];

                  network.ipAddress = clientReferenceObject.ipAddress;

                  if (isNullOrEmpty(network.id) && !isNullOrEmpty(activeServerJob.tasks)) {
                    let referenceObject = activeServerJob.tasks[0].referenceObject;

                    if (!isNullOrEmpty(referenceObject.resourceId)) {
                      network.id = referenceObject.resourceId;
                    }
                  }
                }

                addOrUpdateArrayRecord(this.networks, network, false,
                  (_first: any, _second: any) => {
                    return _first.id === _second.id;
                  });
                break;

              case McsJobType.DeleteServerNetwork:
                // Delete Network
                if (hasCompleted) {
                  network = this.networks.find((result) => {
                    return result.id === activeServerJob.clientReferenceObject.networkId;
                  });

                  if (!isNullOrEmpty(network)) {
                    deleteArrayRecord(this.networks, (targetNetwork) => {
                      return network.id === targetNetwork.id;
                    });
                  }
                }
                break;

              default:
                // Do nothing
                break;
            }
          }

          this._changeDetectorRef.markForCheck();
        }
      });
  }
}
