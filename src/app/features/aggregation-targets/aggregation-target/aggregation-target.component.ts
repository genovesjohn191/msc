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
  McsBackUpAggregationTarget,
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
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { AggregationTargetService } from './aggregation-target.service';

// Add another group type in here if you have addition tab
type tabGroupType = 'management';

@Component({
  selector: 'mcs-aggregation-target',
  templateUrl: './aggregation-target.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AggregationTargetComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsBackUpAggregationTarget>;
  public readonly dataEvents: McsTableEvents<McsBackUpAggregationTarget>;
  public selectedAggregationTarget$: Observable<McsBackUpAggregationTarget>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  constructor(
    _injector: Injector,
    _translate: TranslateService,
    private _eventDispatcher: EventBusDispatcherService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _aggregationTargetService: AggregationTargetService
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getAggregationTargets.bind(this),
      {
        sortPredicate: this._sortAggregationTargetPredicate.bind(this),
        panelSettings: {
          inProgressText: _translate.instant('aggregationTargets.loading'),
          emptyText: _translate.instant('aggregationTargets.noData'),
          errorText: _translate.instant('aggregationTargets.errorMessage')
        }
      }
    );
    this.dataEvents = new McsTableEvents(_injector, this.listviewDatasource, {
      dataChangeEvent: McsEvent.dataChangeAggregationTargets as any
    });
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToParamChange();
    this._subscribeToAggregationTargetResolve();
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

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public navitageToDetails(aggregationTarget: McsBackUpAggregationTarget): void {
    this._navigationService.navigateTo(RouteKey.BackupAggregationTargetsDetails, [aggregationTarget.id]);
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  public onTabChanged(tab: any): void {
    this._navigationService.navigateTo(
      RouteKey.BackupAggregationTargetsDetails,
      [this._aggregationTargetService.getAggregationTargetId(), tab.id as tabGroupType]
    );
  }

  /**
   * Subcribes to parameter change
   */
  private _subscribeToParamChange(): void {
    this._activatedRoute.paramMap.pipe(
      takeUntil(this._destroySubject),
      tap((params: ParamMap) => {
        let aggregationTargetId = params.get('id');
        if (isNullOrEmpty(aggregationTargetId)) { return; }

        this._aggregationTargetService.setAggregationTargetId(aggregationTargetId);
      })
    ).subscribe();
  }

  /**
   * Gets the entity listing from API
   */
  private _getAggregationTargets(
    param: McsListviewQueryParam
  ): Observable<McsListviewContext<McsBackUpAggregationTarget>> {
    let queryParam = new McsQueryParam();
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getBackupAggregationTargets(queryParam).pipe(
      map((aggregationTargets) => {
        return new McsListviewContext<McsBackUpAggregationTarget>(
          aggregationTargets?.collection
        );
      })
    );
  }

  /**
   * Subcribes to aggregation target resolve
   */
  private _subscribeToAggregationTargetResolve(): void {
    this.selectedAggregationTarget$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.aggregationTarget)),
      tap((aggregationTarget) => this._aggregationTargetService.setSelectedAggregationTarget(aggregationTarget)),
      shareReplay(1)
    );
  }

  /**
   * Sorting predicate for group
   */
  private _sortAggregationTargetPredicate(first: McsBackUpAggregationTarget, second: McsBackUpAggregationTarget): number {
    return compareStrings(first.description, second.description);
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
