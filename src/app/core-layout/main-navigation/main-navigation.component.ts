import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsTextContentProvider,
  McsRouteCategory,
  mcsRouteCategoryText,
  McsRouteHandlerService,
  CoreDefinition
} from '../../core';
import {
  refreshView,
  unsubscribeSubject
} from '../../utilities';
/** Directives for mobile/table/desktop */
import {
  NavigationDesktopItemsDirective
} from './navigation-desktop/navigation-desktop-items.directive';
import {
  NavigationMobileItemsDirective
} from './navigation-mobile/navigation-mobile-items.directive';

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

export class MainNavigationComponent implements OnInit, AfterViewInit, OnDestroy {
  public textContent: any;
  public selectedCategory: McsRouteCategory;

  @ViewChild(NavigationDesktopItemsDirective)
  public navigationDesktop: NavigationDesktopItemsDirective;

  @ViewChild(NavigationMobileItemsDirective)
  public navigationMobile: NavigationMobileItemsDirective;

  @ViewChild('navigationList')
  public navigationList: TemplateRef<any>;

  public get caretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  public get routerCategoryEnum(): any {
    return McsRouteCategory;
  }

  private _destroySubject = new Subject<void>();

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _routerHandlerService: McsRouteHandlerService,
    private _textProvider: McsTextContentProvider
  ) { }

  public ngOnInit() {
    this.textContent = this._textProvider.content;
    this._listenToRouteChanges();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this.navigationMobile.viewContainer.createEmbeddedView(this.navigationList);
      this.navigationDesktop.viewContainer.createEmbeddedView(this.navigationList);
    });
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
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
        this.selectedCategory = activeRoute.category;
        this._changeDetectorRef.markForCheck();
      });
  }
}
