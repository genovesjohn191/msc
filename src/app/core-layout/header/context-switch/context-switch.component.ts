import {
  Component,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  EventBusDispatcherService,
  EventBusPropertyListenOn
} from '@peerlancers/ngx-event-bus';
import {
  RoutePlatform,
  McsRouteInfo,
  McsFeatureFlag,
  RouteKey,
  McsPermission
} from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { McsEvent } from '@app/events';
import {
  McsAuthenticationIdentity,
  McsAccessControlService,
  McsRouteSettingsService,
  McsNavigationService
} from '@app/core';

@Component({
  selector: 'mcs-context-switch',
  templateUrl: './context-switch.component.html',
  styleUrls: ['./context-switch.component.scss'],
  host: {
    'class': 'context-switch-wrapper',
    'style': 'width: 100%;'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ContextSwitchComponent implements OnInit, OnDestroy {
  @Input()
  public mobileView: boolean = false;

  @EventBusPropertyListenOn(McsEvent.accountChange)
  public showPlatformButton: boolean = false;

  private _routeHandler: Subscription;

  public constructor(
    private _mcsRouteSettingsService: McsRouteSettingsService,
    private _accessControlService: McsAccessControlService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _navigationService: McsNavigationService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _routeSettingsService: McsRouteSettingsService,
  ) { }

  public ngOnInit(): void {
    this._subscribeToRouteChange();
    this._initializePlatformButton();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._routeHandler);
  }

  public switchToPrivateCloud(): void {
    let privateDefaultRoute: RouteKey = this._resolveDefaultPrivateCloudRoute();
    this._navigationService.navigateTo(privateDefaultRoute);
  }

  public switchToPublicCloud(): void {
    let publicDefaultRoute: RouteKey = RouteKey.Licenses;
    this._navigationService.navigateTo(publicDefaultRoute);
  }

  public get isPrivateCloudRoute(): boolean {
    return this._routeSettingsService.isPrivateCloudRoute;
  }

  public get isPublicCloudRoute(): boolean {
    return this._routeSettingsService.isPublicCloudRoute;
  }

  private _resolveDefaultPrivateCloudRoute(): RouteKey {
    let hasVmAccess = this._accessControlService.hasPermission([
      McsPermission.CloudVmAccess,
      McsPermission.DedicatedVmAccess
    ]);
    let hasFirewallAccess = this._accessControlService.hasPermission([
      McsPermission.FirewallConfigurationView
    ]);
    let defaultRoute =
      hasVmAccess ? RouteKey.Servers :
      hasFirewallAccess ? RouteKey.Firewalls :
      RouteKey.OtherTools;

    if (this.isPublicCloudRoute) {
      // We want to force a change to private cloud context if we end up navigating to other tools which is a global route
      this._mcsRouteSettingsService.selectedPlatform = RoutePlatform.Private;
    }

    return defaultRoute;
  }

  private _initializePlatformButton(): void {
    this.showPlatformButton = (this._authenticationIdentity.platformSettings.hasPrivateCloud &&
                                this._authenticationIdentity.platformSettings.hasPublicCloud &&
                                this._accessControlService.hasAccessToFeature(McsFeatureFlag.PublicCloud));
  }

  private _subscribeToRouteChange(): void {
    this._routeHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, this._onRouteChanged.bind(this));
  }

  private _onRouteChanged(routeInfo: McsRouteInfo): void {
    if (isNullOrEmpty(routeInfo)) { return; }

    this._changeDetectorRef.markForCheck();
  }
}
