import {
  Component,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsNotificationJobService,
  McsNotificationContextService
} from '@app/core';
import {
  isNullOrEmpty,
  CommonDefinition,
  unsubscribeSafely
} from '@app/utilities';
import { NetworkStatus } from '@app/models';
import {
  SnackBarService,
  SnackBarRef,
  SnackBarConfig
} from '@app/shared';

const DEFAULT_SUCCESS_SNACKBAR_DURATION = 5000;

@Component({
  selector: 'mcs-web-stomp',
  templateUrl: './web-stomp.component.html'
})

export class WebStompComponent implements AfterViewInit, OnDestroy {
  public stompErrorStatusBarRef: SnackBarRef<any>;
  public stompSuccessStatusBarRef: SnackBarRef<any>;

  @ViewChild('stompErrorStatusTemplate')
  private _stompErrorStatusTemplate: TemplateRef<any>;

  @ViewChild('stompSucessStatusTemplate')
  private _stompSucessStatusTemplate: TemplateRef<any>;

  private _encounteredError: boolean;
  private _destroySubject = new Subject<void>();

  /**
   * Returns the check icon key
   */
  public get checkIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHECK;
  }

  constructor(
    private _snackBarRefService: SnackBarService,
    private _notificationJobService: McsNotificationJobService,
    private _notificationContext: McsNotificationContextService
  ) { }

  public ngAfterViewInit() {
    this._listenToStompStatus();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Reconnects the websocket instance in-case of failure connection
   */
  public reconnectWebsocket(): void {
    this._hideStompErrorStatusBar();
    this._hideStompSuccessStatusBar();
  }

  /**
   * Listens to stomp connection status to displays the snackbar when error occured
   */
  private _listenToStompStatus(): void {
    this._notificationJobService.connectionStatusStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe((connectionStatus) => {
        // Stomp is connected
        let stompIsConnected = !isNullOrEmpty(this.stompErrorStatusBarRef)
          && (connectionStatus === NetworkStatus.Success)
          && this._encounteredError;
        if (stompIsConnected) {
          this._hideStompErrorStatusBar();
          this._showStompSuccessStatusBar();
          this._notificationContext.subscribeToActiveJobs();
          return;
        }

        // Stomp has error
        let stompHasError = connectionStatus < 0;
        if (stompHasError) {
          this._encounteredError = true;
          this._hideStompSuccessStatusBar();
          this._showStompErrorStatusBar();
        }
      });
  }

  /**
   * Shows the stomp success status bar
   */
  private _showStompSuccessStatusBar(): void {
    if (isNullOrEmpty(this._stompSucessStatusTemplate)) { return; }

    this.stompSuccessStatusBarRef = this._snackBarRefService.open(
      this._stompSucessStatusTemplate,
      {
        id: 'stomp-success-status-bar',
        duration: DEFAULT_SUCCESS_SNACKBAR_DURATION,
        verticalPlacement: 'bottom',
        horizontalAlignment: 'end'
      } as SnackBarConfig
    );
  }

  /**
   * Shows the stomp error status bar in lower left as a snackbar
   */
  private _showStompErrorStatusBar(): void {
    if (isNullOrEmpty(this._stompErrorStatusTemplate)) { return; }

    this.stompErrorStatusBarRef = this._snackBarRefService.open(
      this._stompErrorStatusTemplate,
      {
        id: 'stomp-error-status-bar',
        verticalPlacement: 'bottom',
        horizontalAlignment: 'end'
      } as SnackBarConfig
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
   * Hide the stomp success status bar
   */
  private _hideStompSuccessStatusBar(): void {
    if (isNullOrEmpty(this.stompSuccessStatusBarRef)) { return; }
    this.stompSuccessStatusBarRef.close();
  }
}
