import { Subscription } from 'rxjs';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  McsAuthenticationIdentity,
  McsNavigationService
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  McsRouteInfo,
  RouteCategory,
  RouteKey
} from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';

@Component({
  selector: 'mcs-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'header-wrapper'
  }
})

export class HeaderComponent implements OnInit, OnDestroy {
  public searchKeyword: string;
  public selectedCategory: RouteCategory;
  private _routeChangeHandler: Subscription;

  public constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _authenticationIdentity: McsAuthenticationIdentity,
  ) {}

  public get isImpersonating(): boolean {
    return this._authenticationIdentity.isImpersonating;
  }

  public get lightLogoIconKey(): string {
    return CommonDefinition.ASSETS_IMAGE_MCS_LIGHT_LOGO_SVG;
  }

  public get darkLogoIconKey(): string {
    return CommonDefinition.ASSETS_IMAGE_MCS_LIGHT_LOGO;
  }

  public get toggleIconKey(): string {
    return CommonDefinition.ASSETS_SVG_TOGGLE_NAV_BLUE;
  }

  public get routerCategoryEnum(): any {
    return RouteCategory;
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public ngOnInit() {
    this._registerEvents();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._routeChangeHandler);
  }

  public toggleNav(): void {
    this._eventDispatcher.dispatch(McsEvent.navToggle);
  }

  public search(): void {
    if (isNullOrEmpty(this.searchKeyword)) { return; }
    this._navigationService.navigateTo(RouteKey.LaunchPadSearch, [this.searchKeyword]);
  }

  public clearSearch(): void {
    this.searchKeyword = '';
  }

  private _registerEvents(): void {
    this._routeChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, this._onRouteChanged.bind(this)
    );
    this._eventDispatcher.dispatch(McsEvent.routeChange);
  }

  private _onRouteChanged(routeInfo: McsRouteInfo): void {
    if (isNullOrEmpty(routeInfo)) { return; }
    this.selectedCategory = routeInfo.enumCategory;
    this._changeDetectorRef.markForCheck();
  }
}
