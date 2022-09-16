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
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsResource,
  McsQueryParam,
  RouteKey,
  PlatformType,
  ServiceType
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
  selector: 'mcs-resources',
  templateUrl: './resources.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ResourcesComponent extends McsPageBase {

  public readonly dataSource: McsTableDataSource2<McsResource>;
  public readonly dataEvents: McsTableEvents<McsResource>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'resource' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'vCPU' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'ram' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'zone' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  public isSorting: boolean;

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2(this._getResources.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeResources
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
    return 'resources';
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public isResourceTypeVCloud(resource: McsResource): boolean {
    return resource.platform === PlatformType.VCloud;
  }

  public isResourceTypeVCenter(resource: McsResource): boolean {
    return resource.platform === PlatformType.VCenter;
  }

  public isResourceManaged(resource: McsResource): boolean {
    return resource.serviceType === ServiceType.Managed;
  }

  public validToShowContextMenuItems(resource: McsResource): boolean {
    return !isNullOrEmpty(resource.portalUrl) || this.metExpectedPropertyValues(resource);
  }

  public metExpectedPropertyValues(resource: McsResource): boolean {
    return resource.serviceChangeAvailable && !isNullOrEmpty(resource.serviceId);
  }

  public navigateToResource(resource: McsResource): void {
    if (isNullOrEmpty(resource)) { return; }
    this._navigationService.navigateTo(RouteKey.ResourceDetails, [resource.id]);
  }

  public navigateToScaleVdc(serviceId: string): void {
    this._navigationService.navigateTo(RouteKey.OrderVdcScale, [],
      { queryParams: {
        serviceId: serviceId
      }});
  }

  public navigateToExpandVdcStorage(resourceId: string): void {
    this._navigationService.navigateTo(RouteKey.OrderVdcStorageExpand, [],
      { queryParams: {
        resourceId: resourceId
      }});
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _getResources(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsResource>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getResources(null, queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }
}
