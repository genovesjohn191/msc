import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
  takeUntil,
  map
} from 'rxjs/operators';
import { ServersService } from './servers.service';
import {
  ResetPasswordDialogComponent,
  DeleteServerDialogComponent,
  RenameServerDialogComponent,
  SuspendServerDialogComponent,
  ResumeServerDialogComponent
} from './shared';
import {
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  McsDialogService,
  CoreRoutes,
  McsTableDataSource
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '@app/utilities';
import {
  ServiceType,
  serviceTypeText,
  ServerCommand,
  Breakpoint,
  McsSelection,
  RouteKey,
  McsServer
} from '@app/models';
import {
  McsResourcesRepository,
  McsServersRepository
} from '@app/services';

@Component({
  selector: 'mcs-servers',
  templateUrl: './servers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServersComponent
  extends McsTableListingBase<McsTableDataSource<McsServer>>
  implements OnInit, AfterViewInit, OnDestroy {

  public selection: McsSelection<McsServer>;
  public hasCreateResources: boolean;
  public hasManagedResource: boolean;

  private _destroySubject = new Subject<any>();

  public get serverServiceTypeText(): any {
    return serviceTypeText;
  }

  public get serverCommand() {
    return ServerCommand;
  }

  public get excludedCommands(): ServerCommand[] {
    return [ServerCommand.Scale, ServerCommand.Clone];
  }

  public get addIconKey(): string {
    return CoreDefinition.ASSETS_FONT_PLUS;
  }

  public get startIconKey(): string {
    return CoreDefinition.ASSETS_SVG_START;
  }

  public get stopIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STOP;
  }

  public get restartIconKey(): string {
    return CoreDefinition.ASSETS_SVG_RESTART;
  }

  public get deleteIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOSE_BLACK;
  }

  public get suspendIconKey(): string {
    return CoreDefinition.ASSETS_SVG_SUSPEND;
  }

  public get resumeIconKey(): string {
    return CoreDefinition.ASSETS_SVG_RESUME;
  }

  public constructor(
    _browserService: McsBrowserService,
    _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _dialogService: McsDialogService,
    private _serversRepository: McsServersRepository,
    private _resourcesRepository: McsResourcesRepository,
    private _serversService: ServersService
  ) {
    super(_browserService, _changeDetectorRef);
    this.selection = new McsSelection<McsServer>(true);
  }

  public ngOnInit() {
    this._setResourcesFlag();
    this._subscribeToBreakpointChanges();
    this._subscribeToDataChange();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.initializeDatasource();
    });
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSubject(this._destroySubject);
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Return true if all the displayed record is selected otherwise false
   */
  public isAllSelected(): boolean {
    if (isNullOrEmpty(this.dataSource)) { return false; }
    if (!this.selection.hasValue()) { return false; }

    let selectableRecords = this.dataSource.dataRecords
      .filter((record) => !record.isProcessing);
    if (isNullOrEmpty(selectableRecords)) { return false; }

    return selectableRecords.length === this.selection.selected.length;
  }

  /**
   * Select all displayed record in the table
   */
  public toggleSelectAll(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }

    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.dataRecords.forEach((record) => {
        if (!record.isProcessing) {
          this.selection.select(record);
        }
      });
    }
  }

  /**
   * Returns true when the action can be executed based on the property value
   * @param propName Property name of the flag
   */
  public executableAction(propName: string): boolean {
    let hasNonExecutable = this.selection.selected.find((selectedServer) => {
      return !selectedServer[propName];
    });
    let canExecute = isNullOrEmpty(hasNonExecutable) && this.selection.hasValue();
    return canExecute;
  }

  /**
   * Execute the corresponding action based on top panel commands
   * @param action Action to be set
   */
  public executeTopPanelAction(action: ServerCommand) {
    if (!this.selection.hasValue()) { return; }
    let selectedServers: McsServer[] = new Array();

    // Get selected servers based on selection model
    this.selection.selected.forEach((selectedServer) => {
      let existingServer = this.dataSource.dataRecords
        .find((data) => data.id === selectedServer.id);
      selectedServers.push(existingServer);
    });

    // Execute server command
    this.executeServerCommand(selectedServers, action);
  }

  /**
   * Execute the server command according to inputs
   * @param servers Servers to process the action
   * @param action Action to be execute
   */
  public executeServerCommand(servers: McsServer | McsServer[], action: ServerCommand): void {
    if (isNullOrEmpty(servers)) { return; }
    let serverItems: McsServer[] = new Array();
    let dialogComponent = null;
    this.selection.clear();

    // Set server items based on instance if it is single or multiple
    !Array.isArray(servers) ? serverItems.push(servers) : serverItems = servers;

    // Set dialog references in case of Reset Password, Delete Server, Rename Server etc...
    switch (action) {
      case ServerCommand.ResetVmPassword:
        dialogComponent = ResetPasswordDialogComponent;
        break;

      case ServerCommand.Delete:
        dialogComponent = DeleteServerDialogComponent;
        break;

      case ServerCommand.Rename:
        dialogComponent = RenameServerDialogComponent;
        break;

      case ServerCommand.Suspend:
        dialogComponent = SuspendServerDialogComponent;
        break;

      case ServerCommand.Resume:
        dialogComponent = ResumeServerDialogComponent;
        break;

      default:
        serverItems.forEach((serverItem) => {
          this._serversService.executeServerCommand({ server: serverItem }, action);
          this.changeDetectorRef.markForCheck();
        });
        return;
    }

    // Check if the server action should be execute when the dialog result is true
    if (!isNullOrEmpty(dialogComponent)) {
      let dialogRef = this._dialogService.open(dialogComponent, {
        data: servers,
        size: 'medium'
      });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          serverItems.forEach((serverItem) => {
            this._serversService.executeServerCommand(
              { server: serverItem, result: dialogResult },
              action
            );
            this.changeDetectorRef.markForCheck();
          });
        }
      });
    }
  }

  /**
   * This will navigate to new server page
   */
  public onClickNewServerButton() {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.ServerCreate)]);
  }

  /**
   * Navigate to server resouce page
   * @param server Server to be used as the data of the page
   */
  public navigateToResource(server: McsServer): void {
    if (isNullOrEmpty(server.platform)) { return; }
    this._router.navigate([
      CoreRoutes.getNavigationPath(RouteKey.VdcDetail),
      server.platform.resourceId
    ]);
  }

  /**
   * Navigate to server details page
   * @param server Server to checked the details
   */
  public navigateToServer(server: McsServer): void {
    // Do not navigate to server details when server is deleting
    if (isNullOrEmpty(server) || server.isDeleting) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Servers), server.id]);
  }

  /**
   * Retry obtaining datasource from server
   */
  public retryDatasource(): void {
    this.initializeDatasource();
  }

  /**
   * Returns the column settings key for the filter selector
   */
  protected get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_SERVER_LISTING;
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    this.dataSource = new McsTableDataSource(this._serversRepository);
    this.dataSource
      .registerSearch(this.search)
      .registerPaginator(this.paginator);
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Initialize the server resources based on repository cache
   * and check whether the resource has self managed type
   */
  private _setResourcesFlag(): void {
    let managedResources = this._resourcesRepository.getAll()
      .pipe(
        map((resources) => {
          this.hasManagedResource = !!resources.find((_resource) =>
            _resource.serviceType === ServiceType.Managed);
          this.changeDetectorRef.markForCheck();
        })
      );
    let createServerResources = this._resourcesRepository.getResourcesByFeature()
      .pipe(
        map((response) => {
          this.hasCreateResources = !isNullOrEmpty(response);
          this.changeDetectorRef.markForCheck();
        })
      );
    managedResources.subscribe(() => createServerResources.subscribe());
  }

  /**
   * Listener to device changes
   */
  private _subscribeToBreakpointChanges(): void {
    this.browserService.breakpointChange()
      .pipe(takeUntil(this._destroySubject))
      .subscribe((deviceType) => {
        let multipleSelection = !(deviceType === Breakpoint.Small ||
          deviceType === Breakpoint.XSmall);
        this.selection = new McsSelection<McsServer>(multipleSelection);
      });
  }

  /**
   * Listen to data records changes
   */
  private _subscribeToDataChange(): void {
    this._serversRepository.dataChange()
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }
}
