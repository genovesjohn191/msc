import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Input,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  NgZone
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { refreshView } from '../../utilities';
import {
  McsTextContentProvider,
  McsBrowserService,
  CoreDefinition,
  Key,
  McsSize
} from '../../core';
import { ConsoleService } from './console-page.service';

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
  styles: [require('./console-page.component.scss')],
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

  public get playIconKey(): string {
    return CoreDefinition.ASSETS_FONT_PLAY;
  }

  public get stopIconKey(): string {
    return CoreDefinition.ASSETS_SVG_STOP;
  }

  public get restartIconKey(): string {
    return CoreDefinition.ASSETS_SVG_RESTART;
  }

  public get loadingIconKey(): string {
    return CoreDefinition.ASSETS_FONT_SPINNER;
  }

  public consoleVisible: boolean;
  public consolePageTextContent: any;

  private _vmConsole: any;
  private _vmConsoleDialog: any;

  private _url: string;
  private _vmx: string;
  private _routeSubscription: any;
  private _browserSubscription: any;
  private _zoneSubscription: any;
  private _windowSize: McsSize;

  public constructor(
    private _consoleService: ConsoleService,
    private _textContentProvider: McsTextContentProvider,
    private _browserService: McsBrowserService,
    private _elementRef: ElementRef,
    private _activatedRoute: ActivatedRoute,
    private _zone: NgZone
  ) {
    this.consoleVisible = false;
  }

  public ngOnInit() {
    this.consolePageTextContent = this._textContentProvider.content.consolePage;
    this._routeSubscription = this._activatedRoute.params
      .subscribe((params) => {
        this._setupVmConsole(params['id']);
      });

    // Subscribe to the angular zone to check weather the console
    // is already displayed and adjust the screensize of the vm console
    this._zoneSubscription = this._zone.onStable.subscribe((response) => {
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
    if (this._routeSubscription) {
      this._routeSubscription.unsubscribe();
    }
    if (this._zoneSubscription) {
      this._zoneSubscription.unsubscribe();
    }
  }

  public onClickPowerOn() {
    // TODO: Set the corresponding key to power on the server
    this._sendKeyCodes([
      Key.Ctrl,
      Key.Alt,
      Key.Delete
    ]);
  }

  public onClickRestart() {
    // TODO: Set the corresponding key to restart on the server
    this._sendKeyCodes([
      Key.Ctrl,
      Key.Alt,
      Key.Delete
    ]);
  }

  public onClickPowerOff() {
    // TODO: Set the corresponding key to power off the server
    this._sendKeyCodes([
      Key.Ctrl,
      Key.Alt,
      Key.Delete
    ]);
  }

  private _setupVmConsole(serverId: any) {
    if (!serverId) { return; }

    this._consoleService.getServerConsole(serverId)
      .subscribe((consoleData) => {
        if (consoleData && consoleData.content) {
          this._url = consoleData.content.url;
          this._vmx = consoleData.content.vmx;

          this._connectConsole();
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
    this.consoleVisible = true;
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
}
