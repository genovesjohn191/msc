/*
 * Angular 2 decorators and services
 */
import {
  Component,
  ViewEncapsulation,
  NgZone,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  Router,
  // import as RouterEvent to avoid confusion with the DOM Event
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router';
import {
  McsRoutePermissionGuard,
  McsErrorHandlerService,
  GoogleAnalyticsEventsService
} from './core';
import { isNullOrEmpty } from './utilities';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'mcs-app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit, OnDestroy {

  public routerSubscription: any;
  public isInitialDisplayed: boolean;

  /**
   * Pre loader animation will be applied then status is changed
   */
  private _trigger: string;
  public get trigger(): string {
    return this._trigger;
  }
  public set trigger(value: string) {
    if (this._trigger !== value) {
      this._trigger = value;
    }
  }

  constructor(
    private _router: Router,
    private _ngZone: NgZone,
    private _routePermission: McsRoutePermissionGuard,
    private _errorHandlerService: McsErrorHandlerService,
    // This will initialize the analytics when app starts
    _googleAnalyticsEventsService: GoogleAnalyticsEventsService
  ) {
    this.isInitialDisplayed = true;
  }

  public ngOnInit(): void {
    this._listenToRouterEvents();
    this._routePermission.initializeRouteChecking();
    this._errorHandlerService.initializeErrorHandlers();
  }

  public ngOnDestroy(): void {
    if (!isNullOrEmpty(this.routerSubscription)) {
      this.routerSubscription.unsubscribe();
    }
    this._routePermission.dispose();
    this._errorHandlerService.dispose();
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
      this.trigger = undefined;
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
      this.trigger = 'fadeOut';
    });
  }
}
