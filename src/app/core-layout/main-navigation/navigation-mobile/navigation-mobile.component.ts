import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  Renderer2,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import {
  Router,
  NavigationStart
} from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { CookieService } from 'ngx-cookie';
/** Providers / Services */
import {
  CoreDefinition,
  McsApiCompany,
  McsAuthenticationIdentity,
  McsAuthenticationService
} from '../../../core';
import { SwitchAccountService } from '../../shared';
import {
  resolveEnvVar,
  registerEvent,
  unregisterEvent,
  unsubscribeSafely
} from '../../../utilities';

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

  @ViewChild('navigationList')
  public navigationList: ElementRef;

  public switchAccountAnimation: string;
  private _routerSubscription: any;
  private _activeAccountSubscription: any;

  /**
   * Show or hide the navigation element based on slide value
   */
  private _slideTrigger: string;
  public get slideTrigger(): string {
    return this._slideTrigger;
  }
  public set slideTrigger(value: string) {
    if (this._slideTrigger !== value) {
      this._slideTrigger = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _accountPanelOpen: boolean;
  public get accountPanelOpen(): boolean {
    return this._accountPanelOpen;
  }
  public set accountPanelOpen(value: boolean) {
    if (this._accountPanelOpen !== value) {
      this._accountPanelOpen = value;
      this.switchAccountAnimation = value ? 'expanded' : 'collapsed';
      this._changeDetectorRef.markForCheck();
    }
  }

  public get macquarieViewUrl(): string {
    return resolveEnvVar('MACQUARIE_VIEW_URL');
  }

  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  public get arrowUpIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  public get caretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  public get caretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CLOSE;
  }

  public get firstName(): string {
    return this._authenticationIdentity.firstName;
  }

  public get lastName(): string {
    return this._authenticationIdentity.lastName;
  }

  /**
   * Event handler references
   */
  private _clickOutsideHandler = this.onClickOutside.bind(this);

  public constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _cookieService: CookieService,
    private _switchAccountService: SwitchAccountService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _authenticationService: McsAuthenticationService
  ) {
    this.accountPanelOpen = false;
    this.switchAccountAnimation = 'collapsed';
  }

  public ngOnInit() {
    this._routerSubscription = this._router.events
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.close();
        }
      });
    registerEvent(document, 'click', this._clickOutsideHandler);
    this._listenToSwitchAccount();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._routerSubscription);
    unsubscribeSafely(this._activeAccountSubscription);
    unregisterEvent(document, 'click', this._clickOutsideHandler);
  }

  public logout(event): void {
    event.preventDefault();
    this._authenticationService.logOut();
  }

  public onClickOutside(_event: any): void {
    if (!this._elementRef.nativeElement.contains(_event.target)) {
      this.close();
    }
  }

  public toggleAccountPanel(): void {
    this.accountPanelOpen = !this.accountPanelOpen;
  }

  public open(): void {
    this._renderer.setStyle(this.navigationList.nativeElement, 'display', 'block');
    this.slideTrigger = 'slideInLeft';
  }

  public close(): void {
    if (this.slideTrigger) {
      this.slideTrigger = 'slideOutLeft';
      setTimeout(() => { this.accountPanelOpen = false; }, 500);
    }
  }

  public getActiveAccount(): McsApiCompany {
    let activeAccount: McsApiCompany;
    let cookieContent: string;
    cookieContent = this._cookieService.get(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
    activeAccount = cookieContent ? JSON.parse(cookieContent) :
      this._switchAccountService.defaultAccount;
    return activeAccount;
  }

  private _listenToSwitchAccount(): void {
    this._activeAccountSubscription = this._switchAccountService.activeAccountStream
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
  }
}
