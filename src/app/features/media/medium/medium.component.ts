import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  Injector
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Subject,
  Observable,
  Subscription,
  of,
} from 'rxjs';
import {
  takeUntil,
  tap,
  shareReplay,
  map
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import {
  McsNavigationService,
  McsListViewListingBase
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  getSafeProperty,
  CommonDefinition,
  compareStrings
} from '@app/utilities';
import {
  RouteKey,
  McsResourceMedia,
  McsQueryParam,
  McsApiCollection,
  McsRouteInfo
} from '@app/models';
import { ComponentHandlerDirective } from '@app/shared';
import { McsApiService } from '@app/services';
import { McsEvent } from '@app/events';
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

export class MediumComponent extends McsListViewListingBase<McsMediaGroup> implements OnInit, OnDestroy {
  public media$: Observable<McsResourceMedia>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  @ViewChild(ComponentHandlerDirective, { static: false })
  private _componentHandler: ComponentHandlerDirective;

  public constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    _translate: TranslateService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _apiService: McsApiService,
    private _mediumService: MediumService
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeMedia,
      panelSettings: {
        inProgressText: _translate.instant('media.loading'),
        emptyText: _translate.instant('media.noMedia'),
        errorText: _translate.instant('media.errorMessage')
      }
    });
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToParamChange();
    this._subscribeToMediaResolve();
    this.listViewDatasource.registerSortPredicate(this._sortServerGroupPredicate.bind(this));
  }

  public ngOnDestroy() {
    super.dispose();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
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
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsMediaGroup>> {
    return this._apiService.getMedia(query).pipe(
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

        let mediaGroupsCollection = new McsApiCollection<McsMediaGroup>();
        mediaGroupsCollection.collection = mediaGroups;
        mediaGroupsCollection.totalCollectionCount = mediaGroups.length;
        return mediaGroupsCollection;
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
    this._routerHandler = this.eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) =>
      this.selectedTabId$ = of(routeInfo && routeInfo.routePath)
    );
  }
}
