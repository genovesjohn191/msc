import {
  Observable,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  takeUntil,
  tap,
  map,
  catchError
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
  McsAuthenticationIdentity,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsCompany,
  McsJob,
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
  unsubscribeSafely
} from '@app/utilities';
import { NotificationsService } from '../notifications.component.service';

@Component({
  selector: 'mcs-activities',
  templateUrl: './activities.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivitiesComponent implements OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsJob>;
  public readonly dataEvents: McsTableEvents<McsJob>;

  private _accountChangeHandler: Subscription;
  private _destroyIsSortingSubject = new Subject<void>();
  private _keyword: Search;

  @Output()
  public isSorting = new EventEmitter<boolean>();

  public constructor(
    _injector: Injector,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService,
    private _notificationService: NotificationsService
  ) {
    this.dataSource = new McsTableDataSource2(this._getJobs.bind(this));
    this.dataEvents = new McsTableEvents(_injector, this.dataSource, {
      dataChangeEvent: McsEvent.dataChangeJobs
    });
    this._subscribeToDataSourceSortingChange();
    this._registerEvents();
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

  public get activeCompany(): McsCompany {
    return this._authenticationIdentity.activeAccount;
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._accountChangeHandler);
    this.dataSource.disconnect(null);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public navigateToActivity(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }
    this._navigationService.navigateTo(RouteKey.Activity, [job.id]);
  }

  private _getJobs(param: McsMatTableQueryParam): Observable<McsMatTableContext<McsJob>> {
    this._notificationService.setActivitiesTotalCount(undefined);
    let queryParam = new McsQueryParam();
    queryParam.pageIndex = getSafeProperty(param, obj => obj.paginator.pageIndex);
    queryParam.pageSize = getSafeProperty(param, obj => obj.paginator.pageSize);
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getJobs(queryParam).pipe(
      map(response => {
        this._notificationService.setActivitiesTotalCount(response.totalCollectionCount);
        return new McsMatTableContext(response?.collection,
          response?.totalCollectionCount)
      }),
      catchError((error) => {
        this._notificationService.setActivitiesTotalCount(0);
        return throwError(error);
      })
    );
  }

  private _subscribeToDataSourceSortingChange(): void {
      this.dataSource.isSorting$.pipe(
      takeUntil(this._destroyIsSortingSubject),
      tap((isSorting) => {
        this.isSorting.emit(isSorting);
      })
    ).subscribe();
  }

  private _registerEvents(): void {
    this._accountChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.accountChange, () => this._changeDetectorRef.markForCheck()
    );
  }
}
