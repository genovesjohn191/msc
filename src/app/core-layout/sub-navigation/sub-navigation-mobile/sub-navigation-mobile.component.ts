import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import {
  Router,
  RouterEvent,
  NavigationEnd
} from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CoreDefinition } from '@app/core';
import {
  unsubscribeSubject,
  animateFactory
} from '@app/utilities';
import {
  McsRouteCategory,
  mcsRouteCategoryText
} from '@app/models';

@Component({
  selector: 'mcs-sub-navigation-mobile',
  templateUrl: './sub-navigation-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory.rotate180,
    animateFactory.expansionVertical
  ],
  host: {
    'class': 'sub-navigation-mobile-wrapper'
  }
})

export class SubNavigationMobileComponent implements OnInit, OnDestroy {
  @Input()
  public routeCategory: McsRouteCategory;

  /**
   * Returns true when panel is opened, otherwise false
   */
  private _panelOpen: boolean;
  public get panelOpen(): boolean { return this._panelOpen; }
  public set panelOpen(value: boolean) {
    if (this._panelOpen !== value) {
      this._panelOpen = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Returns the toggle icon key
   */
  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  /**
   * Returns the category text label based on input
   */
  public get routeCategoryLabel(): string {
    return mcsRouteCategoryText[this.routeCategory];
  }

  private _destroySubject = new Subject<void>();

  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this._listenToRouterEvents();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Opens the navigation panel
   */
  public openPanel(): void {
    this.panelOpen = true;
  }

  /**
   * Closes the navigation panel
   */
  public closePanel(): void {
    this.panelOpen = false;
  }

  /**
   * Toggles the navigation panel
   */
  public toggle(): void {
    this.panelOpen ? this.closePanel() : this.openPanel();
  }

  /**
   * Listen to every route changed to close the panel
   */
  private _listenToRouterEvents(): void {
    this._router.events
      .pipe(takeUntil(this._destroySubject))
      .subscribe((event: RouterEvent) => {
        if (event instanceof NavigationEnd) {
          this.closePanel();
        }
      });
  }
}
