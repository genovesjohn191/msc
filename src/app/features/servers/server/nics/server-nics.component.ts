import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Subscription,
  throwError,
  Observable,
  of
} from 'rxjs';
import {
  catchError,
  shareReplay,
  tap,
  map
} from 'rxjs/operators';
import {
  CoreDefinition,
  McsDialogService,
  McsErrorHandlerService,
  McsTableDataSource,
  McsAccessControlService,
  CoreEvent,
  McsGuid
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  animateFactory,
  addOrUpdateArrayRecord,
  getSafeProperty
} from '@app/utilities';
import { ComponentHandlerDirective } from '@app/shared';
import {
  McsJob,
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
import { EventBusDispatcherService } from '@app/event-bus';
import {
  ServerManageNetwork,
  DeleteNicDialogComponent
} from '@app/features-shared';
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
const SERVER_NIC_NEW_ID = McsGuid.newGuid().toString();

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

  public currentIpAddress: string;
  public manageNetwork: ServerManageNetwork;
  public selectedNetwork: McsResourceNetwork;
  public selectedNic: McsServerNic;

  public nicsDataSource: McsTableDataSource<McsServerNic>;
  public nicsColumns: string[];

  private _newNic: McsServerNic;
  private _inProgressNicId: string;
  private _serverNicsCache: Observable<McsServerNic[]>;

  private _createNicHandler: Subscription;
  private _updateNicHandler: Subscription;
  private _deleteNicHandler: Subscription;

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
   * Returns true when there is a selected network when adding nic and the inputted is valid
   */
  public get inputIsValid(): boolean {
    return !isNullOrEmpty(this.manageNetwork)
      && this.manageNetwork.valid;
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
    _errorHandlerService: McsErrorHandlerService,
    _accessControl: McsAccessControlService,
    private _eventDispatcher: EventBusDispatcherService,
    private _translateService: TranslateService,
    private _serversService: ServersService,
    private _dialogService: McsDialogService
  ) {
    super(
      _resourcesRepository,
      _serversRepository,
      _serverService,
      _changeDetectorRef,
      _errorHandlerService,
      _accessControl
    );
    this.nicsColumns = [];
    this.nicsDataSource = new McsTableDataSource();
    this.manageNetwork = new ServerManageNetwork();
    this.nicMethodType = ServerNicMethodType.AddNic;
  }

  public ngOnInit() {
    this._setDataColumns();
    this._registerEvents();
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSafely(this._createNicHandler);
    unsubscribeSafely(this._updateNicHandler);
    unsubscribeSafely(this._deleteNicHandler);
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
          this._errorHandlerService.redirectToErrorPage(error.status);
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
            this._errorHandlerService.redirectToErrorPage(error.status);
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
          this._errorHandlerService.redirectToErrorPage(error.status);
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
    let newNicId = getSafeProperty(this._newNic, (obj) => obj.id);
    return nic.id === newNicId || nic.id === this._inProgressNicId;
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
    this._updateTableDataSource(server);
    this._getResourceNetworks(resource);
  }

  /**
   * Reset network form values to initial
   */
  private _resetNetworkValues(): void {
    this.nicMethodType = ServerNicMethodType.AddNic;
    this._serverNicsCache = null;
    this.manageNetwork = new ServerManageNetwork();
    this.currentIpAddress = undefined;
    if (!isNullOrEmpty(this._componentHandler)) {
      this._componentHandler.recreateComponent();
    }
  }

  /**
   * Register jobs/notifications events
   */
  private _registerEvents(): void {
    this._createNicHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerNicCreate, this._onCreateServerNic.bind(this)
    );

    this._updateNicHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerNicUpdate, this._onUpdateServerNic.bind(this)
    );

    this._deleteNicHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobServerNicDelete, this._onUpdateServerNic.bind(this)
    );

    // Invoke the event initially
    this._eventDispatcher.dispatch(CoreEvent.jobServerNicCreate);
    this._eventDispatcher.dispatch(CoreEvent.jobServerNicUpdate);
    this._eventDispatcher.dispatch(CoreEvent.jobServerNicDelete);
  }

  /**
   * Initializes the data source of the disks table
   */
  private _updateTableDataSource(server?: McsServer): void {
    let serverNicsDataSource: Observable<McsServerNic[]>;
    if (!isNullOrEmpty(server)) {
      serverNicsDataSource = this._serversRepository.getServerNics(server).pipe(
        tap((records) => this._serverNicsCache = of(records)));
    }
    let tableDataSource = isNullOrEmpty(this._serverNicsCache) ?
      serverNicsDataSource : this._serverNicsCache;

    let hasNewRecord = !isNullOrEmpty(this._newNic) && !isNullOrEmpty(tableDataSource);
    if (hasNewRecord) {
      tableDataSource = tableDataSource.pipe(
        map((result) => {
          result = addOrUpdateArrayRecord(result, this._newNic, false,
            (item) => item.id === SERVER_NIC_NEW_ID);
          return result;
        })
      );
    }
    this.nicsDataSource.updateDatasource(tableDataSource);
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
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) {
      this._newNic = null;
      this.refreshServerResource();
      return;
    }

    // Add in progress jobs
    this._newNic = new McsServerNic();
    this._newNic.id = SERVER_NIC_NEW_ID;
    this._newNic.logicalNetworkName = job.clientReferenceObject.nicName;
    this._newNic.ipAllocationMode = job.clientReferenceObject.nicIpAllocationMode;
    this._newNic.ipAddresses = [job.clientReferenceObject.nicIpAddress];
    this._updateTableDataSource();
  }

  /**
   * Event that emits when either updating or deleting a server nic
   * @param job Emitted job content
   */
  private _onUpdateServerNic(job: McsJob): void {
    let serverIsActive = this.serverIsActiveByJob(job);
    if (!serverIsActive) { return; }

    // Refresh everything when all job is done
    if (!job.inProgress) {
      this._inProgressNicId = null;
      this.refreshServerResource();
      return;
    }

    // Add in progress jobs
    this._inProgressNicId = job.clientReferenceObject.nicId;
  }

  /**
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.nicsColumns = Object.keys(
      this._translateService.instant('serverNics.columnHeaders')
    );
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
