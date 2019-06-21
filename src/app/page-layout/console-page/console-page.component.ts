import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  Subject,
  Subscription,
  empty
} from 'rxjs';
import {
  catchError,
  takeUntil
} from 'rxjs/operators';
import {
  isNullOrEmpty,
  getSafeProperty,
  unsubscribeSafely
} from '@app/utilities';
import {
  CoreDefinition,
  McsSessionHandlerService
} from '@app/core';
import {
  Key,
  McsConsole,
  McsJob,
  McsServer,
  ServerCommand,
  VmPowerstateCommand
} from '@app/models';
import { McsApiService } from '@app/services';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/event-manager';

// JQuery script implementation
require('script-loader!../../../assets/scripts/jquery/jquery-1.12.4.min.js');
require('script-loader!../../../assets/scripts/jquery/jquery-ui.1.12.1.min.js');
require('script-loader!../../../assets/scripts/vcloud-js/wmks.min.js');
declare var $: any;

const OTHER_ELEMENT_WIDTH = 0;
const OTHER_ELEMENT_HEIGHT = 44;
const BROWSER_WIDTH = 18;
const BROWSER_HEIGHT = 60;
const CLOSING_DEFAULT_TIME_IN_SECONDS = 3;

enum VmConsoleStatus {
  Error = -1,
  None = 0,
  Connecting = 1,
  Connected = 2,
  Disconnected = 3,
  Closing = 4
}

@Component({
  selector: 'mcs-console-page',
  templateUrl: './console-page.component.html',
  styleUrls: ['./console-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'console-page-wrapper',
    '[class.console-disconnected]': 'consoleStatus === vmConsoleStatusEnum.Disconnected',
    '[class.console-connecting]': 'consoleStatus === vmConsoleStatusEnum.Connecting',
  }
})

export class ConsolePageComponent implements OnInit, AfterViewInit, OnDestroy {
  public stopping: boolean;
  public closingTime: number;

  @ViewChild('consoleUiElement')
  public consoleUiElement: ElementRef;

  /**
   * Server console status based on progress of the VMWare
   */
  private _consoleStatus: VmConsoleStatus;
  public get consoleStatus(): VmConsoleStatus { return this._consoleStatus; }
  public set consoleStatus(value: VmConsoleStatus) {
    this._consoleStatus = value;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * VM console server
   */
  private _server: McsServer;
  public get server(): McsServer { return this._server; }
  public set server(value: McsServer) {
    this._server = value;
    this._serverStatusChanged();
  }

  // Other variables
  private _intervalId: number;
  private _vmConsole: any;
  private _serverId: string;
  private _destroySubject = new Subject<void>();
  private _resetVmPasswordHandler: Subscription;

  public constructor(
    private _apiService: McsApiService,
    private _translateService: TranslateService,
    private _eventDispatcher: EventBusDispatcherService,
    private _sessionHandler: McsSessionHandlerService,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.consoleStatus = VmConsoleStatus.None;
    this.closingTime = CLOSING_DEFAULT_TIME_IN_SECONDS;
  }

  public ngOnInit() {
    this._registerEventHandlers();
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._configureVmConsole();
      this._registerVmConsoleEvents();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._resetVmPasswordHandler);
  }

  public get vmConsoleStatusEnum() {
    return VmConsoleStatus;
  }

  public get serverCommandEnum() {
    return ServerCommand;
  }

  public get keyboardIconKey(): string {
    return CoreDefinition.ASSETS_SVG_KEYBOARD;
  }

  public get startIconKey(): string {
    return CoreDefinition.ASSETS_SVG_START;
  }

  public get restartIconKey(): string {
    return CoreDefinition.ASSETS_SVG_RESTART;
  }

