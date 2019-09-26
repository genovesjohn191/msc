import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import {
  of,
  forkJoin,
  Observable
} from 'rxjs';
import {
  map,
  concatMap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  McsTableListingBase,
  McsNavigationService
} from '@app/core';
import {
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import {
  ServiceType,
  serviceTypeText,
  ServerCommand,
  RouteKey,
  McsServer,
  VmPowerstateCommand,
  McsServerDelete,
  McsQueryParam,
  McsApiCollection
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DialogConfirmation,
  DialogService
} from '@app/shared';
import { McsEvent } from '@app/events';
import { ServersService } from './servers.service';

@Component({
  selector: 'mcs-servers',
  templateUrl: './servers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServersComponent extends McsTableListingBase<McsServer>
  implements OnInit, OnDestroy {

  public hasCreateResources: boolean;
  public hasManagedResource: boolean;

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
    return CommonDefinition.ASSETS_SVG_PLUS;
  }

  public get startIconKey(): string {
    return CommonDefinition.ASSETS_SVG_PLAY;
  }

  public get stopIconKey(): string {
    return CommonDefinition.ASSETS_SVG_STOP;
  }

  public get restartIconKey(): string {
    return CommonDefinition.ASSETS_SVG_RESTART;
  }

  public get deleteIconKey(): string {
    return CommonDefinition.ASSETS_SVG_DELETE;
  }

  public get suspendIconKey(): string {
    return CommonDefinition.ASSETS_SVG_SUSPEND;
  }

  public get resumeIconKey(): string {
    return CommonDefinition.ASSETS_SVG_RESUME;
  }

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _dialogService: DialogService,
    private _serversService: ServersService
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeServers,
      dataClearEvent: McsEvent.dataClearServers
    });
  }

  public ngOnInit() {
    this._setResourcesFlag();
  }

  public ngOnDestroy() {
    this.dispose();
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Toggle all the servers
   * Servers that are processing are excluded
   */
  public toggleAllServersSelection() {
    if (isNullOrEmpty(this.selection)) { return; }
    this.selection.toggleAllItemsSelection((server) => !server.isProcessing);
  }

  /**
   * Returns true if all the servers are selected
   * Servers that are processing are excluded
   */
  public allServersAreSelected() {
    if (isNullOrEmpty(this.selection)) { return false; }
    return this.selection.allItemsAreSelected((server) => !server.isProcessing);
  }

  /**
   * Returns true when the selected action can be executed
   * @param propName Property name to be checked
   */
  public canExecuteAction(propName: string): boolean {
    if (isNullOrEmpty(this.selection) || !this.selection.hasSelecion()) { return false; }
    let someServersCannotExecute = this.selection.getSelectedItems()
      .find((selectedServer) => !selectedServer[propName]);
    return !someServersCannotExecute;
  }

  /**
   * PoweredOn multiple servers
   */
  public startMultipleServers(): void {
    this.selection.getSelectedItems().forEach((server) => {
      this._apiService.sendServerPowerState(server.id, {
        command: VmPowerstateCommand.Start,
        clientReferenceObject: {
          serverId: server.id
        }
      }).subscribe();
    });
    this.selection.clearAllSelection();
  }

  /**
   * Powered off multiple servers selected
   */
  public stopMultipleServers(): void {
    this.selection.getSelectedItems().forEach((server) => {
      this._apiService.sendServerPowerState(server.id, {
        command: VmPowerstateCommand.Stop,
        clientReferenceObject: {
          serverId: server.id
        }
      }).subscribe();
    });
    this.selection.clearAllSelection();
  }

  /**
   * Restart Multiple Servers
   */
  public restartMultipleServers(): void {
    this.selection.getSelectedItems().forEach((server) => {
      this._apiService.sendServerPowerState(server.id, {
        command: VmPowerstateCommand.Restart,
        clientReferenceObject: {
          serverId: server.id
        }
      }).subscribe();
    });
    this.selection.clearAllSelection();
  }

  /**
   * Delete multiple servers selected
   */
  public deleteMultipleServers(): void {
    let dialogData = {
      data: this.selection.getSelectedItems(),
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
    this.selection.clearAllSelection();
  }

  /**
   * Suspends multiple servers selected
   */
  public suspendMultipleServers(): void {
    let dialogData = {
      data: this.selection.getSelectedItems(),
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
    this.selection.clearAllSelection();
  }

  /**
   * Resume multiple servers selected
   */
  public resumeMultipleServers(): void {
    let dialogData = {
      data: this.selection.getSelectedItems(),
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
    this.selection.clearAllSelection();
  }

  /**
   * This will navigate to new server page
   */
  public onClickNewServerButton() {
    this._navigationService.navigateTo(RouteKey.ServerCreate);
  }

  /**
   * Navigate to server resouce page
   * @param server Server to be used as the data of the page
   */
  public navigateToResource(server: McsServer): void {
    if (isNullOrEmpty(server.platform)) { return; }
    this._navigationService.navigateTo(RouteKey.VdcDetails, [server.platform.resourceId]);
  }

  /**
   * Navigate to server details page
   * @param server Server to checked the details
   */
  public navigateToServer(server: McsServer): void {
    if (isNullOrEmpty(server) || server.isDisabled) { return; }
    this._navigationService.navigateTo(RouteKey.Servers, [server.id]);
  }

  /**
   * Returns the column settings key for the filter selector
   */
  public get columnSettingsKey(): string {
    return CommonDefinition.FILTERSELECTOR_SERVER_LISTING;
  }

  /**
   * Gets the entity listing based on the context
   * @param query Query to be obtained on the listing
   */
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsServer>> {
    return this._apiService.getServers(query);
  }

  /**
   * Initialize the server resources based on repository cache
   * and check whether the resource has self managed type
   */
  private _setResourcesFlag(): void {
    let managedResources = this._apiService.getResources().pipe(
      map((resources) => {
        this.hasManagedResource = resources && !!resources.collection.find((_resource) =>
          _resource.serviceType === ServiceType.Managed);
        this.changeDetectorRef.markForCheck();
      })
    );
    let createServerResources = this._serversService.getResourcesByAccess().pipe(
      map((response) => {
        this.hasCreateResources = !isNullOrEmpty(response);
        this.changeDetectorRef.markForCheck();
      })
    );
    managedResources.subscribe(() => createServerResources.subscribe());
  }
}
