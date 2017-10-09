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
import { isNullOrEmpty } from '../../../utilities';

@Component({
  selector: 'mcs-navigation-mobile',
  templateUrl: './navigation-mobile.component.html',
  styleUrls: ['./navigation-mobile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class NavigationMobileComponent implements OnInit, OnDestroy {

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
    this.slideTrigger = 'slideInLeft';
  }

  public close(): void {
    this.slideTrigger = 'slideOutLeft';
  }
}
