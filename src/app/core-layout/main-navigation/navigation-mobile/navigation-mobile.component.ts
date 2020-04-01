import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Subscription } from 'rxjs';
import { EventBusDispatcherService } from '@peerlancers/ngx-event-bus';
import {
  CoreConfig,
  McsAuthenticationService
} from '@app/core';
import {
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { RouteKey } from '@app/models';
import { SlidingPanelComponent } from '@app/shared';
import { McsEvent } from '@app/events';

@Component({
  selector: 'mcs-navigation-mobile',
  templateUrl: './navigation-mobile.component.html',
  styleUrls: ['./navigation-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('indicatorIcon', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)'))
    ]),
    trigger('bodyExpansion', [
      state('collapsed', style({ height: '0px', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4,0.0,0.2,1)')),
    ])
  ],
})

export class NavigationMobileComponent implements OnInit, OnDestroy {
  public switchAccountAnimation: string;

  @ViewChild('slidingPanel', { static: false })
  public slidingPanel: SlidingPanelComponent;

  public get macviewUrl(): string {
    return this._coreConfig.macviewUrl;
  }

  public get toggleIconKey(): string {
    return CommonDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  public get arrowUpIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  public get caretRightIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_RIGHT;
  }

  public get caretDownIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_DOWN;
  }

  public get closeIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOSE_WHITE;
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  private _routeChangeHandler: Subscription;

  public constructor(
    private _coreConfig: CoreConfig,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _authenticationService: McsAuthenticationService
  ) {
    this.switchAccountAnimation = 'collapsed';
  }

  public ngOnInit() {
    this._registerEvents();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._routeChangeHandler);
  }

  /**
   * Logout the current user and navigate to auth page
   */
  public logout(event): void {
    event.preventDefault();
    this._authenticationService.logOut();
  }

  /**
   * Toggle the account panel
   */
  public toggleAccountPanel(): void {
    this.switchAccountAnimation = this.switchAccountAnimation === 'expanded' ?
      'collapsed' : 'expanded';
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Opens the navigation panel
   */
  public open(): void {
    this.slidingPanel.open();
  }

  /**
   * Closes the navigation panel
   */
  public close(): void {
    this.slidingPanel.close();
  }

  /**
   * Register events state
   */
  private _registerEvents(): void {
    this._routeChangeHandler = this._eventDispatcher.addEventListener(
      McsEvent.routeChange, this._onRouteChanged.bind(this)
    );
  }

  /**
   * Events that gets notified when route has been changed
   */
  private _onRouteChanged(): void {
    this.close();
  }
}
