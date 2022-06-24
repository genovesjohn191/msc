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
  ExtenderType,
  extenderTypeText,
  McsExtenderService,
  McsFilterInfo,
  McsQueryParam,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-extenders',
  templateUrl: './extenders.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExtendersComponent extends McsPageBase {

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public readonly dataSource: McsTableDataSource2<McsExtenderService>;
  public readonly dataEvents: McsTableEvents<McsExtenderService>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'name' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceEnd' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'speed' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'haMode' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'linkedService' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
  ];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2(this._getExtenders.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeExtenders
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

  public get featureName(): string {
    return 'extenders';
  }

  public hasAccessToChangeSpeed(service: McsExtenderService): boolean {
    return !isNullOrEmpty(service.serviceId) &&
      service.serviceChangeAvailable &&
      service.serviceEnd === 'A' &&
      service.ExtenderTypeText === extenderTypeText[ExtenderType.ExtenderMtAz] &&
      this._accessControlService.hasPermission(['OrderEdit']) &&
      this._accessControlService.hasAccessToFeature('EnableChangePrivateCloudLaunchExtenderSpeed');
  }

  public onChangeSpeed(service: McsExtenderService): void {
    this._navigationService.navigateTo(RouteKey.OrderPrivateCloudChangeLaunchExtenderSpeed, [], {
      queryParams: {
        serviceId: service.serviceId
      }
    });
  }

  private _getExtenders(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsExtenderService>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getExtenders(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection,
        response?.totalCollectionCount)
      })
    );
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  /**
   * Navigate to create a ticket
   */
  public onRaiseTicket(service: McsExtenderService): void {
    return isNullOrEmpty(service.serviceId) ?
      this._navigationService.navigateTo(RouteKey.TicketCreate) :
      this._navigationService.navigateTo(RouteKey.TicketCreate, [], { queryParams: { serviceId: service.serviceId}});
  }
}
