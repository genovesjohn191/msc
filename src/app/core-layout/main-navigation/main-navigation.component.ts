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
  McsTextContentProvider,
  McsRouteCategory,
  mcsRouteCategoryText,
  McsRouteHandlerService,
  McsAccessControlService,
  McsRouteKey
} from '../../core';
import {
  unsubscribeSubject,
  isNullOrEmpty
} from '../../utilities';

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
  public textContent: any;
  public selectedCategory: McsRouteCategory;

  public get caretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  public get routerCategoryEnum(): any {
    return McsRouteCategory;
  }

  public get routeKeyEnum(): any {
    return McsRouteKey;
  }

  private _destroySubject = new Subject<void>();

  public constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _routerHandlerService: McsRouteHandlerService,
    private _textProvider: McsTextContentProvider,
    private _accessControlService: McsAccessControlService
  ) { }

  public ngOnInit() {
    this.textContent = this._textProvider.content;
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
  public navigateTo(routeKey: McsRouteKey): void {
    if (isNullOrEmpty(routeKey)) { return; }
    this._router.navigate([CoreRoutes.getNavigationPath(routeKey)]);
  }

  /**
   * Returns the route category label
   * @param routeCategory Route category to obtain
   */
  public getCategoryLabel(routeCategory: McsRouteCategory): string {
    return mcsRouteCategoryText[routeCategory];
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
