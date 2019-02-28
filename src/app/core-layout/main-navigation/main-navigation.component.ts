import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CoreDefinition,
  CoreRoutes,
  McsRouteHandlerService,
  McsAccessControlService,
} from '@app/core';
import {
  RouteKey,
  RouteCategory,
  routeCategoryText
} from '@app/models';
import {
  unsubscribeSubject,
  isNullOrEmpty
} from '@app/utilities';

@Component({
  selector: 'mcs-main-navigation',
  templateUrl: './main-navigation.component.html',
  styleUrls: ['./main-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'main-navigation-wrapper'
  }
})

export class MainNavigationComponent implements OnInit, OnDestroy {
  public selectedCategory: RouteCategory;

  public get caretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  public get routerCategoryEnum(): any {
    return RouteCategory;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  private _destroySubject = new Subject<void>();

  public constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _routerHandlerService: McsRouteHandlerService,
    private _accessControlService: McsAccessControlService
  ) { }

  public ngOnInit() {
    this._listenToRouteChanges();
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Returns true when the user has hosting permission
   */
  public get hasHostingAccess(): boolean {
    return this._accessControlService.hasPermission(['VmAccess']) ||
      this._accessControlService.hasPermission(['FirewallConfigurationView']);
  }

  /**
   * Navigate to the given path key
   */
  public navigateTo(routeKey: RouteKey): void {
    if (isNullOrEmpty(routeKey)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(routeKey)]);
  }

  /**
   * Returns the route category label
   * @param routeCategory Route category to obtain
   */
  public getCategoryLabel(routeCategory: RouteCategory): string {
    return routeCategoryText[routeCategory];
  }

  /**
   * Listens to route details changes
   */
  private _listenToRouteChanges(): void {
    this._routerHandlerService.onActiveRoute
      .pipe(takeUntil(this._destroySubject))
      .subscribe((activeRoute) => {
        if (isNullOrEmpty(activeRoute)) { return; }
        this.selectedCategory = activeRoute.enumCategory;
        this._changeDetectorRef.markForCheck();
      });
  }
}
