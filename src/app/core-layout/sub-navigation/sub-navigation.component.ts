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
  McsRouteCategory,
  McsRouteHandlerService,
  McsTextContentProvider
} from '../../core';
import {
  unsubscribeSubject,
  isNullOrEmpty,
  animateFactory
} from '../../utilities';

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
  public textContent: any;
  public activeRouteCategory: McsRouteCategory;

  /**
   * Returns the route category enumeration
   */
  public get routeCategoryEnum(): any {
    return McsRouteCategory;
  }

  /**
   * Returns true when the sub-navigation is displayed
   */
  public get showSubNavigation(): boolean {
    return !isNullOrEmpty(this.activeRouteCategory)
      && this.activeRouteCategory !== McsRouteCategory.None;
  }

  private _destroySubject = new Subject<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _routerHandlerService: McsRouteHandlerService
  ) { }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.navigation;
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
      .subscribe((_activeRoute) => {
        this.activeRouteCategory = _activeRoute.category;
        this._changeDetectorRef.markForCheck();
      });
  }
}
