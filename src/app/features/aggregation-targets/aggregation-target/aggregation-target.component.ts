import {
  Component,
  ChangeDetectionStrategy,
  Injector,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  Observable,
  Subject,
  Subscription,
  of
} from 'rxjs';
import {
  map,
  tap,
  shareReplay,
  takeUntil
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  McsBackUpAggregationTarget,
  RouteKey,
  McsQueryParam,
  McsApiCollection,
  McsRouteInfo
} from '@app/models';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  McsNavigationService,
  McsListViewListingBase
} from '@app/core';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
import {
  getSafeProperty,
  unsubscribeSafely,
  CommonDefinition,
  isNullOrEmpty,
  compareStrings
} from '@app/utilities';
import { AggregationTargetService } from './aggregation-target.service';

// Add another group type in here if you have addition tab
type tabGroupType = 'management';

@Component({
  selector: 'mcs-aggregation-target',
  templateUrl: './aggregation-target.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AggregationTargetComponent extends McsListViewListingBase<McsBackUpAggregationTarget> implements OnInit, OnDestroy {

  public selectedAggregationTarget$: Observable<McsBackUpAggregationTarget>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    _translate: TranslateService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _aggregationTargetService: AggregationTargetService
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeAggregationTargets,
      panelSettings: {
        inProgressText: _translate.instant('aggregationTargets.loading'),
        emptyText: _translate.instant('aggregationTargets.noData'),
        errorText: _translate.instant('aggregationTargets.errorMessage')
      }
    });
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToParamChange();
    this._subscribeToAggregationTargetResolve();
    this.listViewDatasource.registerSortPredicate(this._sortAggregationTargetPredicate.bind(this));
  }

  public ngOnDestroy() {
    super.dispose();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
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
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsBackUpAggregationTarget>> {
    return this._apiService.getBackupAggregationTargets(query);
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
    this._routerHandler = this.eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        this.selectedTabId$ = of(tabUrl);
      });
  }
}
