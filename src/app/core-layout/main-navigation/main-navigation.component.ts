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
  public navState: string;
  public isMobile: boolean;

  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  public get arrowUpIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ARROW_UP_WHITE;
  }

  public get caretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CLOSE;
  }

  public get signOutIconKey(): string {
    return CoreDefinition.ASSETS_FONT_SIGN_OUT;
  }

  public constructor(
    private _router: Router,
    private _textProvider: McsTextContentProvider,
    private _authService: McsAuthService,
    private _titleService: Title,
    private _browserService: McsBrowserService,
    private _elementReference: ElementRef
  ) {
    this.textContent = this._textProvider.content;
  }

  public ngOnInit() {
    this._browserService.deviceTypeStream
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
}
