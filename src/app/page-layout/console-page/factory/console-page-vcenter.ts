import { Subject } from 'rxjs';

import { McsConsole } from '@app/models';
import {
  isNullOrEmpty,
  KeyboardKey
} from '@app/utilities';

import { ConsoleStatus } from '../console-status';
import { IConsolePageEntity } from './console-page-entity.interface';

export class ConsolePageVCenter implements IConsolePageEntity {

  private _consoleStateChange: Subject<ConsoleStatus>;
  private _consoleIFrame: HTMLIFrameElement;

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

    this._consoleIFrame = this._consoleIFrame ||  this._createIFrameElement();
    this._consoleIFrame.src = details.url;
    container.appendChild(this._consoleIFrame);

    this._consoleStateChange.next(ConsoleStatus.Connected);
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
  public sendKeyCodes(keyCodes: KeyboardKey[]): void {
    if (isNullOrEmpty(keyCodes)) { return; }
  }

  /**
   * Sends input string to the console
   * @param value string value to be sent
   */
  public sendInputString(value: string): void {
    if (isNullOrEmpty(value)) { return; }
  }

  /**
   * Returns true when the control of the console can be controlled
   */
  public isControllable(): boolean {
    return false;
  }

  /**
   * Creates the iframe element
   */
  private _createIFrameElement(): HTMLIFrameElement {
    let iFrameConsole = document.createElement('iframe');
    iFrameConsole.classList.add('console-iframe-wrapper');
    return iFrameConsole;
  }
}
