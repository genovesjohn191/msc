import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Subscription,
  Subject,
  throwError,
  Observable
} from 'rxjs';
import {
  startWith,
  takeUntil,
  catchError,
  shareReplay
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsDialogService,
  McsNotificationEventsService,
  McsErrorHandlerService,
  McsLoadingService,
  McsTableDataSource,
  McsAccessControlService
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  animateFactory,
  unsubscribeSubject
} from '@app/utilities';
import { ComponentHandlerDirective } from '@app/shared';
import {
  McsJob,
  DataStatus,
  McsResourceNetwork,
  McsServerNic,
  McsServerCreateNic,
  McsServer,
  McsResource
} from '@app/models';
import {
  McsServersRepository,
  McsResourcesRepository
} from '@app/services';
import {
  DeleteNicDialogComponent,
  ServerManageNetwork
} from '../../shared';
import { ServerService } from '../server.service';
import { ServerDetailsBase } from '../server-details.base';
import { ServersService } from '../../servers.service';

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
  public resourceNetworks$: Observable<McsResourceNetwork[]>;

  public textContent: any;
  public currentIpAddress: string;
  public fcNetwork: FormControl;
  public manageNetwork: ServerManageNetwork;
  public selectedNetwork: McsResourceNetwork;
  public selectedNic: McsServerNic;

  public nicsDataSource: McsTableDataSource<McsServerNic>;
  public nicsColumns: string[];
  public manageNetworkTemplate: any[];

  private _networksSubscription: Subscription;
  private _newNic: McsServerNic;
  private _inProgressNicId: string;
  private _destroySubject = new Subject<void>();

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  /**
   * Returns the enum type of the server nic method
   */
  public get serverNicMethodTypeEnum(): any {
    return ServerNicMethodType;
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
    _resourcesRepository: McsResourcesRepository,
    _serversRepository: McsServersRepository,
    _serverService: ServerService,
    _changeDetectorRef: ChangeDetectorRef,
    _textProvider: McsTextContentProvider,
    _errorHandlerService: McsErrorHandlerService,
    _loadingService: McsLoadingService,
    _accessControl: McsAccessControlService,
    private _serversService: ServersService,
    private _dialogService: McsDialogService,
    private _notificationEvents: McsNotificationEventsService
  ) {
    super(
      _resourcesRepository,
      _serversRepository,
      _serverService,
      _changeDetectorRef,
      _textProvider,
      _errorHandlerService,
      _loadingService,
      _accessControl
    );
    this._newNic = new McsServerNic();
    this.nicsColumns = new Array();
    this.manageNetworkTemplate = [{}];
    this.manageNetwork = new ServerManageNetwork();
    this.nicMethodType = ServerNicMethodType.AddNic;
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers.server.nics;
    this._setDataColumns();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSubject(this._destroySubject);
    unsubscribeSafely(this._networksSubscription);
  }

  /**
   * Returns true when the nics has reached its limitation
   */
  public hasReachedNicsLimit(server: McsServer): boolean {
    return !isNullOrEmpty(server.nics) &&
      server.nics.length >= SERVER_MAXIMUM_NICS;
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
  public canAddNic(server: McsServer, resourceNetworks: McsResourceNetwork[]): boolean {
    return !this.hasReachedNicsLimit(server)
      && !isNullOrEmpty(resourceNetworks);
  }

  /**
   * Opens the edit nic window
   * @param nic NIC to be edited
   */
  public openEditNicWindow(nic: McsServerNic): void {
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
  public addNic(server: McsServer): void {
    let nicValues = new McsServerCreateNic();
    nicValues.name = this.manageNetwork.network.name;
    nicValues.ipAllocationMode = this.manageNetwork.ipAllocationMode;
    nicValues.ipAddress = this.manageNetwork.customIpAddress;
    nicValues.clientReferenceObject = {
      serverId: server.id,
      nicName: nicValues.name,
      nicIpAllocationMode: nicValues.ipAllocationMode,
      nicIpAddress: nicValues.ipAddress
    };

    this._serversService.setServerSpinner(server, nicValues);
    this._serversRepository.addServerNic(server.id, nicValues)
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(server, nicValues);
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Deletes the selected NIC
   * @param nic NIC to be deleted
   */
  public deleteNic(server: McsServer, nic: McsServerNic): void {
    let dialogRef = this._dialogService.open(DeleteNicDialogComponent, {
      data: nic,
      size: 'medium'
    });

    this.selectedNic = nic;
    dialogRef.afterClosed().subscribe((result) => {
      if (isNullOrEmpty(result)) { return; }

      let nicValues = new McsServerCreateNic();
      nicValues.name = this.selectedNic.logicalNetworkName;
      nicValues.clientReferenceObject = {
        serverId: server.id,
        nicId: this.selectedNic.id
      };

      this._serversService.setServerSpinner(server);
      this._serversRepository.deleteServerNic(server.id, this.selectedNic.id, nicValues)
        .pipe(
          catchError((error) => {
            this._serversService.clearServerSpinner(server);
            this._errorHandlerService.handleHttpRedirectionError(error.status);
            return throwError(error);
          })
        ).subscribe();
    });
  }

  /**
   * Updates the NIC data based on the selected NIC
   */
  public updateNic(server: McsServer): void {
    let nicValues = new McsServerCreateNic();
    nicValues.name = this.manageNetwork.network.name;
    nicValues.ipAllocationMode = this.manageNetwork.ipAllocationMode;
    nicValues.ipAddress = this.manageNetwork.customIpAddress;
    nicValues.clientReferenceObject = {
      serverId: server.id,
      nicId: this.selectedNic.id
    };

    this.closeEditNicWindow();
    this._serversService.setServerSpinner(server);
    this._serversRepository.updateServerNic(server.id, this.selectedNic.id, nicValues)
      .pipe(
        catchError((error) => {
          this._serversService.clearServerSpinner(server);
          this._errorHandlerService.handleHttpRedirectionError(error.status);
          return throwError(error);
        })
      ).subscribe();
  }

  /**
   * Returns true when inputted nic is currently in-progress
   * @param nic NIC to be checked
   */
  public nicIsInProgress(nic: McsServerNic): boolean {
    if (isNullOrEmpty(nic)) { return false; }
    return nic.id === this._inProgressNicId;
  }

  /**
   * Returns true when the edit nic link is enabled
   * @param nic Nic to be checked
   */
  public isEditNicEnabled(server: McsServer, nic: McsServerNic): boolean {
    if (isNullOrEmpty(nic)) { return false; }
    return server.isSelfManaged || !nic.isPrimary;
  }

  /**
   * Event that emits when the server selection was changed
   * `@Note:` Base implementation
   */
  protected selectionChange(server: McsServer, resource: McsResource): void {
    this.validateDedicatedFeatureFlag(server, 'EnableDedicatedVmNicView');
    this._resetNetworkValues();
    this._registerJobEvents();
    this._getResourceNetworks(resource);
    this._initializeDataSource(server);
  }

  /**
   * Initializes the data source of the nics table
   */
  private _initializeDataSource(server: McsServer): void {
    if (isNullOrEmpty(this.nicsDataSource)) {
      this.nicsDataSource = new McsTableDataSource(
        this._serversRepository.getServerNics(server)
      );
      return;
    }
    this.nicsDataSource.refreshDataRecords();
  }

  /**
   * Reset network form values to initial
   */
  private _resetNetworkValues(): void {
    this.nicMethodType = ServerNicMethodType.AddNic;
    this.manageNetwork = new ServerManageNetwork();
    this.currentIpAddress = undefined;
    if (!isNullOrEmpty(this._componentHandler)) {
      this._componentHandler.recreateComponent();
    }
  }

  /**
   * Register jobs/notifications events
   */
  private _registerJobEvents(): void {
    // Remove the previously subscription
    this._destroySubject.next();

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
    this.resourceNetworks$.subscribe((resourceNetworks) => {
      let foundNetwork = resourceNetworks.find((network) => {
        return network.name === networkName;
      });
      if (!isNullOrEmpty(foundNetwork)) {
        this.selectedNetwork = foundNetwork;
      }
    });
  }

  /**
   * Event that emits when adding a server nic
   * @param job Emitted job content
   */
  private _onCreateServerNic(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    switch (job.dataStatus) {
      case DataStatus.InProgress:
        this._onAddingNic(job);
        break;

      case DataStatus.Success:
        this.refreshServerResource();
      case DataStatus.Error:
      default:
        this.nicsDataSource.deleteRecordBy((item) => this._newNic.id === item.id);
        break;
    }
  }

  /**
   * Event that emits when either updating or deleting a server nic
   * @param job Emitted job content
   */
  private _onModifyServerNic(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Refresh the data when the nic in-progress is already completed
    let inProgressNicEnded = !isNullOrEmpty(this._inProgressNicId)
      && job.dataStatus === DataStatus.Success;
    if (inProgressNicEnded) { this.refreshServerResource(); }

    // Set the inprogress nic ID to be checked
    this._inProgressNicId = job.dataStatus === DataStatus.InProgress ?
      job.clientReferenceObject.nicId : undefined;
  }

  /**
   * Will trigger if currently adding a NIC
   * @param job Emitted job content
   */
  private _onAddingNic(job: McsJob): void {
    if (!this.serverIsActiveByJob(job)) { return; }

    // Mock NIC data based on job response
    this._newNic.id = this._inProgressNicId;
    this._newNic.logicalNetworkName = job.clientReferenceObject.nicName;
    this._newNic.ipAllocationMode = job.clientReferenceObject.nicIpAllocationMode;
    this._newNic.ipAddresses = [job.clientReferenceObject.nicIpAddress];
    this.nicsDataSource.addOrUpdateRecord(this._newNic);
  }

  /**
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.nicsColumns = Object.keys(this.textContent.columnHeaders);
    if (isNullOrEmpty(this.nicsColumns)) {
      throw new Error('column definition for nics was not defined');
    }
  }

  /**
   * Get the resource networks from the server
   */
  private _getResourceNetworks(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    this.resourceNetworks$ = this._resourcesRespository.getResourceNetworks(resource).pipe(
      shareReplay(1)
    );
  }
}
