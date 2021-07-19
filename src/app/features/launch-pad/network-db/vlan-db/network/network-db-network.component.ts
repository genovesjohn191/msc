import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { McsNavigationService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';

import {
  McsNetworkDbNetwork,
  McsRouteInfo,
  RouteKey,
  McsNetworkDbNetworkDelete,
  McsJob,
  JobStatus
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DialogActionType,
  DialogResult,
  DialogResultAction,
  DialogService2
} from '@app/shared';
import { CommonDefinition,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  of,
  Subject,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil,
  tap
} from 'rxjs/operators';
import { NetworkDbNetworkDetailsService } from './network-db-network.service';

@Component({
  selector: 'mcs-network-db-network',
  templateUrl: './network-db-network.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkDbNetworkDetailsComponent implements OnInit, OnDestroy {
  public network$: Observable<McsNetworkDbNetwork>;
  public selectedTabId$: Observable<string>;
  private _destroySubject = new Subject<void>();
  private _routerHandler: Subscription;
  private _targetId: string = '';

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _networkDetailService: NetworkDbNetworkDetailsService,
    private _navigationService: McsNavigationService,
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetector: ChangeDetectorRef
    ) {
      this._subscribeToQueryParams();
      this._listenToRouteChange();
      this._watchNetworkDbChanges();
  }

  public ngOnInit(): void {
    this._subscribeToResolve();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
  }

  public onTabChanged(tab: any, network: McsNetworkDbNetwork): void {
    this._navigationService.navigateTo(
      RouteKey.LaunchPadNetworkDbNetworkDetails,
      [network.id.toString(), tab.id]
    );
  }

  private _subscribeToQueryParams(): void {
    this._activatedRoute.queryParams.pipe(
      takeUntil(this._destroySubject),
      map((params) => getSafeProperty(params, (obj) => obj.id)),
      tap(id => {
        this._targetId = id;
      })
    ).subscribe();
  }

  private _subscribeToResolve(): void {
    this.network$ = this._activatedRoute.data.pipe(
      map((resolver) => getSafeProperty(resolver, (obj) => obj.network)),
      tap((network) => {
        if (isNullOrEmpty(network)) { return; }
        this._networkDetailService.setNetworkDetails(network);
      }),
      shareReplay(1)
    );
  }

  private _listenToRouteChange(): void {
    this._routerHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, (routeInfo: McsRouteInfo) => {
        let tabUrl = routeInfo && routeInfo.urlAfterRedirects;
        tabUrl = getSafeProperty(tabUrl, (obj) => obj.split('/').reduce((_prev, latest) => latest));
        let paramsIndex = tabUrl.indexOf('?');
        if (paramsIndex >= 0) {
          tabUrl = tabUrl.substr(0, paramsIndex);
        }
        this.selectedTabId$ = of(tabUrl);
      });
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  private _watchNetworkDbChanges(): void {
    this._eventDispatcher.addEventListener(McsEvent.dataChangeNetworkDbNetworksEvent, (payload) => {
      this._changeDetector.markForCheck();
    });
  }
}