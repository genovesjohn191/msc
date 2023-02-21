import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsAccessControlService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsStorageSaasBackup,
  McsFilterInfo,
  McsQueryParam,
  RouteKey,
  McsPermission,
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';
import {
  CommonDefinition,
  createObject,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-saas-backups',
  templateUrl: './saas-backups.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SaasBackupsComponent extends McsPageBase {

  public readonly dataSource: McsTableDataSource2<McsStorageSaasBackup>;
  public readonly dataEvents: McsTableEvents<McsStorageSaasBackup>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'billingDescription' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _accessControlService: McsAccessControlService,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2(this._getSaasBackups.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeSaasBackup
    });
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

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get featureName(): string {
    return 'saasBackup';
  }

  public validToShowContextMenuItems(saasBackup: McsStorageSaasBackup): boolean {
    return !isNullOrEmpty(saasBackup.portalUrl) ||
      (this._accessControlService.hasPermission([McsPermission.OrderEdit]) &&
        !isNullOrEmpty(saasBackup.serviceId) &&
        saasBackup.serviceChangeAvailable) ||
      (this._accessControlService.hasPermission([McsPermission.TicketCreate]) &&
        !isNullOrEmpty(saasBackup.serviceId));
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public navigateToSaasBackupDetails(saasBackup: McsStorageSaasBackup): void {
    if (isNullOrEmpty(saasBackup)) { return; }
    this._navigationService.navigateTo(RouteKey.SaasBackupDetails, [saasBackup.id]);
  }

  private _getSaasBackups(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsStorageSaasBackup>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getSaasBackups(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection, response?.totalCollectionCount)
      })
    );
  }
}
