import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
  OnDestroy
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsAccessControlService,
  McsMatTableContext,
  McsNavigationService,
  McsTableDataSource2
} from '@app/core';
import {
  McsFeatureFlag,
  McsFilterInfo,
  McsServer,
  McsServersQueryParams,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  coerceNumber,
  CommonDefinition,
  convertMbToGb,
  createObject,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-disk-panel',
  templateUrl: './disk-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class DiskPanelComponent implements OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsServer>;
  public readonly defaultColumnFilters2: McsFilterInfo[];

  private _selectedVdcStorageId: string;

  @Input()
  public set selectedVdcStorageId(value: string) {
    if (isNullOrEmpty(value)) { return; }
    this._selectedVdcStorageId = value;
    this.dataSource.updateDatasource(this._getServers.bind(this));
  }
  public get selectedVdcStorageId() {
    return this._selectedVdcStorageId;
  }

  constructor(
    _injector: Injector,
    private _accessControlService: McsAccessControlService,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService
  ) {
    this.dataSource = new McsTableDataSource2();
    this.defaultColumnFilters2 = [
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'server' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'diskSize' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'snapshotSize' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'totalSize' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
    ];
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters2);
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public ngOnDestroy() {
    this.dataSource.disconnect(null);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public getTotalSize(diskSize: number, snapshotSize: number): string {
    let totalSize = diskSize + snapshotSize;
    return this.convertSizeToGb(totalSize);
  }

  public convertSizeToGb(size: number): string {
    let convertedSize = convertMbToGb(size);
    let output = !isNullOrEmpty(convertedSize) ? `${coerceNumber(convertedSize.toFixed(1))} GB` : ``;
    return output;
  }

  public canRequestCustomChange(serviceId: string): boolean {
    const hasAccessToCustomChange = this._accessControlService.hasAccessToFeature([McsFeatureFlag.OrderingServiceCustomChange]);
    return !isNullOrEmpty(serviceId) && hasAccessToCustomChange && this._accessControlService.hasPermission(['OrderEdit']);
  }

  public canCreateTicket(serviceId: string): boolean {
    return !isNullOrEmpty(serviceId) && this._accessControlService.hasPermission(['TicketCreate']);
  }

  public hasActionsEnabled(server: McsServer): boolean {
    let hasRequestChangeAccess = this.canRequestCustomChange(server.serviceId);
    let hasTicketCreatePermission = this.canCreateTicket(server.serviceId);
    return hasTicketCreatePermission || hasRequestChangeAccess;
  }

  public navigateToServer(server: McsServer): void {
    if (isNullOrEmpty(server) || server.isDisabled) { return; }
    this._navigationService.navigateTo(RouteKey.Servers, [server.id]);
  }

  private _getServers(): Observable<McsMatTableContext<McsServer>> {
    let queryParam = new McsServersQueryParams();
    queryParam.storageProfile = this.selectedVdcStorageId;
    queryParam.expand = true;

    return this._apiService.getServers(queryParam).pipe(
      map((response) => {
        let servers = new McsMatTableContext(response?.collection,
          response?.totalCollectionCount);
        return servers;
      })
    )
  }
}