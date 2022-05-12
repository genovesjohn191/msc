import {
  Component,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector,
  ViewChild
} from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import {
  map,
  switchMap,
} from 'rxjs/operators';
import {
  McsNavigationService,
  McsAccessControlService,
  McsTableDataSource2,
  McsTableEvents,
  McsMatTableContext
} from '@app/core';
import {
  isNullOrEmpty,
  CommonDefinition,
  createObject,
  animateFactory,
} from '@app/utilities';
import {
  McsResourceStorage,
  RouteKey,
  McsResource,
  McsFeatureFlag,
  McsFilterInfo,
  McsQueryParam
} from '@app/models';
import { ColumnFilter } from '@app/shared';
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
  public isSorting: boolean;

  private _sortDirection: string;
  private _sortField: string;

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

  public ngOnDestroy() {
    this.dispose();
  }

  public get storageIconKey(): string {
    return CommonDefinition.ASSETS_SVG_STORAGE;
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
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
    const serviceCustomChangeFeatureFlag = this._accessControlService.hasAccessToFeature([McsFeatureFlag.OrderingServiceCustomChange]);

    return !isNullOrEmpty(serviceId) && serviceCustomChangeFeatureFlag &&
            this._accessControlService.hasPermission(['OrderEdit']);
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
      !isNullOrEmpty(storageProfile.serviceId);
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

  public onSortChange(sortState: Sort) {
    this.isSorting = true;
    this._sortDirection = sortState.direction;
    this._sortField = sortState.active;
    this.retryDatasource();
  }

  /**
   * An abstract method that get notified when the vdc selection has been changed
   */
  protected resourceChange(): void {
    this._getVdcStorage();
  }

  private _getVdcStorage(): Observable<McsMatTableContext<McsResourceStorage>> {
    let queryParam = new McsQueryParam();
    queryParam.sortDirection = this._sortDirection;
    queryParam.sortField = this._sortField;
    let optionalHeaders = new Map<string, any>();

    return this.resource$.pipe(
      switchMap((selectedResource) => {
        return this.apiService.getResourceStorages(selectedResource.id, optionalHeaders, queryParam).pipe(
        map(response => new McsMatTableContext(response?.collection,
          response?.totalCollectionCount)
        )
      )
    }))
  }
}
