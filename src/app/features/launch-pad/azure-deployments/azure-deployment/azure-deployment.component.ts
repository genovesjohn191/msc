import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  of,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  tap
} from 'rxjs/operators';

import { McsNavigationService } from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsRouteInfo,
  McsTerraformDeployment,
  RouteKey
} from '@app/models';
import {
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { AzureDeploymentService } from './azure-deployment.service';

@Component({
  selector: 'mcs-azure-deployment',
  templateUrl: './azure-deployment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AzureDeploymentComponent implements OnInit, OnDestroy {
  public deployment$: Observable<McsTerraformDeployment>;
  public deployment: McsTerraformDeployment;
  public selectedTabId$: Observable<string>;

  private _routerHandler: Subscription;

  public constructor(
    private _activatedRoute: ActivatedRoute,
    private _deploymentService: AzureDeploymentService,
    private _navigationService: McsNavigationService,
    private _eventDispatcher: EventBusDispatcherService
  ) {
    this._listenToRouteChange();
  }

  public ngOnInit(): void {
    this._subscribeToResolve();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._routerHandler);
  }

  public onTabChanged(tab: any): void {
    this._navigationService.navigateTo(
      RouteKey.LaunchPadAzureDeploymentDetails,
      [this.deployment.id,  tab.id]
    );
  }

  private _subscribeToResolve(): void {
    this.deployment$ = this._activatedRoute.data.pipe(
      map((resolver) => {
        return getSafeProperty(resolver, (obj) => obj.deployment);
      }),
      tap((deployment) => {
        if (isNullOrEmpty(deployment)) { return; }
        this.deployment = deployment;
        this._deploymentService.setDeploymentDetails(deployment);
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
}