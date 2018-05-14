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
  Subscription,
  Subject
} from 'rxjs/Rx';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
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
import { ServersResourcesRepository } from '../../servers-resources.repository';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  refreshView
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

  private _newNic: ServerNicSummary;

  private _destroySubject = new Subject<void>();

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
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

  public get serverNics(): ServerNicSummary[] {
    return isNullOrEmpty(this._newNic) ?
      this.server.nics :
      [...this.server.nics, this._newNic];
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
    _serversResourcesRepository: ServersResourcesRepository,
    _serversRepository: ServersRepository,
    _serversService: ServersService,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    _textProvider: McsTextContentProvider,
    _errorHandlerService: McsErrorHandlerService,
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
      _textProvider,
      _errorHandlerService
    );
    this.isUpdate = false;
    this.nics = new Array<ServerNicSummary>();
    this.ipAddress = new ServerIpAddress();
    this.selectedNic = new ServerNicSummary();
    this.dataStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
  }

  public ngOnInit() {
    // OnInit
    this.textContent = this._textProvider.content.servers.server.nics;
    this.initialize();
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
    this.networkName = nic.logicalNetworkName;
    this.ipAddress.ipAllocationMode = nic.ipAllocationMode;
    this.ipAddress.customIpAddress = isNullOrEmpty(nic) ? '' : nic.ipAddress[0];

    this.isPrimary = nic.isPrimary;
    this.isUpdate = true;
    refreshView(() => this.fcNetwork.setValue(this.networkName));
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
    if (!this.server.isProcessing ||
      isNullOrEmpty(this.server.nics)) {
      this._getServerNics();
    }
  }

  /**
   * Set network name, netmask and gateway on network select
   *
   * @param network Network selected
   */
  private _onNetworkSelect(network: ServerNetwork): void {
    if (isNullOrEmpty(network)) { return; }
    this.networkName = network.name;
    this.networkNetmask = network.netmask;
    this.networkGateway = network.gateway;
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
    this._serversRepository.notificationsChanged
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => { this._changeDetectorRef.markForCheck(); });
    this._notificationEvents.createServerNic
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onCreateServerNic.bind(this));
    this._notificationEvents.updateServerNic
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onModifyServerNic.bind(this));
    this._notificationEvents.deleteServerNic
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._onModifyServerNic.bind(this));
  }

  /**
   * Unregister jobs/notifications events
   */
  private _unregisterJobEvents(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  /**
   * Event that emits when adding a server nic
   * @param job Emitted job content
   */
  private _onCreateServerNic(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    if (job.dataStatus === McsDataStatus.InProgress) {
      // Append a mock nic record while job is processing
      this._onAddingNic(job);
    } else {
      // Get and update the server nics
      this._newNic = undefined;
      this._getServerNics();
    }
  }

  /**
   * Event that emits when either updating or deleting a server nic
   * @param job Emitted job content
   */
  private _onModifyServerNic(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

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
    if (!this.serverIsActiveByJob(job)) { return; }

    // Mock NIC data based on job response
    this._newNic = new ServerNicSummary();
    this._newNic.logicalNetworkName = job.clientReferenceObject.networkName;
    this._newNic.ipAllocationMode = job.clientReferenceObject.ipAllocationMode;
    this._newNic.isProcessing = this.server.isProcessing;
  }

  /**
   * This will get and update the list of server nics
   */
  private _getServerNics(): void {
    unsubscribeSafely(this.updateNicsSubscription);

    this.dataStatusFactory.setInProgress();
    this.updateNicsSubscription = this._serversRepository
      .findServerNics(this.server)
      .catch((error) => {
        // Handle common error status code
        this.dataStatusFactory.setError();
        return Observable.throw(error);
      })
      .subscribe((response) => {
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
      .subscribe(() => {
        // Subscribe to update the snapshots in server instance
        this._changeDetectorRef.markForCheck();
      });
  }
}
