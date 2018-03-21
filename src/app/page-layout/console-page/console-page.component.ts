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
import {
  Subscription,
  Observable
} from 'rxjs/Rx';
import {
  refreshView,
  isNullOrEmpty,
  unsubscribeSafely
} from '../../utilities';
import {
  McsTextContentProvider,
  CoreDefinition,
  Key,
  McsApiConsole
} from '../../core';
import {
  Server,
  ServersRepository,
  ServersService,
  ServerCommand
} from '../../features/servers';
import { ConsolePageRepository } from './console-page.repository';

// JQuery script implementation
require('script-loader!../../../assets/scripts/jquery/jquery-1.7.2.min.js');
require('script-loader!../../../assets/scripts/jquery/jquery-ui.1.8.16.min.js');
require('script-loader!../../../assets/scripts/vcloud-js/wmks.min.js');
declare var $: any;

const OTHER_ELEMENT_WIDTH = 0;
const OTHER_ELEMENT_HEIGHT = 44;
const BROWSER_WIDTH = 18;
const BROWSER_HEIGHT = 60;

enum VmConsoleStatus {
  Error = -1,
  None = 0,
  Connecting = 1,
  Connected = 2,
  Disconnected = 3
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

  public textContent: any;

  @ViewChild('consoleUiElement')
  public consoleUiElement: ElementRef;

  // Icons key variables
  public get keyboardIconKey(): string {
    return CoreDefinition.ASSETS_SVG_KEYBOARD;
  }

  public get loadingIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
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
  private _server: Server;
  public get server(): Server { return this._server; }
  public set server(value: Server) {
    this._server = value;
    this._serverStatusChanged();
  }

  // Other variables
  private _vmConsole: any;
  private _serverId: string;
  private _paramChangedSubscription: Subscription;
  private _serverChangedSubscription: Subscription;

  public get vmConsoleStatusEnum() {
    return VmConsoleStatus;
  }

  public get serverCommandEnum() {
    return ServerCommand;
  }

  public constructor(
    private _consoleRepository: ConsolePageRepository,
    private _textContentProvider: McsTextContentProvider,
    private _serversRepository: ServersRepository,
    private _serversService: ServersService,
    private _activatedRoute: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.consoleStatus = VmConsoleStatus.None;
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.consolePage;
    this._listenToParamChanged();
    this._listenToServerChanged();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      this._configureVmConsole();
      this._registerVmConsoleEvents();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._paramChangedSubscription);
    unsubscribeSafely(this._serverChangedSubscription);
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
    this._serversService.executeServerCommand({ server: this.server }, action);
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
    this._consoleRepository.findRecordById(serverId)
      .catch((error) => {
        // Handle common error status code
        this.consoleStatus = VmConsoleStatus.Error;
        return Observable.throw(error);
      })
      .subscribe((response: McsApiConsole) => {
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
    this._serversRepository.findRecordById(serverId)
      .subscribe((response) => {
        this.server = response;
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Event that emits when server status has been changed
   */
  private _serverStatusChanged(): void {
    if (isNullOrEmpty(this.server)) { return; }
    // Set disconnected when server is powered of
    if (!this.server.isPoweredOn) {
      this.consoleStatus = VmConsoleStatus.Disconnected;
    }

    // Reconnect vm console when server is disconnected
    this._reconnectVmConsole();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listen to servers data change in the repository
   */
  private _listenToServerChanged(): void {
    this._serverChangedSubscription = this._serversRepository
      .dataRecordsChanged
      .subscribe(() => {
        this._getServerById(this._serverId);
      });
  }

  /**
   * Listen to parameter change event of the router
   */
  private _listenToParamChanged(): void {
    this._paramChangedSubscription = this._activatedRoute.params
      .subscribe((params) => {
        this._serverId = params['id'];
        this._getServerById(this._serverId);
        this._connectVmConsole(this._serverId);
      });
  }
}
