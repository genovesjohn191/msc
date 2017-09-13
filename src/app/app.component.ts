/*
 * Angular 2 decorators and services
 */
import {
  Component,
  ViewEncapsulation,
  Renderer2,
  NgZone,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  Router,
  // import as RouterEvent to avoid confusion with the DOM Event
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouteConfigLoadStart,
  RouteConfigLoadEnd
} from '@angular/router';
import { McsRoutePermissionGuard } from './core';
import { animateFactory } from './utilities';
/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'mcs-app',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./app.component.scss')],
  templateUrl: './app.component.html',
  animations: [
    animateFactory({ duration: '300ms', easing: 'ease-in-out' })
  ]
})

export class AppComponent implements OnInit, OnDestroy {

  @ViewChild('spinnerElement')
  public spinnerElement: ElementRef;

  public routerSubscription: any;
  public isInitialDisplayed: boolean;

  /**
   * Pre loader animation will be applied then status is changed
   */
  private _animation: string;
  public get animation(): string {
    return this._animation;
  }
  public set animation(value: string) {
    if (this._animation !== value) {
      this._animation = value;
    }
  }

  constructor(
    private _router: Router,
    private _ngZone: NgZone,
    private _renderer: Renderer2,
    private _routePermissionGuard: McsRoutePermissionGuard
  ) {
    this.isInitialDisplayed = true;
  }

  public ngOnInit(): void {
    this._listenToRouterEvents();
  }

  public ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private _listenToRouterEvents(): void {
    this.routerSubscription = this._router.events
      .subscribe((event: RouterEvent) => {
        this._navigationInterceptor(event);
      });
  }

  private _navigationInterceptor(event: RouterEvent) {
    if (event instanceof NavigationStart) {
      this._showLoader();
    } else if (event instanceof NavigationEnd ||
      event instanceof NavigationCancel ||
      event instanceof NavigationError) {
      this._hideLoader();
    }
  }

  /**
   * Show the loader outside of angular process
   *
   * `@Note`: This will run asynchronously since it is called
   * outside angular that is not reflected in the DOM
   */
  private _showLoader(): void {
    if (!this.isInitialDisplayed) { return; }
    this._ngZone.runOutsideAngular(() => {
      this.animation = 'fadeIn';
    });
  }

  /**
   * Hide the loader outside of angular process
   *
   * `@Note`: This will run asynchronously since it is called
   * outside angular that is not reflected in the DOM
   */
  private _hideLoader(): void {
    this.isInitialDisplayed = false;
    this._ngZone.runOutsideAngular(() => {
      this.animation = 'fadeOut';
    });
  }
}
