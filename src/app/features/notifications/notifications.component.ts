import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  Observable,
  Subscription
} from 'rxjs';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import { map } from 'rxjs/operators';
import {
  McsAuthenticationIdentity,
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents,
  McsMatTableQueryParam,
  McsMatTableContext
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  createObject,
  getSafeProperty
} from '@app/utilities';
import { McsApiService } from '@app/services';
import {
  McsCompany,
  McsJob,
  RouteKey,
  McsQueryParam,
  McsFilterInfo
} from '@app/models';
import { McsEvent } from '@app/events';
import {
  ColumnFilter,
  Paginator,
  Search
} from '@app/shared';

@Component({
  selector: 'mcs-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationsComponent implements OnDestroy {

  public readonly dataSource: McsTableDataSource2<McsJob>;
  public readonly dataEvents: McsTableEvents<McsJob>;
  public readonly defaultColumnFilters: McsFilterInfo[] = [
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'notification' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'user' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'startTime' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'completed' })
  ];

  private _accountChangeHandler: Subscription;

  public constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService,
  ) {
    this.dataSource = new McsTableDataSource2(this._getJobs.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeJobs
    });
    this._registerEvents();
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

  public ngOnDestroy(): void {
    unsubscribeSafely(this._accountChangeHandler);
  }

  public get activeCompany(): McsCompany {
    return this._authenticationIdentity.activeAccount;
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  /**
   * Navigates to notification page
   * @param job Notification job on where to go
   */
  public navigateToNotification(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }
    this._navigationService.navigateTo(RouteKey.Notification, [job.id]);
  }

  private _getJobs(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsJob>> {
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getJobs(queryParam).pipe(
      map(response => new McsMatTableContext(response?.collection,
        response?.totalCollectionCount))
    );
  }

  /**
   * Register the events
   */
  private _registerEvents(): void {
    this._accountChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.accountChange, () => this._changeDetectorRef.markForCheck()
    );
  }
}