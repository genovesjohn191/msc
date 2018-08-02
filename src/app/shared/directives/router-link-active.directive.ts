import {
  Directive,
  Input,
  OnInit,
  AfterContentInit,
  ContentChildren,
  ElementRef,
  Renderer2,
  QueryList
} from '@angular/core';
import {
  Router,
  NavigationEnd
} from '@angular/router';
import { Subject } from 'rxjs';
import {
  takeUntil,
  startWith
} from 'rxjs/operators';
import { isNullOrEmpty } from '../../utilities';
import { RouterLinkDirective } from './router-link.directive';

@Directive({
  selector: '[mcsRouterLinkActive]',
})

export class RouterLinkActiveDirective implements OnInit, AfterContentInit {
  @Input('mcsRouterLinkActive')
  public set routerLinkActive(value: string | string[]) {
    let classes = Array.isArray(value) ? value : value.split(' ');
    this._routerClasses = classes.filter((_class) => !!_class);
  }
  private _routerClasses: string[];

  @ContentChildren(RouterLinkDirective, { descendants: true })
  private _routerLinks: QueryList<RouterLinkDirective>;

  private _savedActiveLinkStatus: boolean;
  private _destroySubject = new Subject<void>();

  constructor(
    private _router: Router,
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) { }

  public ngOnInit(): void {
    this._listenToRouterChanges();
  }

  public ngAfterContentInit(): void {
    this._routerLinks.changes
      .pipe(startWith(null!), takeUntil(this._destroySubject))
      .subscribe(() => this._updateActiveLinkStatusView());
  }

  /**
   * Listens to every change of router url
   */
  private _listenToRouterChanges(): void {
    this._router.events
      .pipe(takeUntil(this._destroySubject))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this._updateActiveLinkStatusView();
        }
      });
  }

  /**
   * Updates the active link status view according to active route
   */
  private _updateActiveLinkStatusView(): void {
    let hasClasses = isNullOrEmpty(this._routerClasses) || !this._router.navigated;
    if (hasClasses) { return; }
    Promise.resolve().then(() => {
      let currentActiveStatus = this.hasActiveRoute;
      let activeStatusHasChanged = this._savedActiveLinkStatus !== currentActiveStatus;

      if (activeStatusHasChanged) {
        currentActiveStatus ? this._applyActiveClasses() : this._clearActiveClasses();
      }
      this._savedActiveLinkStatus = currentActiveStatus;
    });
  }

  /**
   * Returns true when some of the associated routes is active
   */
  private get hasActiveRoute(): boolean {
    return !!this._routerLinks.find((link) =>
      this._router.isActive(link.routeLink, false));
  }

  /**
   * Clears the active classes of the associated element
   */
  private _clearActiveClasses(): void {
    if (isNullOrEmpty(this._routerClasses)) { return; }
    this._routerClasses.forEach((_class) => {
      this._renderer.removeClass(this._elementRef.nativeElement, _class);
    });
  }

  /**
   * Applies the active class of the associated elements
   */
  private _applyActiveClasses(): void {
    if (isNullOrEmpty(this._routerClasses)) { return; }
    this._routerClasses.forEach((_class) => {
      this._renderer.addClass(this._elementRef.nativeElement, _class);
    });
  }
}
