import {
  Observable,
  Subscription
} from 'rxjs';
import { map } from 'rxjs/operators';

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
  McsAuthenticationIdentity,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsNavigationService,
  McsPageBase,
  McsTableDataSource2,
  McsTableEvents
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsCompany,
  McsFilterInfo,
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
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

@Component({
  selector: 'mcs-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationsComponent extends McsPageBase implements OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsJob>;
  public readonly dataEvents: McsTableEvents<McsJob>;
  public readonly filterPredicate = this._isColumnIncluded.bind(this);
  public readonly defaultColumnFilters = [
    createObject(McsFilterInfo, { value: false, exclude: false, id: 'id' }),
    createObject(McsFilterInfo, { value: true, exclude: true, id: 'notification' }),
    createObject(McsFilterInfo, { value: false, exclude: false, id: 'serviceId' }),
    createObject(McsFilterInfo, { value: true, exclude: false, id: 'targetCompany' }),
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
    private _accessControlService: McsAccessControlService,
  ) {
    super(_injector);
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

  @ViewChild('sort')
  public set sort(value: MatSort) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerSort(value);
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._accountChangeHandler);
  }

  public get featureName(): string {
    return 'notifications';
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
    queryParam.sortDirection = getSafeProperty(param, obj => obj.sort.direction);
    queryParam.sortField = getSafeProperty(param, obj => obj.sort.active);

    return this._apiService.getJobs(queryParam).pipe(

      map(response => {
        return new McsMatTableContext(response?.collection,
          response?.totalCollectionCount)
      })
    );
  }

  private _isInLPContext(): boolean {
    let _isImpersonating = !!this._authenticationIdentity.activeAccountStatus;
    if (this._accessControlService.hasPermission(['InternalEngineerAccess']) && !_isImpersonating) {
      return true;
    }
    return false;
  }

  private _isColumnIncluded(filter: McsFilterInfo): boolean {
    if (filter.id === 'serviceId') {
      return this._isInLPContext();
    }

    if (filter.id === 'targetCompany') {
      return this._isInLPContext();
    }
    return true;
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
