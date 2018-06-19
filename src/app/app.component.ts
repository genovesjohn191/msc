import {
  Component,
  ViewEncapsulation,
  AfterViewInit,
  OnInit,
  OnDestroy,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
  NgZone
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsNotificationJobService,
  McsTextContentProvider,
  McsSnackBarService,
  McsSnackBarRef,
  McsSnackBarConfig,
  McsConnectionStatus,
  CoreDefinition
} from './core';
import {
  unsubscribeSubject,
  refreshView,
  isNullOrEmpty,
  animateFactory
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

export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  public textContent: any;
  public showLoadingScreen: boolean = true;
  public stompErrorStatusBarRef: McsSnackBarRef<any>;
  public stompSuccessStatusBarRef: McsSnackBarRef<any>;

  @ViewChild('stompErrorStatusTemplate')
  private _stompErrorStatusTemplate: TemplateRef<any>;

  @ViewChild('stompSucessStatusTemplate')
  private _stompSucessStatusTemplate: TemplateRef<any>;

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

  public get checkIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHECK;
  }

  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider,
    private _ngZone: NgZone,
    private _snackBarRefService: McsSnackBarService,
    private _notificationJobService: McsNotificationJobService
  ) {
    this._isInitialDisplayed = true;
  }

  public ngOnInit(): void {
    this.textContent = this._textContentProvider.content.applicationPage;
  }

  public ngAfterViewInit(): void {
    refreshView(() => {
      this._listenToStompStatus();
      this._listenToRouterEvents();
      this._listenToNgZone();
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Reconnects the websocket instance in-case of failure connection
   */
  public reconnectWebsocket(): void {
    let isConnected = !isNullOrEmpty(this._notificationJobService)
      && this._notificationJobService.connectionStatus === McsConnectionStatus.Success;
    if (isConnected) { return; }
    this._hideStompErrorStatusBar();
    this._hideStompSuccessStatusBar();
    this._notificationJobService.reConnectWebstomp();
  }

  /**
   * Listens to stomp connection status to displays the snackbar when error occured
   */
  private _listenToStompStatus(): void {
    this._notificationJobService.connectionStatusStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe((connectionStatus) => {
        // Stomp is connected
        let stompIsConnected = !isNullOrEmpty(this.stompErrorStatusBarRef) &&
          (connectionStatus === McsConnectionStatus.Success);
        if (stompIsConnected) {
          this._hideStompErrorStatusBar();
          this._showStompSuccessStatusBar();
          return;
        }

        // Stomp has error
        let stompHasError = connectionStatus < 0;
        if (stompHasError) {
          this._hideStompSuccessStatusBar();
          this._showStompErrorStatusBar();
        }
      });
  }

  /**
   * Shows the stomp error status bar in lower left as a snackbar
   */
  private _showStompErrorStatusBar(): void {
    this.stompErrorStatusBarRef = this._snackBarRefService.open(
      this._stompErrorStatusTemplate,
      {
        id: 'stomp-error-status-bar',
        verticalPlacement: 'bottom',
        horizontalAlignment: 'start'
      } as McsSnackBarConfig
    );
  }

  /**
   * Hide the stomp error status bar in lower left
   */
  private _hideStompErrorStatusBar(): void {
    if (isNullOrEmpty(this.stompErrorStatusBarRef)) { return; }
    this.stompErrorStatusBarRef.close();
  }

  /**
   * Shows the stomp success status bar
   */
  private _showStompSuccessStatusBar(): void {
    this.stompSuccessStatusBarRef = this._snackBarRefService.open(
      this._stompSucessStatusTemplate,
      {
        duration: 5000,
        id: 'stomp-success-status-bar',
        verticalPlacement: 'bottom',
        horizontalAlignment: 'start'
      } as McsSnackBarConfig
    );
  }

  /**
   * Hide the stomp success status bar
   */
  private _hideStompSuccessStatusBar(): void {
    if (isNullOrEmpty(this.stompSuccessStatusBarRef)) { return; }
    this.stompSuccessStatusBarRef.close();
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
    if (!this._isInitialDisplayed) { return; }
    this._isInitialDisplayed = false;
    this.showLoadingScreen = false;
    this._changeDetectorRef.markForCheck();
  }
}
