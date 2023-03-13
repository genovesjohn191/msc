import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import {
  McsMatTableConfig,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import {
  McsNotice,
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
  getSafeProperty,
  isNullOrEmpty,
  isNullOrUndefined
} from '@app/utilities';
import { NotificationsService } from '../notifications.component.service';

@Component({
  selector: 'mcs-notices',
  templateUrl: './notices.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoticesComponent implements OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsNotice>;
  public readonly dataEvents: McsTableEvents<McsNotice>;

  private _keyword: Search;

  public constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _navigationService: McsNavigationService,
    private _notificationService: NotificationsService
  ) {
    this.dataSource = new McsTableDataSource2<McsNotice>(this._getNotices.bind(this))
      .registerConfiguration(new McsMatTableConfig(true));
  }

  @ViewChild('paginator')
  public set paginator(value: Paginator) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerPaginator(value);
    }
  }

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
  }

  @Input()
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  @Input()
  public set search(value: Search) {
    if (this._keyword !== value) {
      this._keyword = value;
    }
    this.dataSource.registerSearch(value);
  }

  public get timeZone(): string {
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(isNullOrUndefined(timeZone) || !isNaN(+timeZone)){
      return 'Times displayed are in your local time zone.';
    }
    return 'Time Zone: ' + timeZone;
  }

  public ngOnDestroy(): void {
    this.dataSource.disconnect(null);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public navigateToNotice(notice: McsNotice): void {
    if (isNullOrEmpty(McsNotice)) { return; }
    this._navigationService.navigateTo(RouteKey.Notice, [notice.id]);
  }

  public removeHTMLTagAndFormat(description: string): string {
    if (isNullOrEmpty(description)) { return; }
    description = description.replace(/<\/p>/gi, '\r\n\r\n');
    description = description.replace(/<br ? \/?>/gi, '\r\n');
    description = description.replace(/(<([^>]+)>)/gi, '');
    return description;
  }

  private _getNotices(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsNotice>> {
    this._notificationService.setNoticesTotalCount(undefined);
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getNotices(queryParam).pipe(

      map(response => {
        this._notificationService.setNoticesTotalCount(response.totalCollectionCount);
        return new McsMatTableContext(response?.collection,
          response?.totalCollectionCount)
      }),
      catchError((error) => {
        this._notificationService.setNoticesTotalCount(0);
        return throwError(error);
      })
    );
  }
}
