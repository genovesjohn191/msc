import { Subject } from 'rxjs';
import { isNullOrEmpty } from '@app/utilities';
import {
  McsConsole,
  Key
} from '@app/models';
import { IConsolePageEntity } from './console-page-entity.interface';
import { ConsoleStatus } from '../console-status';

// JQuery script implementation
require('script-loader!../../../../assets/scripts/jquery/jquery-3.4.1.min.js');
require('script-loader!../../../../assets/scripts/jquery/jquery-ui.1.12.1.min.js');
require('script-loader!../../../../assets/scripts/vcloud-js/wmks.min.js');
declare var $: any;

const OTHER_ELEMENT_WIDTH = 0;
const OTHER_ELEMENT_HEIGHT = 44;
const BROWSER_WIDTH = 18;
const BROWSER_HEIGHT = 60;

export class ConsolePageVCloud implements IConsolePageEntity {

  private _consoleStateChange: Subject<ConsoleStatus>;
  private _vmConsoleInstance: any;
  private _isConfigured: boolean;

  constructor() {
    this._consoleStateChange = new Subject();
  }

  /**
   * Connects to vm console
   * @param details Details of the console to be connected
   * @param container Container of the console
   */
  public connect(details: McsConsole, container: HTMLElement): void {
    this._consoleStateChange.next(ConsoleStatus.Connecting);
    if (!this._isConfigured) { this._configureVmConsole(container); }
    this._connectVmConsole(details);
  }

  /**
   * Disconnects the server console
   */
  public disconnect(): void {
    this._consoleStateChange.next(ConsoleStatus.Disconnected);
  }

  /**
   * Event that emits when the state of the console has been changed
   */
  public consoleStateChange(): Subject<ConsoleStatus> {
    return this._consoleStateChange;
  }

  /**
   * Sends key codes to the console
   * @param keyCodes Key codes to be sent
   */
  public sendKeyCodes(keyCodes: Key[]): void {
    if (isNullOrEmpty(keyCodes)) { return; }
    this._vmConsoleInstance.wmks('sendKeyCodes', keyCodes);
  }

  /**
   * Returns true when the control of the console can be controlled
   */
  public isControllable(): boolean {
    return true;
  }

  /**
   * Connects to vm console
   * @param details Details of the console to be connected
   */
  private _connectVmConsole(details: McsConsole): void {
    if (isNullOrEmpty(this._vmConsoleInstance)) {
      throw new Error(`Unable to connect to vm console because it was not instantiated.`);
    }
    this._vmConsoleInstance.wmks('option', 'VCDProxyHandshakeVmxPath', details.vmx);
    this._vmConsoleInstance.wmks('connect', details.url);
  }

  /**
   * Configures vm console
   * @param container Container of the vm console
   */
  private _configureVmConsole(container: HTMLElement): void {
    this._vmConsoleInstance = $(container).wmks({
      useVNCHandshake: false,
      enableUint8Utf8: true,
      rescale: true
    });

    this._vmConsoleInstance.bind('wmksconnecting', this._vmConnecting.bind(this));
    this._vmConsoleInstance.bind('wmksconnected', this._vmConnected.bind(this));
    this._vmConsoleInstance.bind('wmksdisconnected', this._vmDisconnected.bind(this));
    this._vmConsoleInstance.bind('wmkserror', this._vmError.bind(this));
    this._vmConsoleInstance.bind('wmksresolutionchanged', this._vmResolutionChanged.bind(this, container));

    this._isConfigured = true;
  }

  /**
   * Event that emits when VM console is connecting
   */
  private _vmConnecting(): void {
    this._consoleStateChange.next(ConsoleStatus.Connecting);
  }

  /**
   * Event that emits when VM console is connected
   */
  private _vmConnected(): void {
    this._vmConsoleInstance.wmks('option', 'allowMobileKeyboardInput', false);
    this._vmConsoleInstance.wmks('option', 'fitToParent', false);
    this._consoleStateChange.next(ConsoleStatus.Connected);
  }

  /**
   * Event that emits when VM console gets disconnected
   */
  private _vmDisconnected(): void {
    this._consoleStateChange.next(ConsoleStatus.Disconnected);
  }

  /**
   * Event that emits when VM console has error while connecting
   */
  private _vmError(): void {
    this._consoleStateChange.next(ConsoleStatus.Error);
  }

  /**
   * Event that emits when VM console resolution has changed
   */
  private _vmResolutionChanged(container: HTMLElement): void {
    this._fitToScreen(container);
  }

  /**
   * Fit the Console based on the offset height and width of the VM
   */
  private _fitToScreen(container: HTMLElement): void {
    let mainCanvas = document.getElementById('mainCanvas') as HTMLCanvasElement;
    if (isNullOrEmpty(mainCanvas)) { return; }
    let consoleWidth = mainCanvas.width;
    let consoleHeight = mainCanvas.height;

    // values to pass to resize
    let displayWidth = consoleWidth + OTHER_ELEMENT_WIDTH + BROWSER_WIDTH;
    let displayHeight = consoleHeight + OTHER_ELEMENT_HEIGHT + BROWSER_HEIGHT;

    // Fit elements to screen
    if (!isNullOrEmpty(container)) {
      container.style.width = `${consoleWidth}px`;
      container.style.height = `${consoleHeight}px`;
    }
    window.resizeTo(displayWidth, displayHeight);
  }
}
