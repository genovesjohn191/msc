import {
  BehaviorSubject,
  Subject
} from 'rxjs';
import {
  filter,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  AfterContentInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';
import {
  NavigationEnd,
  Router
} from '@angular/router';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

@Directive({
  selector: '[mcsRouterLinkActive]',
})
export class RouterLinkActiveDirective implements OnInit, OnDestroy, AfterContentInit {
  @Input('mcsRouterLinkActive')
  public set routerLinkActive(value: string | string[]) {
    let classes = Array.isArray(value) ? value : value.split(' ');
    this._routerClasses = classes.filter((_class) => !!_class);
  }
  private _routerClasses: string[];

  private _savedActiveLinkStatus: boolean;
  private _destroySubject = new Subject<void>();
  private _routerLinkChanges = new BehaviorSubject<string>(null);

  constructor(
    private _router: Router,
    private _elementRef: ElementRef<HTMLElement>,
    private _renderer: Renderer2
  ) { }

  public ngOnInit(): void {
    this._subscribeToRouterLinksChange();
    this._subscribeToRouterChange();
  }

  public ngAfterContentInit(): void {
    setTimeout(() => {
      let routerLink = this._elementRef.nativeElement.getAttribute('href');
      this._routerLinkChanges.next(routerLink);
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  private _subscribeToRouterChange(): void {
    this._router.events.pipe(
      takeUntil(this._destroySubject),
      filter((event) => event instanceof NavigationEnd)
    ).subscribe(() => this._updateActiveLinkStatusView());
  }

  private _subscribeToRouterLinksChange(): void {
    this._routerLinkChanges.pipe(
      takeUntil(this._destroySubject),
      filter(link => !isNullOrEmpty(link)),
      tap(() => this._updateActiveLinkStatusView())
    ).subscribe();
  }

  private _updateActiveLinkStatusView(): void {
    let stateIsUpdated = isNullOrEmpty(this._routerClasses) || !this._router.navigated;
    if (stateIsUpdated) { return; }

    Promise.resolve().then(() => {
      let currentActiveStatus = this.hasActiveRoute;
      let activeStatusHasChanged = this._savedActiveLinkStatus !== currentActiveStatus;

      if (activeStatusHasChanged) {
        currentActiveStatus ? this._applyActiveClasses() : this._clearActiveClasses();
      }
      this._savedActiveLinkStatus = currentActiveStatus;
    });
  }

  private get hasActiveRoute(): boolean {
    return this._router.isActive(this._routerLinkChanges.getValue(), false);
  }

  private _clearActiveClasses(): void {
    if (isNullOrEmpty(this._routerClasses)) { return; }
    this._routerClasses.forEach((_class) => {
      this._renderer.removeClass(this._elementRef.nativeElement, _class);
    });
  }

  private _applyActiveClasses(): void {
    if (isNullOrEmpty(this._routerClasses)) { return; }
    this._routerClasses.forEach((_class) => {
      this._renderer.addClass(this._elementRef.nativeElement, _class);
    });
  }
}
