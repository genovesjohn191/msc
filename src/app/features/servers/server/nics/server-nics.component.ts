import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
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
  ServerNic,
  ServerManageNic,
  ServerManageNetwork,
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
  animateFactory
} from '../../../../utilities';
import {
  ServerDetailsBase,
  DeleteNicDialogComponent,
  ServerManageNetworkComponent
} from '../../shared';

// Enumeration
export enum ServerNicMethodType {
  None = 0,
  AddNic = 1,
  EditNic = 2,
  DeleteNic = 3
}

// Constants
const SERVER_MAXIMUM_NICS = 10;

@Component({
  selector: 'mcs-server-nics',
  templateUrl: './server-nics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeIn
  ],
  host: {
    'class': 'block'
  }
})

export class ServerNicsComponent extends ServerDetailsBase implements OnInit, OnDestroy {
  @ViewChild('manageNetworkElement')
  public manageNetworkElement: ServerManageNetworkComponent;

  public textContent: any;
  public currentIpAddress: string;
  public fcNetwork: FormControl;
  public manageNetwork: ServerManageNetwork;
  public selectedNetwork: ServerNetwork;
  public selectedNic: ServerNic;
  public dataStatusFactory: McsDataStatusFactory<ServerNic[]>;

  private _updateNicsSubscription: Subscription;
  private _networksSubscription: Subscription;
  private _newNic: ServerNic;
  private _destroySubject = new Subject<void>();
  private _hasInProgressNic: boolean;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  /**
   * Returns true when the nics has reached its limitation
   */
  public get hasReachedNicsLimit(): boolean {
    return !isNullOrEmpty(this.server.nics) &&
      this.server.nics.length >= SERVER_MAXIMUM_NICS;
  }

  /**
   * Returns the enum type of the server nic method
   */
  public get serverNicMethodTypeEnum(): any {
    return ServerNicMethodType;
  }

  /**
   * Returns all the server nics including the newly created nic as a mock data
   */
  public get serverNics(): ServerNic[] {
    return isNullOrEmpty(this._newNic) ?
      this.server.nics :
      [...this.server.nics, this._newNic];
  }

  /**
   * Returns all the resource networks
   */
  public get resourceNetworks(): ServerNetwork[] {
    return !isNullOrEmpty(this.serverResource.networks) ?
      this.serverResource.networks : new Array();
  }

