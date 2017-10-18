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
/** Providers / Services */
import { CoreDefinition } from '../../../core';
import {
  isNullOrEmpty,
  resolveEnvVar,
  registerEvent,
  unregisterEvent
} from '../../../utilities';

@Component({
  selector: 'mcs-navigation-mobile',
  templateUrl: './navigation-mobile.component.html',
  styleUrls: ['./navigation-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class NavigationMobileComponent implements OnInit, OnDestroy {

  @ViewChild('navigationList')
  public navigationList: ElementRef;

  private _routerSubscription: any;

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

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CLOSE;
  }

  /**
   * Event handler references
   */
  private _clickOutsideHandler = this.onClickOutside.bind(this);

  public constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this._routerSubscription = this._router.events
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.close();
        }
      });
    registerEvent(document, 'click', this._clickOutsideHandler);
  }

  public ngOnDestroy() {
    if (!isNullOrEmpty(this._routerSubscription)) {
      this._routerSubscription.unsubscribe();
    }
    unregisterEvent(document, 'click', this._clickOutsideHandler);
  }

  public onClickOutside(_event: any): void {
    if (!this._elementRef.nativeElement.contains(_event.target)) {
      this.close();
    }
  }

  public open(): void {
    this._renderer.setStyle(this.navigationList.nativeElement, 'display', 'block');
    this.slideTrigger = 'slideInLeft';
  }

  public close(): void {
    if (this.slideTrigger) {
      this.slideTrigger = 'slideOutLeft';
    }
  }
}
