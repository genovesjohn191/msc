import {
  of,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil,
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
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  McsListviewContext,
  McsListviewDataSource2,
  McsListviewQueryParam,
  McsNavigationService,
  McsTableEvents
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsInternetPort,
  McsQueryParam,
  McsRouteInfo,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import { Search } from '@app/shared';
import {
  compareStrings,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { InternetPortService } from './internet-port.service';

type tabGroupType = 'Management';

interface McsInternetGroup {
  groupName: string;
  internetPorts: McsInternetPort[];
}

@Component({
  selector: 'mcs-internet-port',
  templateUrl: './internet-port.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InternetPortComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsInternetGroup>;
  public readonly dataEvents: McsTableEvents<McsInternetGroup>;
  public selectedInternetPort$: Observable<McsInternetPort>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  constructor(
    _injector: Injector,
    _translate: TranslateService,
    private _eventDispatcher: EventBusDispatcherService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _internetPortService: InternetPortService,
    private _apiService: McsApiService
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getInternetPorts.bind(this),
      {
        sortPredicate: this._sortInternetGroupPredicate.bind(this),
        panelSettings: {
          inProgressText: _translate.instant('internet.loading'),
          emptyText: _translate.instant('internet.noInternetPorts'),
          errorText: _translate.instant('internet.errorMessage')
        }
      }
    );
    this.dataEvents = new McsTableEvents(_injector, this.listviewDatasource, {
      dataChangeEvent: McsEvent.dataChangeInternetPorts as any
    });
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToParamChange();
    this._subscribeToInternetPortResolve();
  }

  public ngOnDestroy() {
    this.listviewDatasource.disconnect(null);
    this.dataEvents.dispose();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
  }

  @ViewChild('search')
  public set search(value: Search) {
    if (!isNullOrEmpty(value)) {
      this.listviewDatasource.registerSearch(value);
    }
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  public onTabChanged(tab: any) {
    this._navigationService.navigateTo(
      RouteKey.InternetDetails,
      [this._internetPortService.getInternetPortId(), tab.id as tabGroupType]
    );
  }

  /**
   * Gets the entity listing from API
   */
  private _getInternetPorts(param: McsListviewQueryParam): Observable<McsListviewContext<McsInternetGroup>> {
    let queryParam = new McsQueryParam();
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getInternetPorts(queryParam).pipe(
      map((internetPorts) => {
        let internetPortGroups = new Array<McsInternetGroup>();
        internetPorts.collection.forEach((internetPort) => {
          let availabilityZone = getSafeProperty(internetPort, (obj) => obj.availabilityZoneLabel);
          let groupFound = internetPortGroups.find((internetGroup) => internetGroup.groupName === availabilityZone);
          if (!isNullOrEmpty(groupFound)) {
            groupFound.internetPorts.push(internetPort);
            return;
          }
          internetPortGroups.push({
            groupName: availabilityZone,
            internetPorts: [internetPort]
          });
        });
        return new McsListviewContext<McsInternetGroup>(internetPortGroups);
      })
    );
  }

  /**
   * Subcribes to parameter change
   */
  private _subscribeToParamChange(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      tap((params: ParamMap) => {
        let mediaId = params.get('id');
        if (isNullOrEmpty(mediaId)) { return; }
        this._internetPortService.setInternetPortId(mediaId);
      })
    ).subscribe();
  }

  /**
   * Subcribes to internet port resolve
   */
  private _subscribeToInternetPortResolve(): void {
    this.selectedInternetPort$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.internetPort)),
      tap((internetPort: McsInternetPort) => this._internetPortService.setSelectedInternetPort(internetPort)),
      shareReplay(1)
    );
  }

  /**
   * Sorting predicate for group
   */
  private _sortInternetGroupPredicate(first: McsInternetGroup, second: McsInternetGroup): number {
    return compareStrings(first.groupName, second.groupName);
  }

  /**
   * Register Event dispatchers
   */
  private _registerEvents(): void {
    this._routerHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this.selectedTabId$ = of(tabUrl);
      });
  }
}
