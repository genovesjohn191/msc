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
  public onEditMode = false;

  private _dialogSubject = new Subject<void>();
  private _destroySubject = new Subject<void>();

  private _routerHandler: Subscription;
  private _targetId: string = '';

  public watchedJob: McsJob;
  private _jobEventHandler: Subscription;

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _networkDetailService: NetworkDbNetworkDetailsService,
    private _navigationService: McsNavigationService,
    private _eventDispatcher: EventBusDispatcherService,
    private _dialogService: DialogService2,
    private _translateService: TranslateService,
    private _apiService: McsApiService,
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
    unsubscribeSafely(this._dialogSubject);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routerHandler);
    unsubscribeSafely(this._jobEventHandler);
  }

  public onTabChanged(tab: any, network: McsNetworkDbNetwork): void {
    let navigationExtras: NavigationExtras = null;
    let updatingViewToActivityLogs: boolean = tab.id === 'events' && !isNullOrEmpty(this._targetId);
    if (updatingViewToActivityLogs) {
      navigationExtras = {
        queryParams: {
          id: this._targetId
        }
      };
    }
    this._navigationService.navigateTo(
      RouteKey.LaunchPadNetworkDbNetworkDetails,
      [network.id.toString(), tab.id],
      navigationExtras
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
        this.onEditMode = tabUrl === 'edit';
        this.selectedTabId$ = of(tabUrl);
      });
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public editClicked(networkId: string): void {
    let navigationExtras = {
      queryParams: {
        id: this._targetId
      }
    };

    this._navigationService.navigateTo(
      RouteKey.LaunchPadNetworkDbNetworkDetails,
      [networkId, 'edit'],
      navigationExtras
    );
  }

  public deleteClicked(network: McsNetworkDbNetwork): void {
    let dialogRef = this._dialogService.openConfirmation({
      title: this._translateService.instant('networkDb.deleteDialog.title'),
      type: DialogActionType.Warning,
      message: this._translateService.instant('networkDb.deleteDialog.message'),
      confirmText: this._translateService.instant('action.delete'),
      cancelText: this._translateService.instant('action.cancel')
    });

    dialogRef.afterClosed().pipe(
      tap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm) { return; }
        this._delete(network);
      })
    ).subscribe();
  }

  private _delete(network: McsNetworkDbNetwork): void {
    let deleteDetails = createObject(McsNetworkDbNetworkDelete, {
      clientReferenceObject: {
        networkId: network.id
      }
    });

    this._changeDetector.markForCheck();
    this._apiService.deleteNetworkDbNetwork(network.id, deleteDetails).pipe(
      map(response =>{
        this._watchThisJob(response);
      })
    ).subscribe();
  }

  private _watchThisJob(job: McsJob): void {
    this.watchedJob = job;
    this._jobEventHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobReceive, this._onJobUpdatesReceived.bind(this));
  }

  private _onJobUpdatesReceived(job: McsJob): void {
    let watchedJob = !isNullOrEmpty(job) && job.id === this.watchedJob.id;
    if (!watchedJob)  { return; }
    this.watchedJob = job;
    // Successful
    if (job.status === JobStatus.Completed) {
      this._navigationService.navigateTo(RouteKey.LaunchPadNetworkDbNetworks);
    }
  }

  private _watchNetworkDbChanges(): void {
    this._eventDispatcher.addEventListener(McsEvent.dataChangeNetworkDbNetworksEvent, (payload) => {
      this._changeDetector.markForCheck();
    });
  }
}