import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  NgZone
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
  McsNotificationEventsService,
  McsTextContentProvider,
  McsApiJob,
  CoreDefinition,
  Key,
  McsDataStatus,
  McsErrorHandlerService
} from '../../core';
import { ServerCommand } from '../../features/servers';
import { ConsolePageService } from './console-page.service';

// JQuery script implementation
require('script-loader!../../../assets/scripts/jquery/jquery-1.7.2.min.js');
require('script-loader!../../../assets/scripts/jquery/jquery-ui.1.8.16.min.js');
require('script-loader!../../../assets/scripts/vcloud-js/wmks.min.js');
declare var $: any;
declare var WMKS: any;

// JQeuryUI dialog
const DIALOG_HEADER_SIZE = 35;

@Component({
  selector: 'mcs-console-page',
  templateUrl: './console-page.component.html',
  styleUrls: ['./console-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ConsolePageComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('consoleUiElement')
  public consoleUiElement: ElementRef;

  @ViewChild('consoleDialogElement')
  public consoleDialogElement: ElementRef;

  public get keyboardIconKey(): string {
    return CoreDefinition.ASSETS_SVG_KEYBOARD;
  }

  public get loadingIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public consolePageTextContent: any;
  public consoleIsConnecting: boolean;
  public consoleIsConnected: boolean;
  public consoleDisconnecting: boolean;

  public get poweredOn(): boolean { return this._poweredOn; }
  private _poweredOn: boolean = true;

  private _vmConsole: any;
  private _vmConsoleDialog: any;
  private _url: string;
  private _vmx: string;
  private _routeSubscription: Subscription;
  private _zoneSubscription: Subscription;
  private _notificationsSubscription: Subscription;
  private _serverId: string;

  public constructor(
    private _consoleService: ConsolePageService,
    private _textContentProvider: McsTextContentProvider,
    private _notificationsEventService: McsNotificationEventsService,
    private _activatedRoute: ActivatedRoute,
    private _zone: NgZone,
    private _errorHandlerService: McsErrorHandlerService
  ) {
    this.consoleDisconnecting = false;
    this.consoleIsConnecting = false;
    this.consoleIsConnected = false;
  }

  public ngOnInit() {
    this.consolePageTextContent = this._textContentProvider.content.consolePage;
    this._routeSubscription = this._activatedRoute.params
      .subscribe((params) => {
        this._serverId = params['id'];
        this._setupVmConsole(this._serverId);
      });
    this._listenToActiveServer();

    // Subscribe to the angular zone to check weather the console
    // is already displayed and adjust the screensize of the vm console
    this._zoneSubscription = this._zone.onStable.subscribe(() => {
      this._resizeConsoleScreen(window.innerHeight, window.innerWidth);
    });
  }

  public ngAfterViewInit() {
    refreshView(() => {
      if (this.consoleUiElement) {
        this._vmConsole = $(this.consoleUiElement.nativeElement).wmks({
          enableUint8Utf8: true,
          position: WMKS.CONST.Position.LEFT_TOP
        });
      }
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._routeSubscription);
    unsubscribeSafely(this._zoneSubscription);
    unsubscribeSafely(this._notificationsSubscription);
  }

  public onClickCtrlAltDelete() {
    // TODO: Set the corresponding key to power on the server
    this._sendKeyCodes([
      Key.Ctrl,
      Key.Alt,
      Key.Delete
    ]);
  }

  private _disconnectVmConsole(): void {
    this.consoleIsConnected = false;
    this.consoleDisconnecting = true;
  }

  private _reconnectVmConsole(): void {
    this.consoleDisconnecting = false;
    this.consoleIsConnecting = false;
    this.consoleIsConnected = false;
    this._setupVmConsole(this._serverId);
  }

  private _setupVmConsole(serverId: any) {
    if (!serverId || this.consoleIsConnecting) { return; }
    this.consoleIsConnecting = true;

    this._consoleService.getServerConsole(serverId)
      .catch((error) => {
        // Handle common error status code
        this._errorHandlerService.handleHttpRedirectionError(error.status);
        return Observable.throw(error);
      })
      .subscribe((consoleData) => {
        if (consoleData && consoleData.content) {
          this._url = consoleData.content.url;
          this._vmx = consoleData.content.vmx;

          this._connectConsole();
          this.consoleIsConnected = true;
          this.consoleIsConnecting = false;
          this._createDialog();
          this._displayConsole();
        }
      });
  }

  private _connectConsole() {
    // Connect to vm console
    this._vmConsole.wmks('option', 'VCDProxyHandshakeVmxPath', this._vmx);
    this._vmConsole.wmks('connect', this._url);
  }

  private _sendKeyCodes(keyCodes: number[]) {
    if (!keyCodes) { return; }
    this._vmConsole.wmks('sendKeyCodes', keyCodes);
  }

  private _displayConsole(): void {
    // Display console dialog and set the visibility flag to true
    this._vmConsoleDialog.dialog('open');
  }

  private _resizeConsoleScreen(height: number, width: number) {
    let mainCanvasElement = document.getElementById('mainCanvas');
    if (!mainCanvasElement) { return; }

    mainCanvasElement.style.height = (height - DIALOG_HEADER_SIZE) + 'px';
    mainCanvasElement.style.width = width + 'px';
  }

  private _createDialog(): void {
    this._vmConsoleDialog = $(this.consoleDialogElement.nativeElement)
      .dialog({
        autoOpen: false,
        width: 'auto',
        modal: true,
        closeText: '',
        position: { my: 'left top', at: 'left top' }
      });
  }

  private _listenToActiveServer(): void {
    this._notificationsSubscription = this._notificationsEventService
      .changeServerPowerStateEvent
      .subscribe((job: McsApiJob) => {
        if (isNullOrEmpty(job)) { return; }

        if (job.dataStatus === McsDataStatus.Success &&
          job.clientReferenceObject.serverId === this._serverId) {
          this._poweredOn = !!(job.clientReferenceObject.commandAction === ServerCommand.Start);
        }
        if (!this._poweredOn) {
          this._disconnectVmConsole();
        }
        if (this._poweredOn && this.consoleDisconnecting) {
          this._reconnectVmConsole();
        }
      });
  }
}
