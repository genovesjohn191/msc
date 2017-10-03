import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import {
  Router,
  NavigationStart
} from '@angular/router';
/** Providers / Services */
import { CoreDefinition } from '../../../core';
import {
  isNullOrEmpty,
  animateFactory
} from '../../../utilities';

@Component({
  selector: 'mcs-navigation-mobile',
  templateUrl: './navigation-mobile.component.html',
  styles: [require('./navigation-mobile.component.scss')],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory({ duration: '300ms', easing: 'ease-in-out' })
  ]
})

export class NavigationMobileComponent implements OnInit, OnDestroy {

  private _routerSubscription: any;

  /**
   * Show or hide the navigation element
   */
  private _showHide: string;
  public get showHide(): string {
    return this._showHide;
  }
  public set showHide(value: string) {
    if (this._showHide !== value) {
      this._showHide = value;
      this._changeDetectorRef.markForCheck();
    }
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

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CLOSE;
  }

  public constructor(
    private _elementRef: ElementRef,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.close();
  }

  public ngOnInit() {
    this._routerSubscription = this._router.events
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.close();
        }
      });
  }

  public ngOnDestroy() {
    if (!isNullOrEmpty(this._routerSubscription)) {
      this._routerSubscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event.target'])
  public onClickOutside(target): void {
    if (!this._elementRef.nativeElement.contains(target)) {
      this.close();
    }
  }

  public open(): void {
    this.showHide = 'slideInLeft';
  }

  public close(): void {
    this.showHide = 'slideOutLeft';
  }
}
