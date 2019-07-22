import { Subject } from 'rxjs';
import {
  McsConsole,
  Key
} from '@app/models';
import { ConsoleStatus } from '../console-status';

export interface IConsolePageEntity {
  consoleStateChange(): Subject<ConsoleStatus>;
  connect(details: McsConsole, container: HTMLElement): void;
  disconnect(): void;
  sendKeyCodes(keyCodes: Key[]): void;
  isControllable(): boolean;
}
