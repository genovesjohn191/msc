import { Observable } from 'rxjs';
import {
  map,
  switchMap,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsAccessControlService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import {
  McsFeatureFlag,
  McsFilterInfo,
  McsQueryParam,
  McsResource,
  McsResourceStorage,
  PlatformType,
  RouteKey
} from '@app/models';
import { ColumnFilter } from '@app/shared';
import {
  animateFactory,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

import { VdcDetailsBase } from '../vdc-details.base';

@Component({
  selector: 'mcs-vdc-storage',
  templateUrl: './vdc-storage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  },
  animations: [
    animateFactory.expansionVertical
  ]
})

export class VdcStorageComponent extends VdcDetailsBase implements OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsResourceStorage>;
  public readonly dataEvents: McsTableEvents<McsResourceStorage>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  public expandedElement: McsResourceStorage;
  public selectedVdcStorageId: string;
  
  private _resourcePlatformIsVcloud: boolean;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _accessControlService: McsAccessControlService,
  ) {
    super(_injector, _changeDetectorRef);
    this.dataSource = new McsTableDataSource2(this._getVdcStorage.bind(this));
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'storageProfile' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'usage' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'tier' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'state' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
    ];
    if (this.hasAccessToStorageProfileBreakdown) {
      this.defaultColumnFilters.unshift(
        createObject(McsFilterInfo, { value: true, exclude: true, id: 'select' })
      )
    }
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
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

  public ngOnDestroy() {
    this.dispose();
  }

  public get storageIconKey(): string {
    return CommonDefinition.ASSETS_SVG_STORAGE;
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get storageRefreshMessage(): string {
    if (this._resourcePlatformIsVcloud) {
      return this.translateService.instant('serversVdcOverview.shared.storageProfiles.storageRefreshMessage');
    }
    return this.translateService.instant('serversVdcOverview.shared.datastores.storageRefreshMessage')
  }

  public get storageColumnHeader(): string {
    if (this._resourcePlatformIsVcloud) {
      return this.translateService.instant('columnHeader.storageProfile');
    }
    return this.translateService.instant('columnHeader.datastore')
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public setExpandedRow(expandedRow: McsResourceStorage, row: McsResourceStorage): any {
    this.selectedVdcStorageId = row.id;
    return expandedRow === row ? null : row;
  }

  public get hasAccessToStorageProfileBreakdown(): boolean {
    return this._accessControlService.hasAccessToFeature([McsFeatureFlag.StorageProfileBreakdown]);
  }

  public canRequestCustomChange(serviceId: string): boolean {
    return !isNullOrEmpty(serviceId) && this._accessControlService.hasPermission(['OrderEdit']);
  }

  public canCreateTicket(serviceId: string): boolean {
    return !isNullOrEmpty(serviceId) &&
      this._accessControlService.hasPermission([
        'TicketCreate'
      ]);
  }

  public canExpandVdcStorage(storageProfile: McsResourceStorage): boolean {
    return this._accessControlService.hasPermission(['OrderEdit']) &&
      storageProfile.enabled &&
      storageProfile.serviceChangeAvailable &&
      !isNullOrEmpty(storageProfile.serviceId) &&
      this._resourcePlatformIsVcloud;
  }

  public hasActionsEnabled(resourceDetails: McsResource, resourceStorage: McsResourceStorage): boolean {
    let hasRequestChangeAccess = this.canRequestCustomChange(resourceStorage.serviceId);
    let hasTicketCreatePermission = this.canCreateTicket(resourceStorage.serviceId);
    let resourceStorageIsExpandable = this.canExpandVdcStorage(resourceStorage);

    return resourceStorageIsExpandable || hasTicketCreatePermission || hasRequestChangeAccess;
  }

  /**
   * Navigate to Ordering Expand Vdc Storage
   */
  public navigateToExpandVdcStorage(resourceDetails: McsResource, resourceStorage: McsResourceStorage): void {
    this._navigationService.navigateTo(RouteKey.OrderVdcStorageExpand, [],
      { queryParams: {
        resourceId : resourceDetails.id,
        storageId : resourceStorage.id
      }}
    );
  }

  /**
   * An abstract method that get notified when the vdc selection has been changed
   */
  protected resourceChange(): void {
    this._getVdcStorage();
  }

  private _getVdcStorage(param?: McsMatTableQueryParam): Observable<McsMatTableContext<McsResourceStorage>> {
    let queryParam = new McsQueryParam();
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);
    let optionalHeaders = new Map<string, any>();

    return this.resource$.pipe(
      switchMap((selectedResource: McsResource) => {
        this._resourcePlatformIsVcloud = selectedResource.platform === PlatformType.VCloud;
        return this.apiService.getResourceStorages(selectedResource.id, optionalHeaders, queryParam).pipe(
        map(response => new McsMatTableContext(response?.collection,
          response?.totalCollectionCount)
        )
      )
    }))
  }
}
