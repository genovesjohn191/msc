import { Subject } from 'rxjs';

import { McsConsole } from '@app/models';
import { KeyboardKey } from '@app/utilities';

import { ConsoleStatus } from '../console-status';

export interface IConsolePageEntity {
  consoleStateChange(): Subject<ConsoleStatus>;
  connect(details: McsConsole, container: HTMLElement): void;
  disconnect(): void;
  sendKeyCodes(keyCodes: KeyboardKey[]): void;
  sendInputString(value: string): void;
  isControllable(): boolean;
}
