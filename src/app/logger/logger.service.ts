import {
  Injectable,
  Optional
} from '@angular/core';
import { getSafeProperty } from '@app/utilities';

import { LoggerConfig } from './logger.config';

@Injectable()
export class LoggerService {

  constructor(@Optional() public _config: LoggerConfig) { }

  public get isLoggingEnabled(): boolean {
    return getSafeProperty(this._config, (obj) => obj.enableLogging, false);
  }

  /**
   * Logs information on the console
   * @param message Message to be logged
   * @param args Arguments to be logged in concat to message
   */
  public logInfo(message: string, ...args: any[]): void {
    if (!this.isLoggingEnabled) { return; }
    console.info(message, args);
  }

  /**
   * Logs error on the console
   * @param message Message to be logged
   * @param args Arguments to be logged in concat to message
   */
  public logError(message: string, ...args: any[]): void {
    if (!this.isLoggingEnabled) { return; }
    console.error(message, args);
  }
}