  /**
   * Returns true when the NIC is currently updating/editing
   */
  private _nicMethodType: ServerNicMethodType = ServerNicMethodType.AddNic;
  public get nicMethodType(): ServerNicMethodType { return this._nicMethodType; }
  public set nicMethodType(value: ServerNicMethodType) {
    if (this._nicMethodType !== value) {
      this._nicMethodType = value;
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
    super(
      _serversResourcesRepository,
      _serversRepository,
      _serversService,
      _serverService,
      _changeDetectorRef,
      _textProvider,
      _errorHandlerService
    );
    this.manageNetwork = new ServerManageNetwork();
    this.selectedNic = new ServerNic();
    this.dataStatusFactory = new McsDataStatusFactory(this._changeDetectorRef);
    this.nicMethodType = ServerNicMethodType.AddNic;
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.nics;
    this.initialize();
    this._registerJobEvents();
  }

  public ngOnDestroy() {
    this.dispose();
    this._destroySubject.next();
    this._destroySubject.complete();
    unsubscribeSafely(this._networksSubscription);
  }

  /**
   * Event that emits when data in network component has been changed
   * @param manageNetwork Manage Network content
   */
  public onNetworkChanged(manageNetwork: ServerManageNetwork): void {
    if (isNullOrEmpty(manageNetwork)) { return; }
    this.manageNetwork = manageNetwork;
  }

  /**
   * Returns true when there is a selected network when adding nic and the inputted is valid
   */
  public get inputIsValid(): boolean {
    return !isNullOrEmpty(this.manageNetwork)
      && this.manageNetwork.valid;
  }

  /**
   * Returns true when user can add nic or not
   */
  public get canAddNic(): boolean {
    return !this.hasReachedNicsLimit
      && !isNullOrEmpty(this.resourceNetworks);
  }

  /**
   * Returns true when the NIC data has been changed
   */
  public get canEditNic(): boolean {
    let modeNotChanged = this.manageNetwork.network.name === this.selectedNic.logicalNetworkName
      && this.manageNetwork.ipAllocationMode !== ServerIpAllocationMode.Manual
      && this.manageNetwork.ipAllocationMode === this.selectedNic.ipAllocationMode;
    if (modeNotChanged) { return false; }

    if (!isNullOrEmpty(this.manageNetwork.customIpAddress) && this.inputIsValid) {
      let ipAddressFound = this.selectedNic.ipAddress.find((ip) => {
        return ip === this.manageNetwork.customIpAddress;
      });
      if (!isNullOrEmpty(ipAddressFound)) { return false; }
    }
    return this.inputIsValid;
  }

  /**
   * Edits the selected NIC content
   * @param nic NIC to be edited
   */
  public editNic(nic: ServerNic): void {
    if (isNullOrEmpty(nic)) { return; }
    this.selectedNic = nic;
    this.nicMethodType = ServerNicMethodType.EditNic;
    if (!isNullOrEmpty(nic.ipAddress)) {
      this.currentIpAddress = nic.ipAddress[0];
    }
    this._selectNetworkByName(nic.logicalNetworkName);
  }

  /**
   * Closes the edit window
   */
  public closeEditWindow(): void {
    this._resetNetworkValues();
  }

  /**
   * Deletes the selected NIC
   * @param nic NIC to be deleted
   */
  public deleteNic(nic: ServerNic): void {
    let dialogRef = this._dialogService.open(DeleteNicDialogComponent, {
      data: nic,
      size: 'medium'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (isNullOrEmpty(result)) { return; }

      let nicValues = new ServerManageNic();
      nicValues.name = this.manageNetwork.network.name;
      nicValues.clientReferenceObject = {
        serverId: this.server.id,
        nicId: nic.id
      };
      this._resetNetworkValues();
      this._serversService.deleteServerNic(this.server.id, nic.id, nicValues).subscribe();
    });
  }

  /**
   * Add NIC to the current server
   */
  public addNic(): void {
    let nicValues = new ServerManageNic();
    nicValues.name = this.manageNetwork.network.name;
    nicValues.ipAllocationMode = this.manageNetwork.ipAllocationMode;
    nicValues.ipAddress = this.manageNetwork.customIpAddress;
    nicValues.clientReferenceObject = {
      serverId: this.server.id,
      networkName: this.manageNetwork.network.name,
      ipAllocationMode: this.manageNetwork.ipAllocationMode,
      ipAddress: this.manageNetwork.customIpAddress
    };

    this.manageNetworkElement.reset();
    this._resetNetworkValues();

    this._serversService.setServerSpinner(this.server, nicValues);
    this._serversService.addServerNic(this.server.id, nicValues)
    .catch((error) => {
      this._serversService.clearServerSpinner(this.server, nicValues);
      return Observable.throw(error);
    })
    .subscribe();
  }

  /**
   * Updates the NIC data based on the selected NIC
   */
  public updateNic(): void {
    let nicValues = new ServerManageNic();
    nicValues.name = this.manageNetwork.network.name;
    nicValues.ipAllocationMode = this.manageNetwork.ipAllocationMode;
    nicValues.ipAddress = this.manageNetwork.customIpAddress;
    nicValues.clientReferenceObject = {
      serverId: this.server.id,
      nicId: this.selectedNic.id,
      networkName: this.manageNetwork.network.name,
      ipAllocationMode: this.manageNetwork.ipAllocationMode,
      ipAddress: this.manageNetwork.customIpAddress
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
          this._resetNetworkValues();
        }
      });
  }

  /**
   * Event that emits when the server selection was changed
   * `@Note:` Base implementation
   */
  protected serverSelectionChanged(): void {
    this._getResourceNetworks();
    if (!this._hasInProgressNic) { this._getServerNics(); }
  }

  /**
   * Reset network form values to initial
   */
  private _resetNetworkValues(): void {
    this.nicMethodType = ServerNicMethodType.AddNic;
    this.manageNetwork = new ServerManageNetwork();
    this.currentIpAddress = undefined;
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
   * Selects the network by its resource name
   * @param networkName Network name to be find in the resources
   */
  private _selectNetworkByName(networkName: string): void {
    if (isNullOrEmpty(networkName)) { return; }
    let foundNetwork = this.resourceNetworks.find((network) => {
      return network.name === networkName;
    });
    if (!isNullOrEmpty(foundNetwork)) {
      this.selectedNetwork = foundNetwork;
    }
  }

  /**
   * Event that emits when adding a server nic
   * @param job Emitted job content
   */
  private _onCreateServerNic(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    if (job.dataStatus === McsDataStatus.InProgress) {
      this._onAddingNic(job);
    } else {
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
    if (job.dataStatus === McsDataStatus.Success) { this._getServerNics(); }
    this._hasInProgressNic = job.dataStatus === McsDataStatus.InProgress;
  }

  /**
   * Will trigger if currently adding a NIC
   * @param job Emitted job content
   */
  private _onAddingNic(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Mock NIC data based on job response
    this._newNic = new ServerNic();
    this._newNic.logicalNetworkName = job.clientReferenceObject.networkName;
    this._newNic.ipAllocationMode = job.clientReferenceObject.ipAllocationMode;
    this._newNic.isProcessing = this.server.isProcessing;
  }

  /**
   * This will get and update the list of server nics
   */
  private _getServerNics(): void {
    unsubscribeSafely(this._updateNicsSubscription);

    this.dataStatusFactory.setInProgress();
    this._updateNicsSubscription = this._serversRepository
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
    unsubscribeSafely(this._networksSubscription);
    this._networksSubscription = this._serversResourcesRespository
      .findResourceNetworks(this.serverResource)
      .subscribe(() => {
        // Subscribe to update the snapshots in server instance
        this._changeDetectorRef.markForCheck();
      });
  }
}
