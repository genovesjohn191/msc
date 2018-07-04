import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Subscription,
  Subject,
  throwError
} from 'rxjs';
import {
  startWith,
  takeUntil,
  catchError
} from 'rxjs/operators';
import {
  ResourceNetwork,
  ResourcesRepository
} from '../../../resources';
import {
  ServerNic,
  ServerCreateNic,
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
import {
  isNullOrEmpty,
  unsubscribeSafely,
  animateFactory,
  unsubscribeSubject
} from '../../../../utilities';
import { DeleteNicDialogComponent } from '../../shared';
import { ServersService } from '../../servers.service';
import { ServerService } from '../server.service';
import { ServersRepository } from '../../servers.repository';
import { ServerDetailsBase } from '../server-details.base';

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
  public textContent: any;
  public currentIpAddress: string;
  public fcNetwork: FormControl;
  public manageNetwork: ServerManageNetwork;
  public selectedNetwork: ResourceNetwork;
  public selectedNic: ServerNic;
  public dataStatusFactory: McsDataStatusFactory<ServerNic[]>;
  public manageNetworkTemplate: any[];

  private _updateNicsSubscription: Subscription;
  private _networksSubscription: Subscription;
  private _newNic: ServerNic;
  private _inProgressNicId: string;
  private _destroySubject = new Subject<void>();

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
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
  public get resourceNetworks(): ResourceNetwork[] {
    return !isNullOrEmpty(this.serverResource.networks) ?
      this.serverResource.networks : new Array();
  }

  /**
   * Returns the nic type based on the method currently invoked
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
    _resourcesRepository: ResourcesRepository,
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
      _resourcesRepository,
      _serversRepository,
      _serversService,
      _serverService,
      _changeDetectorRef,
      _textProvider,
      _errorHandlerService
    );
    this.manageNetworkTemplate = [{}];
    this.manageNetwork = new ServerManageNetwork();
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
    unsubscribeSubject(this._destroySubject);
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
   * Returns true when user can add nic
   */
  public get addNicEnabled(): boolean {
    return !this.hasReachedNicsLimit
      && !isNullOrEmpty(this.resourceNetworks);
  }

  /**
   * Returns true when the NIC data has been changed
   */
  public get editNicEnabled(): boolean {
    let modeNotChanged = this.manageNetwork.network.name === this.selectedNic.logicalNetworkName
      && this.manageNetwork.ipAllocationMode !== ServerIpAllocationMode.Manual
      && this.manageNetwork.ipAllocationMode === this.selectedNic.ipAllocationMode;
    if (modeNotChanged) { return false; }

    let ipAddressHasChanged = !isNullOrEmpty(this.manageNetwork.customIpAddress)
      && !isNullOrEmpty(this.selectedNic.ipAddresses)
      && this.inputIsValid;
    if (ipAddressHasChanged) {
      let ipAddressFound = this.selectedNic.ipAddresses.find((ip) => {
        return ip === this.manageNetwork.customIpAddress;
      });
      if (!isNullOrEmpty(ipAddressFound)) { return false; }
    }
    return this.inputIsValid;
  }

  /**
   * Opens the edit nic window
   * @param nic NIC to be edited
   */
  public openEditNicWindow(nic: ServerNic): void {
    if (isNullOrEmpty(nic)) { return; }
    this.selectedNic = nic;
    this.nicMethodType = ServerNicMethodType.EditNic;
    if (!isNullOrEmpty(nic.ipAddresses)) {
      this.currentIpAddress = nic.ipAddresses[0];
    }
    this._selectNetworkByName(nic.logicalNetworkName);
  }

  /**
   * Closes the edit nic window
   */
  public closeEditNicWindow(): void {
    this._resetNetworkValues();
  }

  /**
   * Add NIC to the current server
   */
  public addNic(): void {
    let nicValues = new ServerCreateNic();
    nicValues.name = this.manageNetwork.network.name;
    nicValues.ipAllocationMode = this.manageNetwork.ipAllocationMode;
    nicValues.ipAddress = this.manageNetwork.customIpAddress;
    nicValues.clientReferenceObject = {
      serverId: this.server.id,
      networkName: this.manageNetwork.network.name,
      ipAllocationMode: this.manageNetwork.ipAllocationMode,
      ipAddress: this.manageNetwork.customIpAddress
    };

    this._serversService.setServerSpinner(this.server, nicValues);
    this._serversService.addServerNic(this.server.id, nicValues)
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(this.server, nicValues);
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe();
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

    this.selectedNic = nic;
    dialogRef.afterClosed().subscribe((result) => {
      if (isNullOrEmpty(result)) { return; }

      let nicValues = new ServerCreateNic();
      nicValues.name = this.selectedNic.logicalNetworkName;
      nicValues.clientReferenceObject = {
        serverId: this.server.id,
        nicId: this.selectedNic.id
      };

      this._serversService.setServerSpinner(this.server, this.selectedNic);
      this._serversService.deleteServerNic(this.server.id, this.selectedNic.id, nicValues)
        .pipe(
          catchError((error) => {
            this._serversService.clearServerSpinner(this.server, this.selectedNic);
            this._errorHandlerService.handleHttpRedirectionError(error.status);
            return throwError(error);
          })
        ).subscribe();
    });
  }

  /**
   * Updates the NIC data based on the selected NIC
   */
  public updateNic(): void {
    let nicValues = new ServerCreateNic();
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

    this.closeEditNicWindow();
    this._serversService.setServerSpinner(this.server, this.selectedNic);
    this._serversService.updateServerNic(this.server.id, this.selectedNic.id, nicValues)
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(this.server, this.selectedNic);
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Returns true when inputted nic is currently in-progress
   * @param nic NIC to be checked
   */
  public nicIsInProgress(nic: ServerNic): boolean {
    if (isNullOrEmpty(nic)) { return false; }
    return nic.id === this._inProgressNicId;
  }

  /**
   * Event that emits when the server selection was changed
   * `@Note:` Base implementation
   */
  protected serverSelectionChanged(): void {
    this._resetNetworkValues();
    this._getResourceNetworks();
    this._getServerNics();
  }

  /**
   * Reset network form values to initial
   */
  private _resetNetworkValues(): void {
    this.nicMethodType = ServerNicMethodType.AddNic;
    this.manageNetwork = new ServerManageNetwork();
    this.currentIpAddress = undefined;

    // We need to set the first instance of the template
    // in order to re-initialize the network component and have fresh data
    this.manageNetworkTemplate[0] = {};
  }

  /**
   * Register jobs/notifications events
   */
  private _registerJobEvents(): void {
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

    switch (job.dataStatus) {
      case McsDataStatus.InProgress:
        this._onAddingNic(job);
        break;

      case McsDataStatus.Success:
        this.refreshServerResource();
      case McsDataStatus.Error:
      default:
        this._newNic = undefined;
        break;
    }
  }

  /**
   * Event that emits when either updating or deleting a server nic
   * @param job Emitted job content
   */
  private _onModifyServerNic(job: McsApiJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Refresh the data when the nic in-progress is already completed
    let inProgressNicEnded = !isNullOrEmpty(this._inProgressNicId)
      && job.dataStatus === McsDataStatus.Success;
    if (inProgressNicEnded) { this.refreshServerResource(); }

    // Set the inprogress nic ID to be checked
    this._inProgressNicId = job.dataStatus === McsDataStatus.InProgress ?
      job.clientReferenceObject.nicId : undefined;
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
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will get and update the list of server nics
   */
  private _getServerNics(): void {
    unsubscribeSafely(this._updateNicsSubscription);

    this.dataStatusFactory.setInProgress();
    this._updateNicsSubscription = this._serversRepository
      .findServerNics(this.server)
      .pipe(
        catchError((error) => {
          // Handle common error status code
          this.dataStatusFactory.setError();
          return throwError(error);
        })
      )
      .subscribe((response) => {
        this.dataStatusFactory.setSuccesfull(response);
      });
  }

  /**
   * Get the resource networks from the server
   */
  private _getResourceNetworks(): void {
    let hasResource = !isNullOrEmpty(this.serverResource) && !isNullOrEmpty(this.serverResource.id);
    if (!hasResource) { return; }

    this._networksSubscription = this._resourcesRespository
      .findResourceNetworks(this.serverResource)
      .subscribe(() => {
        // Subscribe to update the snapshots in server instance
      });
  }
}
