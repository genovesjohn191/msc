import {
  Component,
  OnInit,
  HostListener,
  ElementRef
} from '@angular/core';

import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

import {
  Router,
  NavigationStart
} from '@angular/router';

import { Title } from '@angular/platform-browser';

/** Providers / Services */
import {
  McsTextContentProvider,
  McsAssetsProvider,
  McsBrowserService,
  McsDeviceType,
  McsAuthService,
  McsUserType,
  CoreDefinition
} from '../../core';

@Component({
  selector: 'mcs-main-navigation',
  templateUrl: './main-navigation.component.html',
  styles: [require('./main-navigation.component.scss')],
  animations: [
    trigger('navToggle', [
      state('hide', style({
        transform: 'translate3d(-100%, 0, 0)'
      })),
      state('show', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      transition('hide <=> show', animate('200ms ease-in-out'))
    ]),
  ]
})

export class MainNavigationComponent implements OnInit {
  public textContent: any;
  public listBullet: string;
  public signOutIcon: string;
  public navigationCloseButton: string;
  public navState: string;
  public isMobile: boolean;

  public constructor(
    private _router: Router,
    private _textProvider: McsTextContentProvider,
    private _assetsProvider: McsAssetsProvider,
    private _authService: McsAuthService,
    private _titleService: Title,
    private _browserService: McsBrowserService,
    private _elementReference: ElementRef
  ) {
    this.textContent = this._textProvider.content;
  }

  public ngOnInit() {
    this._browserService.resizeWindowStream
      .subscribe((deviceType) => {
        this.isMobile = (deviceType === McsDeviceType.MobileLandscape)
          || (deviceType === McsDeviceType.MobilePortrait);
        this.navState = (this.isMobile) ? 'hide' : 'default';
      });

    this._router.events
      .subscribe((event) => {
        if (this.isMobile && event instanceof NavigationStart) {
          this.navState = 'hide';
        }
      });

    this.listBullet = this._assetsProvider.getIcon('caret-right');
    this.navigationCloseButton = this._assetsProvider.getIcon('close');
    this.signOutIcon = this._assetsProvider.getIcon('sign-out');
  }

  @HostListener('document:click', ['$event.target'])
  public onClickOutside(target): void {
    if (!this._elementReference.nativeElement.contains(target)) {
      if (this.isMobile && this.navState === 'show') {
        this.navState = 'hide';
      }
    }
  }

  public isUser(): boolean {
    return this._authService.userType === McsUserType.User;
  }

  public setTitle(title: string) {
    this._titleService.setTitle(title);
  }

  public getToggleIconKey(): string {
    return CoreDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  public getArrowUpIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }
}
