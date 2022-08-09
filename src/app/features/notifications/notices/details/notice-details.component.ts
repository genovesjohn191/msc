import {
  of,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  McsAuthenticationIdentity,
  McsListviewContext,
  McsListviewDataSource2,
  McsListviewQueryParam,
  McsNavigationService,
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsNotice,
  McsQueryParam,
  McsRouteInfo,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { Search } from '@app/shared';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  compareDates
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import { NoticeDetailsService } from './notice-details.component.service';

type tabGroupType = 'overview' | 'associated-service';

@Component({
  selector: 'mcs-notice-details',
  templateUrl: './notice-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoticeDetailsComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsNotice>;
  public selectedNotice$: Observable<McsNotice>;
  public selectedTabId$: Observable<string>;
  public isDownloadingIcs: boolean = false;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  public constructor(
    _injector: Injector,
    private _translate: TranslateService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _eventDispatcher: EventBusDispatcherService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _noticeDetailsService: NoticeDetailsService,
    private _apiService: McsApiService
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getNoticeList.bind(this),
      {
        sortPredicate: this._sortNoticePredicate.bind(this),
        panelSettings: {
          inProgressText: _translate.instant('notifications.notices.loading'),
          emptyText: _translate.instant('notifications.notices.noRecordsFoundMessage'),
          errorText: _translate.instant('notifications.notices.errorMessage')
        }
      }
    );
    this._registerEvents();
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.listviewDatasource.registerSearch(value);
    }
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get tracksNoticeUrl(): string {
    let tracksUrl = this._authenticationIdentity?.metadataLinks?.find((link) =>
      link.key === 'tracks_host')?.value;
    return `${tracksUrl}/u_notification_task.do?sys_id=`;
  }
  
  public get selectedNoticeId(): string {
    return this._noticeDetailsService.getNoticeId();
  }

  public get overviewTabLabel(): string {
    return this._translate.instant('notifications.notices.details.overview.tabName');
  }

  public get associatedServiceTabLabel(): string {
    return this._translate.instant('notifications.notices.details.associatedService.tabName');
  }

  public ngOnInit() {
    this._subscribeToNoticeResolver();
  }

  public ngOnDestroy() {
    this.listviewDatasource.disconnect(null);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
  }

  public onTabChanged(tab: any) {
    switch(tab.id){
      case 'overview':
        this._navigationService.navigateTo(
          RouteKey.Notice,
          [this._noticeDetailsService.getNoticeId(), tab.id as tabGroupType]
        );
        break;
      case 'associated-service':
        this._navigationService.navigateTo(
          RouteKey.Notice,
          [this._noticeDetailsService.getNoticeId(), tab.id as tabGroupType]
        );
        break;
    }
  }

  public openTracks(uuid: string): string {
    let noticeId = uuid.replace(/-/g, "");
    return `${this.tracksNoticeUrl}${noticeId}`
  }

  private _getNoticeList(
    param: McsListviewQueryParam
  ): Observable<McsListviewContext<McsNotice>> {
    let queryParam = new McsQueryParam();
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getNotices(queryParam).pipe(
      map((networkDns) => {
        return new McsListviewContext<McsNotice>(networkDns?.collection);
      })
    );
  }
  
  private _subscribeToNoticeResolver(): void {
    this.selectedNotice$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.notice) as McsNotice),
      tap((notice) => {
        if (isNullOrEmpty(notice)) { return; }
        this._noticeDetailsService.setNoticeDetails(notice);
      }),
      shareReplay(1)
    );
  }

  private _sortNoticePredicate(first: McsNotice, second: McsNotice): number {
    return compareDates(first.createdOn, second.createdOn);
  }

  private _registerEvents(): void {
    this._routerHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this.selectedTabId$ = of(tabUrl);
      });
  }
}