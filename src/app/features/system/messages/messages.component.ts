import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import {
  CoreRoutes,
  McsAccessControlService,
  McsMatTableContext,
  McsMatTableQueryParam,
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
export class SystemMessagesComponent {
  public readonly dataSource: McsTableDataSource2<McsSystemMessage>;
  public readonly dataEvents: McsTableEvents<McsSystemMessage>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _accessControlService: McsAccessControlService,
    private _apiService: McsApiService,
    private _router: Router
  ) {
    this.dataSource = new McsTableDataSource2(this._getSystemMessages.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeSystemMessages,
      dataClearEvent: McsEvent.dataClearSystemMessage
    });
    this.defaultColumnFilters = [
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
    ];
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

  public navigateToSystemMessage(message: McsSystemMessage): void {
    if (isNullOrEmpty(message)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.SystemMessageEdit), message.id]);
  }

  public onClickNewMessage(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.SystemMessageCreate)]);
  }

  private _getSystemMessages(
    param: McsMatTableQueryParam
  ): Observable<McsMatTableContext<McsSystemMessage>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getSystemMessages(queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection,
        response?.totalCollectionCount))
    );
  }
}
