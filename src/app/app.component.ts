import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import {
  Event as RouterEvent,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router
} from '@angular/router';
import { McsAuthenticationService } from '@app/core';

import {
  animateFactory,
  refreshView,
  unsubscribeSafely
} from './utilities';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'mcs-app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  animations: [
    animateFactory.fadeOut
  ]
})

export class AppComponent implements AfterViewInit, OnDestroy {
  public showLoadingScreen: boolean = true;

  private _isInitialDisplayed: boolean;
  private _destroySubject = new Subject<void>();

  /**
   * Pre loader animation will be applied then status is changed
   */
  private _trigger: string;
  public get trigger(): string { return this._trigger; }
  public set trigger(value: string) {
    if (this._trigger !== value) {
      this._trigger = value;
    }
  }

  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ngZone: NgZone,
    private _authenticationService: McsAuthenticationService
  ) {
    this._isInitialDisplayed = true;
  }

  public ngAfterViewInit(): void {
    refreshView(() => {
      this._listenToRouterEvents();
      this._listenToNgZone();
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Listens to router events to end the pre-load animation
   */
  private _listenToRouterEvents(): void {
    this._router.events
      .pipe(takeUntil(this._destroySubject))
      .subscribe((event: RouterEvent) => {
        this._navigationInterceptor(event);
      });
  }

  /**
   * Listens to zone event to make sure the loader is always hiding
   */
  private _listenToNgZone(): void {
    // We need to this in order to make sure that the loader is always hiding
    this._ngZone.onStable.pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._hideLoader());
  }

  /**
   * Intercepts each navigation and do the corresponding process
   * @param event Event to intercept
   */
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
    if (!this._isInitialDisplayed) { return; }
    this.showLoadingScreen = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Hide the loader outside of angular process
   *
   * `@Note`: This will run asynchronously since it is called
   * outside angular that is not reflected in the DOM
   */
  private _hideLoader(): void {
    if (!this._authenticationService.coreCallsCompleted ||
      !this._isInitialDisplayed) { return; }

    this._isInitialDisplayed = false;
    this.showLoadingScreen = false;
    this._changeDetectorRef.markForCheck();
  }
}
