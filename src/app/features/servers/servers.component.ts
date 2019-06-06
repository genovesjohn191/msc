import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import {
  Subject,
  empty,
  of,
  forkJoin
} from 'rxjs';
import {
  takeUntil,
  map,
  catchError,
  concatMap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  CoreDefinition,
  McsBrowserService,
  McsTableListingBase,
  CoreRoutes,
  McsTableDataSource,
  McsTableSelection
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '@app/utilities';
import {
  ServiceType,
  serviceTypeText,
  ServerCommand,
  RouteKey,
  McsServer,
  VmPowerstateCommand,
  McsServerDelete
} from '@app/models';
import {
  McsResourcesRepository,
  McsServersRepository,
  McsApiService
} from '@app/services';
import {
  DialogConfirmation,
  DialogService
} from '@app/shared';
import { ServersService } from './servers.service';

@Component({
  selector: 'mcs-servers',
  templateUrl: './servers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServersComponent
  extends McsTableListingBase<McsTableDataSource<McsServer>>
  implements OnInit, AfterViewInit, OnDestroy {

  public serversSelection: McsTableSelection<McsServer>;
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
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _dialogService: DialogService,
    private _serversService: ServersService,
    private _serversRepository: McsServersRepository,
    private _resourcesRepository: McsResourcesRepository
  ) {
    super(_browserService, _changeDetectorRef);
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
   * Toggle all the servers
   * Servers that are processing are excluded
   */
  public toggleAllServersSelection() {
    if (isNullOrEmpty(this.serversSelection)) { return; }
    this.serversSelection.toggleAllItemsSelection((server) => !server.isProcessing);
  }

  /**
   * Returns true if all the servers are selected
   * Servers that are processing are excluded
   */
  public allServersAreSelected() {
    if (isNullOrEmpty(this.serversSelection)) { return false; }
    return this.serversSelection.allItemsAreSelected((server) => !server.isProcessing);
  }

  /**
   * Returns true when the selected action can be executed
   * @param propName Property name to be checked
   */
  public canExecuteAction(propName: string): boolean {
    if (isNullOrEmpty(this.serversSelection) || !this.serversSelection.someItemsAreSelected()) { return false; }
    let someServersCannotExecute = this.serversSelection.getSelectedItems()
      .find((selectedServer) => !selectedServer[propName]);
    return !someServersCannotExecute;
  }

  /**
   * PoweredOn multiple servers
   */
  public startMultipleServers(): void {
    this.serversSelection.getSelectedItems().forEach((server) => {
      this._apiService.sendServerPowerState(server.id, {
        command: VmPowerstateCommand.Start,
        clientReferenceObject: {
          serverId: server.id
        }
      }).subscribe();
    });
    this.serversSelection.clearAllSelection();
  }

  /**
   * Powered off multiple servers selected
   */
  public stopMultipleServers(): void {
    this.serversSelection.getSelectedItems().forEach((server) => {
      this._apiService.sendServerPowerState(server.id, {
        command: VmPowerstateCommand.Stop,
        clientReferenceObject: {
          serverId: server.id
        }
      }).subscribe();
    });
    this.serversSelection.clearAllSelection();
  }

  /**
   * Restart Multiple Servers
   */
  public restartMultipleServers(): void {
    this.serversSelection.getSelectedItems().forEach((server) => {
      this._apiService.sendServerPowerState(server.id, {
        command: VmPowerstateCommand.Restart,
        clientReferenceObject: {
          serverId: server.id
        }
      }).subscribe();
    });
    this.serversSelection.clearAllSelection();
  }

  /**
   * Delete multiple servers selected
   */
  public deleteMultipleServers(): void {
    let dialogData = {
      data: this.serversSelection.getSelectedItems(),
      title: this._translateService.instant('dialogDeleteServerMultiple.title'),
      message: this._translateService.instant('dialogDeleteServerMultiple.message'),
      type: 'warning'
    } as DialogConfirmation<McsServerDelete>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return forkJoin(dialogResult.map((server) => {
          let deleteDetails = new McsServerDelete();
          deleteDetails.clientReferenceObject = {
            serverId: server.id
          };
          return this._apiService.deleteServer(server.id, deleteDetails);
        }));
      })
    ).subscribe();
    this.serversSelection.clearAllSelection();
  }

  /**
   * Suspends multiple servers selected
   */
  public suspendMultipleServers(): void {
    let dialogData = {
      data: this.serversSelection.getSelectedItems(),
      title: this._translateService.instant('dialogSuspendServerMultiple.title'),
      message: this._translateService.instant('dialogSuspendServerMultiple.message'),
      type: 'warning'
    } as DialogConfirmation<any>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return forkJoin(dialogResult.map((server) => {
          return this._apiService.sendServerPowerState(server.id, {
            command: VmPowerstateCommand.Suspend,
            clientReferenceObject: {
              serverId: server.id
            }
          });
        }));
      })
    ).subscribe();
    this.serversSelection.clearAllSelection();
  }

  /**
   * Resume multiple servers selected
   */
  public resumeMultipleServers(): void {
    let dialogData = {
      data: this.serversSelection.getSelectedItems(),
      title: this._translateService.instant('dialogResumeServerMultiple.title'),
      message: this._translateService.instant('dialogResumeServerMultiple.message'),
      type: 'warning'
    } as DialogConfirmation<any>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return forkJoin(dialogResult.map((server) => {
          return this._apiService.sendServerPowerState(server.id, {
            command: VmPowerstateCommand.Resume,
            clientReferenceObject: {
              serverId: server.id
            }
          });
        }));
      })
    ).subscribe();
    this.serversSelection.clearAllSelection();
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
      CoreRoutes.getNavigationPath(RouteKey.VdcDetails),
      server.platform.resourceId
    ]);
  }

  /**
   * Navigate to server details page
   * @param server Server to checked the details
   */
  public navigateToServer(server: McsServer): void {
    // Do not navigate to server details when server is deleting
    if (isNullOrEmpty(server) || server.isDisabled) { return; }
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

    this.serversSelection = new McsTableSelection(this.dataSource, true);
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
    let createServerResources = this._serversService.getResourcesByAccess()
      .pipe(
        map((response) => {
          this.hasCreateResources = !isNullOrEmpty(response);
          this.changeDetectorRef.markForCheck();
        })
      );
    managedResources.pipe(
      catchError(() => empty())
    ).subscribe(() => createServerResources.subscribe());
  }

  /**
   * Listener to device changes
   */
  private _subscribeToBreakpointChanges(): void {
    this.browserService.breakpointChange()
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        if (!isNullOrEmpty(this.serversSelection)) {
          this.serversSelection.clearAllSelection();
        }
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
