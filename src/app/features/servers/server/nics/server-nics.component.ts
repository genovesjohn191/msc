import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import {
  ServerNetwork,
  ServerNetworkSummary,
  ServerManageNetwork,
  ServerIpAddress,
  ServerIpAllocationMode,
  ServerServiceType
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
  ServerDetailsBase,
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

export class ServerNicsComponent extends ServerDetailsBase
  implements OnInit, OnDestroy {

  public textContent: any;
  public resourceNetworks: ServerNetwork[];
  public nics: ServerNetworkSummary[];
  public ipAddress: ServerIpAddress;

  public networksSubscription: Subscription;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_FONT_WARNING;
  }

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  public get hasNics(): boolean {
    return !isNullOrEmpty(this.nics);
  }

  public get hasReachedNetworksLimit(): boolean {
    return this.nics.length === STORAGE_MAXIMUM_NETWORKS;
  }

  public get hasAvailableResourceNetwork(): boolean {
    return !isNullOrEmpty(this.resourceNetworks);
  }

  private _activeNicId: string;
  public get activeNicId(): string {
    return this._activeNicId;
  }
  public set activeNicId(value: string) {
    if (this._activeNicId !== value) {
      this._activeNicId = value;
      this._changeDetectorRef.markForCheck();
    }
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

  public get nicsScaleIsDisabled(): boolean {
    return !this.server.isOperable || this.isProcessing ||
      this.server.serviceType === ServerServiceType.Managed;
  }

  constructor(
    _notificationContextService: McsNotificationContextService,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    private _textProvider: McsTextContentProvider,
    private _dialogService: McsDialogService
  ) {
    // Constructor
    super(
      _notificationContextService,
      _serverService,
      _changeDetectorRef
    );
    this.isProcessing = false;
    this.isUpdate = false;
    this.nics = new Array<ServerNetworkSummary>();
    this.ipAddress = new ServerIpAddress();
    this.selectedNic = new ServerNetworkSummary();
  }

  public ngOnInit() {
    // OnInit
    this.textContent = this._textProvider.content.servers.server.nics;
  }

  public ngOnDestroy() {
    this.dispose();

    if (!isNullOrEmpty(this.networksSubscription)) {
      this.networksSubscription.unsubscribe();
    }
  }

  public onIpAddressChanged(ipAddress: ServerIpAddress): void {
    if (isNullOrEmpty(ipAddress)) { return; }

    this.ipAddress = (ipAddress.valid) ? ipAddress : new ServerIpAddress();
  }

  public validate(): boolean {
    let isValid = false;

    if (this.isUpdate) {
      isValid = this.ipAddress.valid &&
        (this.networkName !== this.selectedNic.name ||
          this.ipAddress.ipAllocationMode !== this.selectedNic.ipAllocationMode ||
          this.ipAddress.customIpAddress !== this.selectedNic.ipAddress);
    } else {
      isValid = !isNullOrEmpty(this.networkName) && this.ipAddress.valid;
    }

    return isValid;
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

  public onUpdateNetwork(nic: ServerNetworkSummary): void {
    if (isNullOrEmpty(nic)) { return; }

    this.selectedNic = nic;
    this.networkName = nic.name;
    this.ipAddress.ipAllocationMode = nic.ipAllocationMode;
    this.ipAddress.customIpAddress = nic.ipAddress;
    this.isPrimary = nic.isPrimary;
    this.isUpdate = true;
  }

  public closeUpdateWindow(): void {
    this._resetNetworkValues();
    this.isUpdate = false;
  }

  public onDeleteNetwork(nic: ServerNetworkSummary): void {
    let dialogRef = this._dialogService.open(DeleteNicDialogComponent, {
      data: nic,
      size: 'medium'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteNetwork(nic);
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
      nicId: this.selectedNic.id,
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

  public deleteNetwork(nic: ServerNetworkSummary): void {
    if (isNullOrEmpty(nic)) { return; }

    this.isProcessing = true;

    let networkValues = new ServerManageNetwork();
    networkValues.name = this.networkName;
    networkValues.clientReferenceObject = {
      serverId: this.server.id,
      nicId: nic.id,
      powerState: this.server.powerState
    };

    this._resetNetworkValues();
    this._serverService.deleteServerNetwork(this.server.id, nic.id, networkValues).subscribe();
  }

  protected serverSelectionChanged(): void {
    this._getServerNetworks();
  }

  protected serverJobStatusChanged(selectedServerJob: McsApiJob): void {
    let nic = new ServerNetworkSummary();

    this.activeNicId = selectedServerJob.clientReferenceObject.nicId;

    switch (selectedServerJob.type) {
      case McsJobType.UpdateServerNetwork:
        // Get the id of the NIC to be updated
        nic.id = this.activeNicId;
        if (this.isProcessing) { break; }

      case McsJobType.CreateServerNetwork:
        if (this.isProcessing) {
          // Append Created Server Network / Update Network Data
          nic.name = selectedServerJob.clientReferenceObject.networkName;
          addOrUpdateArrayRecord(this.nics, nic, false,
            (_first: any, _second: any) => {
              return _first.id === _second.id;
            });
        }

      case McsJobType.DeleteServerNetwork:
        // Update NICs list once job has completed or failed
        if (this.hasCompletedJob || this.hasFailedJob) {
          deleteArrayRecord(this.nics, (targetNetwork) => {
            return isNullOrEmpty(targetNetwork.id);
          }, 1);
        }

        if (this.hasCompletedJob) {
          this._getServerNetworks();
        }
        break;

      default:
        // Do nothing when the job is not related to NIC management
        break;
    }

    if (this.hasCompletedJob || this.hasFailedJob) {
      this.activeNicId = '';
    }
  }

  /**
   * This will get the server networks
   */
  private _getServerNetworks(): void {
    if (isNullOrEmpty(this.server.id)) { return; }

    this.networksSubscription = this._serverService.getServerNetworks(this.server.id)
      .subscribe((response) => {
        if (!isNullOrEmpty(response)) {
          this.nics = response.content as ServerNetworkSummary[];
        }
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
}
