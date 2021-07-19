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
  McsQueryParam,
  McsResourceMedia,
  McsRouteInfo,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  ComponentHandlerDirective,
  Search
} from '@app/shared';
import {
  compareStrings,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { MediumService } from './medium.service';

// Add another group type in here if you have addition tab
type tabGroupType = 'overview' | 'servers';

interface McsMediaGroup {
  groupName: string;
  media: McsResourceMedia[];
}

@Component({
  selector: 'mcs-medium',
  templateUrl: './medium.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediumComponent implements OnInit, OnDestroy {
  public readonly listviewDatasource: McsListviewDataSource2<McsMediaGroup>;
  public readonly dataEvents: McsTableEvents<McsMediaGroup>;
  public media$: Observable<McsResourceMedia>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  @ViewChild(ComponentHandlerDirective)
  private _componentHandler: ComponentHandlerDirective;

  public constructor(
    _injector: Injector,
    _translate: TranslateService,
    private _activatedRoute: ActivatedRoute,
    private _eventDispatcher: EventBusDispatcherService,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _mediumService: MediumService
  ) {
    this.listviewDatasource = new McsListviewDataSource2(
      this._getResourceMedia.bind(this),
      {
        sortPredicate: this._sortServerGroupPredicate.bind(this),
        panelSettings: {
          inProgressText: _translate.instant('media.loading'),
          emptyText: _translate.instant('media.noMedia'),
          errorText: _translate.instant('media.errorMessage')
        }
      }
    );
    this.dataEvents = new McsTableEvents(_injector, this.listviewDatasource, {
      dataChangeEvent: McsEvent.dataChangeMedia as any
    });
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToParamChange();
    this._subscribeToMediaResolve();
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

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get angleDoubleRightIconKey(): string {
    return CommonDefinition.ASSETS_SVG_NEXT_ARROW;
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Navigate to media listing
   */
  public gotoMedia(): void {
    this._navigationService.navigateTo(RouteKey.Media);
  }

  /**
   * Event that emits when the tab is changed in the routing tabgroup
   * @param tab Active tab
   */
  public onTabChanged(tab: any): void {
    this._navigationService.navigateTo(
      RouteKey.Medium,
      [this._mediumService.getMediaId(), tab.id as tabGroupType]
    );
  }

  /**
   * Gets the entity listing from API
   */
  private _getResourceMedia(param: McsListviewQueryParam): Observable<McsListviewContext<McsMediaGroup>> {
    let queryParam = new McsQueryParam();
    queryParam.keyword = getSafeProperty(param, obj => obj.search.keyword);

    return this._apiService.getMedia(queryParam).pipe(
      map((mediaList) => {
        let mediaGroups = new Array<McsMediaGroup>();
        mediaList.collection.forEach((media) => {
          let catalogName = getSafeProperty(media, (obj) => obj.catalogName, 'Others');
          let groupFound = mediaGroups.find((mediaGroup) => mediaGroup.groupName === catalogName);
          if (!isNullOrEmpty(groupFound)) {
            groupFound.media.push(media);
            return;
          }
          mediaGroups.push({
            groupName: catalogName,
            media: [media]
          });
        });
        return new McsListviewContext<McsMediaGroup>(mediaGroups);
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

        this._mediumService.setMediaId(mediaId);
        if (!isNullOrEmpty(this._componentHandler)) {
          this._componentHandler.recreateComponent();
        }
      })
    ).subscribe();
  }

  /**
   * Subcribes to medium resolve
   */
  private _subscribeToMediaResolve(): void {
    this.media$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.medium)),
      tap((medium) => this._mediumService.setSelectedMedium(medium)),
      shareReplay(1)
    );
  }

  /**
   * Sorting predicate for group
   */
  private _sortServerGroupPredicate(first: McsMediaGroup, second: McsMediaGroup): number {
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
