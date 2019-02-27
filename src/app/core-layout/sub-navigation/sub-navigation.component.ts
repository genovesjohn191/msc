import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsRouteHandlerService
} from '@app/core';
import {
  unsubscribeSubject,
  isNullOrEmpty,
  animateFactory
} from '@app/utilities';
import {
  RouteKey,
  RouteCategory
} from '@app/models';

@Component({
  selector: 'mcs-sub-navigation',
  templateUrl: './sub-navigation.component.html',
  styleUrls: ['./sub-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory.expansionVertical
  ],
  host: {
    'class': 'sub-navigation-wrapper'
  }
})

export class SubNavigationComponent implements OnInit, OnDestroy {
  public activeRouteCategory: RouteCategory;

  /**
   * Returns the route category enumeration
   */
  public get routeCategoryEnum(): any {
    return RouteCategory;
  }

  /**
   * Returns the route key enumeration
   */
  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Returns true when the sub-navigation is displayed
   */
  public get showSubNavigation(): boolean {
    return !isNullOrEmpty(this.activeRouteCategory)
      && this.activeRouteCategory !== RouteCategory.None;
  }

  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _routerHandlerService: McsRouteHandlerService
  ) { }

  public ngOnInit() {
    this._listenToRouteChanges();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Listen to route category changes
   */
  private _listenToRouteChanges(): void {
    this._routerHandlerService.onActiveRoute
      .pipe(takeUntil(this._destroySubject))
      .subscribe((activeRoute) => {
        if (isNullOrEmpty(activeRoute)) { return; }
        this.activeRouteCategory = activeRoute.enumCategory;
        this._changeDetectorRef.markForCheck();
      });
  }
}
