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
import { takeUntil } from 'rxjs/operators';
import { ServersResourcesRepository } from './servers-resources.repository';
import { ServersRepository } from './servers.repository';
import { ServersService } from './servers.service';
import { ServersDataSource } from './servers.datasource';
/** Models */
import {
  Server,
  ServerCommand,
  ServerServiceType
} from './models';
/** Shared */
import {
  ResetPasswordDialogComponent,
  DeleteServerDialogComponent,
  RenameServerDialogComponent,
  SuspendServerDialogComponent,
  ResumeServerDialogComponent
} from './shared';
/** Core */
import {
  McsTextContentProvider,
  CoreDefinition,
  McsBrowserService,
  McsDeviceType,
  McsSelection,
  McsTableListingBase,
  McsDialogService,
  McsAccessControlService
} from '../../core';
import {
  isNullOrEmpty,
  refreshView,
  getRecordCountLabel,
  unsubscribeSubject
} from '../../utilities';

@Component({
  selector: 'mcs-servers',
  templateUrl: './servers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServersComponent
  extends McsTableListingBase<ServersDataSource>
  implements OnInit, AfterViewInit, OnDestroy {

  public textContent: any;
  public enumDefinition: any;
  public selection: McsSelection<Server>;
  public hasResources: boolean;
  public hasManagedResource: boolean;
  private _destroySubject = new Subject<any>();

  public get serverCommand() {
    return ServerCommand;
  }

  public get excludedCommands(): ServerCommand[] {
    return [ServerCommand.Scale, ServerCommand.Clone];
  }

  public get recordsFoundLabel(): string {
    return getRecordCountLabel(
      this.totalRecordCount,
      this.textContent.dataSingular,
      this.textContent.dataPlural);
  }

  public get totalRecordCount(): number {
    return isNullOrEmpty(this._serversRepository) ? 0 :
      this._serversRepository.totalRecordsCount;
  }

  /**
   * Returns the excluded columns in the listing
   */
  public get excludedColumns(): string[] {
    // TODO: FUSION-1726 - Waiting for the permission to view managementIp for internal users
    let hasIpViewPermission = this.hasManagedResource &&
      this._accessControlService.hasPermission(['CompanyView']);
    return (hasIpViewPermission) ? undefined : ['managementIp'];
  }

  public get columnSettingsKey(): string {
    return CoreDefinition.FILTERSELECTOR_SERVER_LISTING;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
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
    private _dialogService: McsDialogService,
    private _textProvider: McsTextContentProvider,
    private _serversService: ServersService,
    private _serversRepository: ServersRepository,
    private _serversResourceRepository: ServersResourcesRepository,
    private _accessControlService: McsAccessControlService,
    private _router: Router
  ) {
    super(_browserService, _changeDetectorRef);
    this.selection = new McsSelection<Server>(true);
  }

  public ngOnInit() {
    this.textContent = this._textProvider.content.servers;
    this.enumDefinition = this._textProvider.content.enumerations;
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.initializeDatasource();
      this._validateResources();
      this._listenToSelectionModeChange();
      this._listenToDataChange();
    });
  }

  public ngOnDestroy() {
    this.dispose();
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Return true if all the displayed record is selected otherwise false
   */
  public isAllSelected(): boolean {
    if (isNullOrEmpty(this.dataSource)) { return false; }
    if (!this.selection.hasValue()) { return false; }

    let selectableRecords = this._serversRepository.filteredRecords
      .filter((record) => {
        return !record.isProcessing;
      });

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
      this._serversRepository.filteredRecords.forEach((record) => {
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
    let selectedServers: Server[] = new Array();

    // Get selected servers based on selection model
    this.selection.selected.forEach((selectedServer) => {
      let existingServer = this._serversRepository.filteredRecords
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
  public executeServerCommand(servers: Server | Server[], action: ServerCommand): void {
    if (isNullOrEmpty(servers)) { return; }
    let serverItems: Server[] = new Array();
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
    this._router.navigate(['./servers/create']);
  }

  /**
   * Return true when the server is currently deleting, otherwise false
   * @param server Server to be deleted
   */
  public serverDeleting(server: Server): boolean {
    return server.commandAction === ServerCommand.Delete && server.isProcessing;
  }

  /**
   * Navigate to server resouce page
   * @param server Server to be used as the data of the page
   */
  public navigateToResource(server: Server): void {
    if (isNullOrEmpty(server.platform)) { return; }
    this._router.navigate(['/servers/vdc', server.platform.resourceId]);
  }

  /**
   * Navigate to server details page
   * @param server Server to checked the details
   */
  public navigateToServer(server: Server): void {
    // Do not navigate to server details when server is deleting
    if (isNullOrEmpty(server) || this.serverDeleting(server)) { return; }
    this._router.navigate(['/servers/', server.id]);
  }

  /**
   * Retry obtaining datasource from server
   */
  public retryDatasource(): void {
    // We need to initialize again the datasource in order for the
    // observable merge work as expected, since it is closing the
    // subscription when error occured.
    this.initializeDatasource();
  }

  /**
   * Initialize the table datasource according to pagination and search settings
   */
  protected initializeDatasource(): void {
    // Set datasource instance
    this.dataSource = new ServersDataSource(
      this._serversRepository,
      this.paginator,
      this.search
    );
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Initialize the server resources based on repository cache
   * and check whether the resource has self managed type
   */
  private _validateResources(): void {
    this._serversResourceRepository.findAllRecords()
      .subscribe((resources) => {
        this.hasResources = !isNullOrEmpty(resources);
        if (!isNullOrEmpty(resources)) {
          this.hasManagedResource = !!resources.find(
            (resource) => resource.serviceType === ServerServiceType.Managed
          );
        }
        this.changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listener to selection mode change in all servers
   */
  private _listenToSelectionModeChange(): void {
    this.browserService.deviceTypeStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe((deviceType) => {
        let multipleSelection = !(deviceType === McsDeviceType.MobileLandscape ||
          deviceType === McsDeviceType.MobilePortrait);
        this.selection = new McsSelection<Server>(multipleSelection);
      });
  }

  /**
   * Listen to data records changes
   */
  private _listenToDataChange(): void {
    this._serversRepository.dataRecordsChanged
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.changeDetectorRef.markForCheck());
  }
}
