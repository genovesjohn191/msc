import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Injector
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import {
  Observable,
  Subject,
  of,
  Subscription
} from 'rxjs';
import {
  map,
  tap,
  shareReplay,
  takeUntil
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import {
  McsNavigationService,
  McsListViewListingBase
} from '@app/core';
import { McsApiService } from '@app/services';
import {
  McsInternetPort,
  RouteKey,
  McsQueryParam,
  McsApiCollection,
  McsRouteInfo
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  compareStrings
} from '@app/utilities';
import { McsEvent } from '@app/events';
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

export class InternetPortComponent extends McsListViewListingBase<McsInternetGroup> implements OnInit, OnDestroy {
  public selectedInternetPort$: Observable<McsInternetPort>;
  public selectedTabId$: Observable<string>;

  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    _translate: TranslateService,
    private _activatedRoute: ActivatedRoute,
    private _navigationService: McsNavigationService,
    private _internetPortService: InternetPortService,
    private _apiService: McsApiService
  ) {
    super(_injector, _changeDetectorRef, {
      dataChangeEvent: McsEvent.dataChangeInternetPorts,
      panelSettings: {
        inProgressText: _translate.instant('internet.loading'),
        emptyText: _translate.instant('internet.noInternetPorts'),
        errorText: _translate.instant('internet.errorMessage')
      }
    });
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToParamChange();
    this._subscribeToInternetPortResolve();
    this.listViewDatasource.registerSortPredicate(this._sortInternetGroupPredicate.bind(this));
  }

  public ngOnDestroy() {
    super.dispose();
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
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
  protected getEntityListing(query: McsQueryParam): Observable<McsApiCollection<McsInternetGroup>> {
    return this._apiService.getInternetPorts(query).pipe(
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

        let internetGroupsCollection = new McsApiCollection<McsInternetGroup>();
        internetGroupsCollection.collection = internetPortGroups;
        internetGroupsCollection.totalCollectionCount = internetPortGroups.length;
        return internetGroupsCollection;
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
    this._routerHandler = this.eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) =>
      this.selectedTabId$ = of(routeInfo && routeInfo.routePath)
    );
  }
}
