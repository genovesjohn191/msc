import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/Rx';
import {
  ServerNetwork,
  ServerNicSummary,
  ServerManageNetwork,
  ServerIpAddress,
  ServerIpAllocationMode,
  ServerServiceType
} from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsDialogService,
  McsApiJob,
  McsNotificationEventsService
} from '../../../../core';
import { ServerService } from '../server.service';
import { ServersRepository } from '../../servers.repository';
import { ServersResourcesRespository } from '../../servers-resources.repository';
import {
  isNullOrEmpty,
  unsubscribeSafely
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
  public nics: ServerNicSummary[];
  public ipAddress: ServerIpAddress;

  public fcNetwork: FormControl;

  // Subscriptions
  public updateNicsSubscription: Subscription;
  public networksSubscription: Subscription;
  private _notificationsChangeSubscription: Subscription;
  private _createServerNicSubscription: Subscription;
  private _updateServerNicSubscription: Subscription;
  private _deleteServerNicSubscription: Subscription;

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
    return !isNullOrEmpty(this.server.nics);
  }

  public get hasReachedNetworksLimit(): boolean {
    return this.hasNics && this.server.nics.length === STORAGE_MAXIMUM_NETWORKS;
  }

  public get hasAvailableResourceNetwork(): boolean {
    return !isNullOrEmpty(this.resourceNetworks);
  }

  public get resourceNetworks(): ServerNetwork[] {
    return !isNullOrEmpty(this.serverResource.networks) ?
      this.serverResource.networks : new Array();
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

  private _selectedNic: ServerNicSummary;
  public get selectedNic(): ServerNicSummary {
    return this._selectedNic;
  }
  public set selectedNic(value: ServerNicSummary) {
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

  public get nicAddOrDeleteIsDisabled(): boolean {
    return !this.server.isOperable || this.isProcessingJob;
  }

  public get nicEditIsDisabled(): boolean {
    return !this.server.isOperable || this.isProcessingJob ||
      this.server.serviceType === ServerServiceType.Managed;
  }

  constructor(
    _serverService: ServerService,
    _serversResourcesRepository: ServersResourcesRespository,
    _changeDetectorRef: ChangeDetectorRef,
    private _textProvider: McsTextContentProvider,
    private _dialogService: McsDialogService,
    private _serversRepository: ServersRepository,
    private _notificationEvents: McsNotificationEventsService
  ) {
    // Constructor
    super(
      _serverService,
      _serversResourcesRepository,
      _changeDetectorRef
    );
    this.isUpdate = false;
    this.nics = new Array<ServerNicSummary>();
    this.ipAddress = new ServerIpAddress();
    this.selectedNic = new ServerNicSummary();
  }

  public ngOnInit() {
    // OnInit
    this.textContent = this._textProvider.content.servers.server.nics;
    this._registerFormGroup();
    this._registerJobEvents();
  }

  public ngOnDestroy() {
    this.dispose();
    this._unregisterJobEvents();
    unsubscribeSafely(this.networksSubscription);
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

  public onUpdateNetwork(nic: ServerNicSummary): void {
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

  public onDeleteNetwork(nic: ServerNicSummary): void {
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

  public deleteNetwork(nic: ServerNicSummary): void {
    if (isNullOrEmpty(nic)) { return; }

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

  /**
   * Event that emits when the server selection was changed
   * `@Note:` Base implementation
   */
  protected serverSelectionChanged(): void {
    this._getResourceNetworks();
    this.updateNicsSubscription = this._serversRepository
      .findServerNics(this.server)
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Set network name, netmask and gateway on network select
   *
   * @param networkName Network name selected
   */
  private _onNetworkSelect(networkName: string): void {
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

  /**
   * Register form group controls
   */
  private _registerFormGroup(): void {
    this.fcNetwork = new FormControl('', []);
    this.fcNetwork.valueChanges.subscribe(this._onNetworkSelect.bind(this));
  }

  /**
   * Reset network form values to initial
   */
  private _resetNetworkValues(): void {
    this.fcNetwork.setValue('');
    this.networkName = '';
    this.ipAddress = new ServerIpAddress();
    this.networkGateway = '';
    this.networkNetmask = '';
    this.isPrimary = false;
  }

  /**
   * Register jobs/notifications events
   */
  private _registerJobEvents(): void {
    this._notificationsChangeSubscription = this._serversRepository.notificationsChanged
      .subscribe(() => { this._changeDetectorRef.markForCheck(); });
    this._createServerNicSubscription = this._notificationEvents.createServerNetwork
      .subscribe(this._onCreateServerNetwork.bind(this));
    this._updateServerNicSubscription = this._notificationEvents.updateServerNetwork
      .subscribe(this._onModifyServerNetwork.bind(this));
    this._deleteServerNicSubscription = this._notificationEvents.deleteServerNetwork
      .subscribe(this._onModifyServerNetwork.bind(this));
  }

  /**
   * Unregister jobs/notifications events
   */
  private _unregisterJobEvents(): void {
    unsubscribeSafely(this._notificationsChangeSubscription);
    unsubscribeSafely(this._createServerNicSubscription);
    unsubscribeSafely(this._updateServerNicSubscription);
    unsubscribeSafely(this._deleteServerNicSubscription);
  }

  /**
   * Event that emits when adding a server nic
   * @param job Emitted job content
   */
  private _onCreateServerNetwork(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }

    if (!this.server.isProcessing) {
      // Update the server nics
      this.serverSelectionChanged();
    }
  }

  /**
   * Event that emits when either updating or deleting a server nic
   * @param job Emitted job content
   */
  private _onModifyServerNetwork(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }

    if (job.status === CoreDefinition.NOTIFICATION_JOB_COMPLETED) {
      // Update the server nics
      this.serverSelectionChanged();
    }
  }

  /**
   * Get the resource networks from the server
   */
  private _getResourceNetworks(): void {
    this.networksSubscription = this._serversResourcesRespository
      .findResourceNetworks(this.serverResource)
      .subscribe(() => {
        // Subscribe to update the networks to server resource
      });
  }
}
