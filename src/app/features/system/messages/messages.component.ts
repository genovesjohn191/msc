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
import { Router } from '@angular/router';
import {
  CoreRoutes,
  McsAccessControlService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsPageBase,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { McsEvent } from '@app/events';
import {
  McsFilterInfo,
  McsPermission,
  McsQueryParam,
  McsSystemMessage,
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
  selector: 'mcs-system-messages',
  templateUrl: './messages.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})
export class SystemMessagesComponent extends McsPageBase {
  public readonly dataSource: McsTableDataSource2<McsSystemMessage>;
  public readonly dataEvents: McsTableEvents<McsSystemMessage>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'message' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'start' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'expiry' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'type' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'severity' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'enabled' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdOn' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'createdBy' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'updatedOn' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'updatedBy' })
  ];;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _accessControlService: McsAccessControlService,
    private _apiService: McsApiService,
    private _router: Router
  ) {
    super(_injector);
    this.dataSource = new McsTableDataSource2(this._getSystemMessages.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeSystemMessages,
      dataClearEvent: McsEvent.dataClearSystemMessage
    });
  }

  public get featureName(): string {
    return 'system-message';
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get addIconKey(): string {
    return CommonDefinition.ASSETS_SVG_PLUS;
  }

  public get timeZone(): string {
    return CommonDefinition.TIMEZONE_SYDNEY;
  }

  public get hasSystemMessageEditAccess(): boolean {
    return this._accessControlService.hasPermission([McsPermission.SystemMessageEdit]);
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

  public navigateToSystemMessage(message: McsSystemMessage): void {
    if (isNullOrEmpty(message)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.SystemMessageEdit), message.id]);
  }

  public onClickNewMessage(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.SystemMessageCreate)]);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  private _getSystemMessages(
    param: McsMatTableQueryParam
  ): Observable<McsMatTableContext<McsSystemMessage>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getSystemMessages(queryParam).pipe(
      map(response => {
        return new McsMatTableContext(response?.collection,
          response?.totalCollectionCount)
      })
    );
  }
}
