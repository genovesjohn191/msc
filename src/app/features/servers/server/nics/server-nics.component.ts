import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Observable,
  Subscription
} from 'rxjs/Rx';
import {
  ServerNetwork,
  ServerNicSummary,
  ServerManageNic,
  ServerIpAddress,
  ServerIpAllocationMode
} from '../../models';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsDialogService,
  McsApiJob,
  McsNotificationEventsService,
  McsDataStatusFactory,
  McsErrorHandlerService,
  McsDataStatus
} from '../../../../core';
import { ServersService } from '../../servers.service';
import { ServerService } from '../server.service';
import { ServersRepository } from '../../servers.repository';
import { ServersResourcesRespository } from '../../servers-resources.repository';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  addOrUpdateArrayRecord,
  deleteArrayRecord
} from '../../../../utilities';
import {
  ServerDetailsBase,
  DeleteNicDialogComponent
} from '../../shared';

const SERVER_MAXIMUM_NICS = 10;

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
  public dataStatusFactory: McsDataStatusFactory<ServerNicSummary[]>;

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

  public get hasReachedNicsLimit(): boolean {
    return this.hasNics && this.server.nics.length === SERVER_MAXIMUM_NICS;
  }

  public get hasAvailableResourceNetwork(): boolean {
    return !isNullOrEmpty(this.resourceNetworks);
  }

  public get scaleNicIsDisabled(): boolean {
    return !this.server.executable || !this.validate();
  }

  public get resourceNetworks(): ServerNetwork[] {
    return !isNullOrEmpty(this.serverResource.networks) ?
      this.serverResource.networks : new Array();
  }

  private _serverNics: ServerNicSummary[];
  public get serverNics(): ServerNicSummary[] {
    return this._serverNics;
  }
  public set serverNics(value: ServerNicSummary[]) {
    if (this._serverNics !== value) {
      this._serverNics = value;
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

  constructor(
    _serversResourcesRepository: ServersResourcesRespository,
    _serversRepository: ServersRepository,
    _serversService: ServersService,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    _textProvider: McsTextContentProvider,
    private _errorHandlerService: McsErrorHandlerService,
    private _dialogService: McsDialogService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    // Constructor
    super(
      _serversResourcesRepository,
      _serversRepository,
      _serversService,
      _serverService,
      _changeDetectorRef,
      _textProvider
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
      let ipAddressExist: string;
      if (!isNullOrEmpty(this.selectedNic.ipAddress)) {
        ipAddressExist = this.selectedNic.ipAddress.find((ip) => {
          return ip !== this.ipAddress.customIpAddress;
        });
      }
      isValid = this.ipAddress.valid &&
        (this.networkName !== this.selectedNic.name ||
          this.ipAddress.ipAllocationMode !== this.selectedNic.ipAllocationMode ||
          isNullOrEmpty(ipAddressExist));
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
    // TODO: Remove this when the nics endpoint and the ipaddress is array in API are available
    if (!isNullOrEmpty(this.selectedNic)) {
      this.selectedNic.ipAddress = Array.isArray(this.selectedNic.ipAddress) ?
        this.selectedNic.ipAddress : new Array(this.selectedNic.ipAddress);
    }
    this.networkName = nic.name;
    this.ipAddress.ipAllocationMode = nic.ipAllocationMode;
    this.ipAddress.customIpAddress = isNullOrEmpty(nic) ? '' : nic.ipAddress[0];

    this.isPrimary = nic.isPrimary;
    this.isUpdate = true;
    this.fcNetwork.setValue(this.networkName);
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

    let nicValues = new ServerManageNic();
    nicValues.name = this.networkName;
    nicValues.ipAllocationMode = this.ipAddress.ipAllocationMode;
    nicValues.ipAddress = this.ipAddress.customIpAddress;
    nicValues.clientReferenceObject = {
      serverId: this.server.id,
      networkName: this.networkName,
      ipAllocationMode: this.ipAddress.ipAllocationMode,
      ipAddress: this.ipAddress.customIpAddress
    };

    this._resetNetworkValues();
    this._serversService.addServerNic(this.server.id, nicValues).subscribe();
  }

  public updateNetwork(): void {
    if (!this.validate()) { return; }

    let nicValues = new ServerManageNic();
    nicValues.name = this.networkName;
    nicValues.ipAllocationMode = this.ipAddress.ipAllocationMode;
    nicValues.ipAddress = this.ipAddress.customIpAddress;
    nicValues.clientReferenceObject = {
      serverId: this.server.id,
      nicId: this.selectedNic.id,
      networkName: this.networkName,
      ipAllocationMode: this.ipAddress.ipAllocationMode,
      ipAddress: this.ipAddress.customIpAddress
    };

    this._serversService.setServerSpinner(this.server, this.selectedNic);
    this._serversService
      .updateServerNic(this.server.id, this.selectedNic.id, nicValues)
      .catch((error) => {
        this._serversService.clearServerSpinner(this.server, this.selectedNic);
        return Observable.throw(error);
      })
      .subscribe((response) => {
        if (!isNullOrEmpty(response)) {
          this.isUpdate = false;
          this._resetNetworkValues();
        }
      });
  }

  public deleteNetwork(nic: ServerNicSummary): void {
    if (isNullOrEmpty(nic)) { return; }

    let nicValues = new ServerManageNic();
    nicValues.name = this.networkName;
    nicValues.clientReferenceObject = {
      serverId: this.server.id,
      nicId: nic.id
    };

    this._resetNetworkValues();
    this._serversService.deleteServerNic(this.server.id, nic.id, nicValues).subscribe();
  }

  /**
   * Event that emits when the server selection was changed
   * `@Note:` Base implementation
   */
  protected serverSelectionChanged(): void {
    this._getResourceNetworks();
    this._getServerNics();
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
    this._createServerNicSubscription = this._notificationEvents.createServerNic
      .subscribe(this._onCreateServerNic.bind(this));
    this._updateServerNicSubscription = this._notificationEvents.updateServerNic
      .subscribe(this._onModifyServerNic.bind(this));
    this._deleteServerNicSubscription = this._notificationEvents.deleteServerNic
      .subscribe(this._onModifyServerNic.bind(this));
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
  private _onCreateServerNic(job: McsApiJob): void {
    if (isNullOrEmpty(job) || this.server.id !== job.clientReferenceObject.serverId) { return; }

    switch (job.dataStatus) {
      case McsDataStatus.InProgress:
        this._onAddingNic(job);
        break;

      case McsDataStatus.Success:
        // Get and update the server nics
        this._getServerNics();
        break;

      case McsDataStatus.Error:
      default:
        // Remove appended mock disk record
        deleteArrayRecord(this.serverNics, (targetNic) => {
          return isNullOrEmpty(targetNic.id);
        }, 1);
        break;
    }

    // Update data status if in progress or failed
    if (job.dataStatus !== McsDataStatus.Success) {
      this.dataStatusFactory.setSuccesfull(this.serverNics);
    }
  }

  /**
   * Event that emits when either updating or deleting a server nic
   * @param job Emitted job content
   */
  private _onModifyServerNic(job: McsApiJob): void {
    if (isNullOrEmpty(job) || this.server.id !== job.clientReferenceObject.serverId) { return; }

    // Get and update the server nics
    if (job.dataStatus === McsDataStatus.Success) {
      this._getServerNics();
    }
  }

  /**
   * Will trigger if currently adding a NIC
   * @param job Emitted job content
   */
  private _onAddingNic(job: McsApiJob): void {
    if (isNullOrEmpty(job)) { return; }

    // Mock NIC data based on job response
    let nic = new ServerNicSummary();
    nic.networkName = job.clientReferenceObject.networkName;
    nic.ipAllocationMode = job.clientReferenceObject.ipAllocationMode;
    nic.isProcessing = this.server.isProcessing;

    // Append a mock nic record while job is processing
    addOrUpdateArrayRecord(this.serverNics, nic, false,
      (_first: ServerNicSummary, _second: ServerNicSummary) => {
        return _first.id === _second.id;
      });
  }

  /**
   * This will get and update the list of server nics
   */
  private _getServerNics(): void {
    unsubscribeSafely(this.updateNicsSubscription);
    // We need to check the datastatus factory if its not undefined
    // because it was called under base class and for any reason, the instance is undefined.
    if (isNullOrEmpty(this.dataStatusFactory)) {
      this.dataStatusFactory = new McsDataStatusFactory();
    }

    this.dataStatusFactory.setInProgress();
    this.updateNicsSubscription = this._serversRepository
      .findServerNics(this.server)
      .catch((error) => {
        // Handle common error status code
        this.dataStatusFactory.setError();
        return Observable.throw(error);
      })
      .subscribe((response) => {
        this.serverNics = this.server.nics;
        this.dataStatusFactory.setSuccesfull(response);
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Get the resource networks from the server
   */
  private _getResourceNetworks(): void {
    unsubscribeSafely(this.networksSubscription);
    this.networksSubscription = this._serversResourcesRespository
      .findResourceNetworks(this.serverResource)
      .catch((error) => {
        // Handle common error status code
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
      .subscribe(() => {
        // Subscribe to update the snapshots in server instance
        this._changeDetectorRef.markForCheck();
      });
  }
}
