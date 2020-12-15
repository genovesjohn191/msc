import {
  forkJoin,
  of,
  Observable
} from 'rxjs';
import {
  concatMap,
  map
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  McsAccessControlService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents,
  McsTableSelection2
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  serviceTypeText,
  McsFilterInfo,
  McsQueryParam,
  McsServer,
  McsServerDelete,
  McsServerPowerstateCommand,
  RouteKey,
  ServerCommand,
  ServiceType,
  VmPowerstateCommand
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  DialogConfirmation,
  DialogService,
  Paginator,
  Search
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { ServersService } from './servers.service';

@Component({
  selector: 'mcs-servers',
  templateUrl: './servers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ServersComponent implements OnInit, OnDestroy {
  public hasCreateResources: boolean;
  public hasManagedResource: boolean;

  public readonly dataSource: McsTableDataSource2<McsServer>;
  public readonly dataSelection: McsTableSelection2<McsServer>;
  public readonly dataEvents: McsTableEvents<McsServer>;

  public readonly filterPredicate = this._isColumnIncluded.bind(this);
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'select' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'name' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'catalog' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'toolsVersion' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'managementIp' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'zone' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'resource' }),
    createObject(McsFilterInfo, { value: false, exclude: false, id: 'vApp' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  public constructor(
    _injector: Injector,
    private _changeDetectorRef: ChangeDetectorRef,
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService,
    private _translateService: TranslateService,
    private _apiService: McsApiService,
    private _dialogService: DialogService,
    private _serversService: ServersService
  ) {
    this.dataSource = new McsTableDataSource2(this._getServers.bind(this));
    this.dataSelection = new McsTableSelection2(this.dataSource, true);
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeServers,
      dataClearEvent: McsEvent.dataClearServers,
      entityDeleteEvent: McsEvent.entityDeletedEvent
    });
  }

  public ngOnInit() {
    this._setResourcesFlag();
  }

  public ngOnDestroy() {
    this.dataSource.disconnect(null);
    this.dataEvents.dispose();
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

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

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSearch(value);
    }
  }

  @ViewChild('paginator')
  public set paginator(value: Paginator) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerPaginator(value);
    }
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  public toggleAllServersSelection() {
    if (isNullOrEmpty(this.dataSelection)) { return; }
    this.dataSelection.toggleAllItemsSelection((server) => !server.isProcessing);
  }

  public allServersAreSelected() {
    if (isNullOrEmpty(this.dataSelection)) { return false; }
    return this.dataSelection.allItemsAreSelected((server) => !server.isProcessing);
  }

  public canExecuteAction(propName: string): boolean {
    if (isNullOrEmpty(this.dataSelection) || !this.dataSelection.hasSelecion()) { return false; }
    let someServersCannotExecute = this.dataSelection.getSelectedItems()
      .find((selectedServer) => !selectedServer[propName]);
    return !someServersCannotExecute;
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public startMultipleServers(): void {
    this.dataSelection.getSelectedItems().forEach((server) => {
      let powerState = new McsServerPowerstateCommand();
      powerState.command = VmPowerstateCommand.Start;
      powerState.clientReferenceObject = {
        serverId: server.id
      };

      this._apiService.sendServerPowerState(server.id, powerState).subscribe();
    });
    this.dataSelection.clearAllSelection();
  }

  public stopMultipleServers(): void {
    this.dataSelection.getSelectedItems().forEach((server) => {
      let powerState = new McsServerPowerstateCommand();
      powerState.command = VmPowerstateCommand.PowerOff;
      powerState.clientReferenceObject = {
        serverId: server.id
      };

      this._apiService.sendServerPowerState(server.id, powerState).subscribe();
    });
    this.dataSelection.clearAllSelection();
  }

  public restartMultipleServers(): void {
    this.dataSelection.getSelectedItems().forEach((server) => {
      let powerState = new McsServerPowerstateCommand();
      powerState.command = VmPowerstateCommand.Restart;
      powerState.clientReferenceObject = {
        serverId: server.id
      };

      this._apiService.sendServerPowerState(server.id, powerState).subscribe();
    });
    this.dataSelection.clearAllSelection();
  }

  public deleteMultipleServers(): void {
    let dialogData = {
      data: this.dataSelection.getSelectedItems(),
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
    this.dataSelection.clearAllSelection();
  }

  public suspendMultipleServers(): void {
    let dialogData = {
      data: this.dataSelection.getSelectedItems(),
      title: this._translateService.instant('dialogSuspendServerMultiple.title'),
      message: this._translateService.instant('dialogSuspendServerMultiple.message'),
      type: 'warning'
    } as DialogConfirmation<any>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return forkJoin(dialogResult.map((server) => {
          let powerState = new McsServerPowerstateCommand();
          powerState.command = VmPowerstateCommand.Suspend;
          powerState.clientReferenceObject = {
            serverId: server.id
          };

          return this._apiService.sendServerPowerState(server.id, powerState);
        }));
      })
    ).subscribe();
    this.dataSelection.clearAllSelection();
  }

  public resumeMultipleServers(): void {
    let dialogData = {
      data: this.dataSelection.getSelectedItems(),
      title: this._translateService.instant('dialogResumeServerMultiple.title'),
      message: this._translateService.instant('dialogResumeServerMultiple.message'),
      type: 'warning'
    } as DialogConfirmation<any>;

    let dialogRef = this._dialogService.openConfirmation(dialogData);

    dialogRef.afterClosed().pipe(
      concatMap((dialogResult) => {
        if (isNullOrEmpty(dialogResult)) { return of(null); }
        return forkJoin(dialogResult.map((server) => {
          let powerState = new McsServerPowerstateCommand();
          powerState.command = VmPowerstateCommand.Resume;
          powerState.clientReferenceObject = {
            serverId: server.id
          };

          return this._apiService.sendServerPowerState(server.id, powerState);
        }));
      })
    ).subscribe();
    this.dataSelection.clearAllSelection();
  }

  public onClickNewServerButton() {
    this._navigationService.navigateTo(RouteKey.ServerCreate);
  }

  public navigateToResource(server: McsServer): void {
    if (isNullOrEmpty(server.platform)) { return; }
    this._navigationService.navigateTo(RouteKey.VdcDetails, [server.platform.resourceId]);
  }

  public navigateToServer(server: McsServer): void {
    if (isNullOrEmpty(server) || server.isDisabled) { return; }
    this._navigationService.navigateTo(RouteKey.Servers, [server.id]);
  }

  private _getServers(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsServer>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getServers(queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection,
        response?.totalCollectionCount))
    );
  }

  private _setResourcesFlag(): void {
    let managedResources = this._apiService.getResources().pipe(
      map((resources) => {
        this.hasManagedResource = resources && !!resources.collection.find((_resource) =>
          _resource.serviceType === ServiceType.Managed);
        this._changeDetectorRef.markForCheck();
      })
    );
    let createServerResources = this._serversService.getResourcesByAccess().pipe(
      map((response) => {
        this.hasCreateResources = !isNullOrEmpty(response);
        this._changeDetectorRef.markForCheck();
      })
    );
    managedResources.subscribe(() => createServerResources.subscribe());
  }

  private _isColumnIncluded(filter: McsFilterInfo): boolean {
    if (filter.id === 'select') {
      return this._accessControlService.hasPermission([
        'DedicatedVmPowerStateEdit',
        'CloudVmManagementIpView'
      ]);
    }

    if (filter.id === 'managementIp') {
      return this._accessControlService.hasPermission([
        'DedicatedVmManagementIpView',
        'CloudVmManagementIpView'
      ]);
    }
    return true;
  }
}