  public get stopIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STOP;
  }

  public get stoppingText(): string {
    return this._translateService.instant(
      'consolePage.stopping', { timer: this.closingTime.toString() }
    );
  }

  /**
   * Event that emits when send request for control + alt + delete is clicked
   */
  public onClickCtrlAltDelete() {
    this._sendKeyCodes([
      Key.Ctrl,
      Key.Alt,
      Key.Delete
    ]);
  }

  /**
   * Execute the server power state based on action provided
   * @param action Action to be invoked
   */
  public executeServerCommand(action: ServerCommand): void {
    if (isNullOrEmpty(action)) { return; }
    this.stopping = action === ServerCommand.Stop;

    this._apiService.sendServerPowerState(this.server.id, {
      command: VmPowerstateCommand[ServerCommand[action]],
      clientReferenceObject: {
        serverId: this.server.id
      }
    }).subscribe();
  }

  /**
   * Registers the event handlers
   */
  private _registerEventHandlers() {
    this._sessionHandler.onCurrentUserChanged()
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._onSessionChangedEventHandler());

    this._sessionHandler.onTargetCompanyChanged()
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._onSessionChangedEventHandler());

    this._activatedRoute.params
      .pipe(takeUntil(this._destroySubject))
      .subscribe((params) => this._paramChangedEventHandler(params));

    this._resetVmPasswordHandler = this._eventDispatcher.addEventListener(
      McsEvent.jobServerResetPassword, this._resetVmPasswordEventHandler.bind(this));
  }

  /**
   * Event that emits when the session has been changed
   */
  private _onSessionChangedEventHandler() {
    this.closingTime = 0;
    this._closeWindow();
  }

  /**
   * Event that emits when the parameter has been changed
   * @param params Params content
   */
  private _paramChangedEventHandler(params: any) {
    this._serverId = params['id'];
    this._getServerById(this._serverId);
    this._connectVmConsole(this._serverId);
  }

  /**
   * Event that emits when the reset VM password has triggered
   * @param response Job response to be check
   */
  private _resetVmPasswordEventHandler(response: McsJob) {
    let jobServerId = getSafeProperty(response, (obj) => obj.clientReferenceObject.serverId);
    if (jobServerId !== this._serverId) { return; }
    this._getServerById(this._serverId);
  }

  /**
   * Configure vm console settings
   */
  private _configureVmConsole(): void {
    if (isNullOrEmpty(this.consoleUiElement)) { return; }
    this._vmConsole = $(this.consoleUiElement.nativeElement).wmks({
      useVNCHandshake: false,
      enableUint8Utf8: true,
      rescale: true
    });
  }

  /**
   * Register VM Console events for wmks element
   */
  private _registerVmConsoleEvents(): void {
    if (isNullOrEmpty(this._vmConsole)) { return; }
    this._vmConsole.bind('wmksconnecting', this._vmConnecting.bind(this));
    this._vmConsole.bind('wmksconnected', this._vmConnected.bind(this));
    this._vmConsole.bind('wmksdisconnected', this._vmDisconnected.bind(this));
    this._vmConsole.bind('wmkserror', this._vmError.bind(this));
    this._vmConsole.bind('wmksresolutionchanged', this._vmResolutionChanged.bind(this));
  }

  /**
   * Event that emits when VM console is connecting
   */
  private _vmConnecting(): void {
    this.consoleStatus = VmConsoleStatus.Connecting;
  }

  /**
   * Event that emits when VM console is connected
   */
  private _vmConnected(): void {
    this._vmConsole.wmks('option', 'allowMobileKeyboardInput', false);
    this._vmConsole.wmks('option', 'fitToParent', false);
    this.consoleStatus = VmConsoleStatus.Connected;
  }

  /**
   * Event that emits when VM console gets disconnected
   */
  private _vmDisconnected(): void {
    this.consoleStatus = VmConsoleStatus.Disconnected;
  }

  /**
   * Event that emits when VM console has error while connecting
   */
  private _vmError(): void {
    this.consoleStatus = VmConsoleStatus.Error;
  }

  /**
   * Event that emits when VM console resolution has changed
   */
  private _vmResolutionChanged(): void {
    this._fitToScreen();
  }

  /**
   * Connect to VM console based on server ID
   * @param serverId ServerID of the server to open the console
   */
  private _connectVmConsole(serverId: any) {
    if (isNullOrEmpty(serverId)) { return; }

    this.consoleStatus = VmConsoleStatus.Connecting;
    this._apiService.getServerConsole(serverId).pipe(
      catchError(() => {
        // Handle common error status code
        this.consoleStatus = VmConsoleStatus.Error;
        return empty();
      })
    ).subscribe((response: McsConsole) => {
      if (isNullOrEmpty(response)) { return; }
      this._vmConsole.wmks('option', 'VCDProxyHandshakeVmxPath', response.vmx);
      this._vmConsole.wmks('connect', response.url);
    });
  }

  /**
   * Reconnect VM Console when it gets disconnected
   */
  private _reconnectVmConsole(): void {
    let consoleIsDisconnected = this.server.isPoweredOn &&
      this.consoleStatus === VmConsoleStatus.Disconnected;
    if (!consoleIsDisconnected) { return; }

    this.consoleStatus = VmConsoleStatus.Connecting;
    this._connectVmConsole(this._serverId);
  }

  /**
   * Send the corresponding keycodes to the VM Console
   */
  private _sendKeyCodes(keyCodes: number[]) {
    if (!keyCodes) { return; }
    this._vmConsole.wmks('sendKeyCodes', keyCodes);
  }

  /**
   * Fit the Console based on the offset height and width of the VM
   */
  private _fitToScreen(): void {
    let mainCanvas = document.getElementById('mainCanvas') as HTMLCanvasElement;
    if (isNullOrEmpty(mainCanvas)) { return; }
    let consoleWidth = mainCanvas.width;
    let consoleHeight = mainCanvas.height;

    // values to pass to resize
    let displayWidth = consoleWidth + OTHER_ELEMENT_WIDTH + BROWSER_WIDTH;
    let displayHeight = consoleHeight + OTHER_ELEMENT_HEIGHT + BROWSER_HEIGHT;

    // Fit elements to screen
    let consoleContainer = this.consoleUiElement.nativeElement as HTMLElement;
    if (!isNullOrEmpty(consoleContainer)) {
      consoleContainer.style.width = `${consoleWidth}px`;
      consoleContainer.style.height = `${consoleHeight}px`;
    }
    window.resizeTo(displayWidth, displayHeight);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get server details by id provided
   * @param serverId Server id to get the server details
   */
  private _getServerById(serverId: any): void {
    if (isNullOrEmpty(this._serverId)) { return; }
    this._apiService.getServer(serverId).pipe(
      catchError(() => empty())
    ).subscribe((response) => {
      this.server = response;
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Event that emits when server status has been changed
   */
  private _serverStatusChanged(): void {
    if (isNullOrEmpty(this.server)) { return; }
    let closeConsoleWindow = this.stopping && this.server.isPoweredOff;
    if (closeConsoleWindow) {
      this.consoleStatus = VmConsoleStatus.Closing;
      if (!isNullOrEmpty(this._intervalId)) { clearInterval(this._intervalId); }
      this._intervalId = window.setInterval(this._closeWindow.bind(this), 1000);
      return;
    }

    // Set disconnected when server is powered of
    if (!this.server.isPoweredOn) {
      this.consoleStatus = VmConsoleStatus.Disconnected;
    }

    // Reconnect vm console when server is disconnected
    this._reconnectVmConsole();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Close the window within the specified time
   */
  private _closeWindow(): void {
    if (this.closingTime > 0) {
      --this.closingTime;
      this._changeDetectorRef.markForCheck();
      return;
    }
    window.close();
  }
}
