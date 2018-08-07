import { Injectable } from '@angular/core';
import { McsCookieService } from './mcs-cookie.service';
import { isNullOrEmpty } from '../../utilities';

// Constant declaration
const LOGGING_ENABLE_DEF = '_enableMcsObserver';

@Injectable()
export class McsLoggerService {
  /**
   * Flag that determine whether the tracer will
   * print in the console
   */
  private _logIsEnabled: boolean = false;
  private get logIsEnabled(): boolean {
    if (!this._logIsEnabled) { this._setup(); }
    return this._logIsEnabled;
  }

  /**
   * Method name of the previous method
   */
  private _saveMethodName: string = '';

  constructor(private _cookieService: McsCookieService) {
    this._setup();
  }

  /**
   * Trace the current method execution and print it on the console
   *
   * `Note:` This should not be use when tracing async process like api calls
   * because the timing of the response was undetermined
   * @param message Message to print
   * @param optionalParams Optional parameters
   */
  public trace(message?: any, ...optionalParams: any[]): void {
    if (!this.logIsEnabled) { return; }
    let currentMethodName = this._getCurrentMethodName();
    let sameMethod = !!(this._saveMethodName.localeCompare(currentMethodName) === 0);

    if (sameMethod) {
      console.log(message, ...optionalParams);
    } else {
      console.groupEnd();
      console.group(currentMethodName);
      console.log(message, ...optionalParams);
      this._saveMethodName = currentMethodName;
    }
  }

  /**
   * Start the grouping of the trace based on the group title
   * @param groupTitle Group title
   */
  public traceStart(groupTitle: string): void {
    if (!this.logIsEnabled) { return; }

    console.groupEnd();
    console.group(groupTitle);
  }

  /**
   * End the grouping of the trace and print it in the console
   * @param message Message to print
   * @param optionalParams Optional parameters
   */
  public traceEnd(message?: any, ...optionalParams: any[]): void {
    if (!this.logIsEnabled) { return; }

    if (!isNullOrEmpty(message)) {
      console.log(message, ...optionalParams);
    }
    console.groupEnd();
  }

  /**
   * Trace the current method execution and print as INFORMATION in the console
   * @param message Message to print
   * @param optionalParams Optional parameters
   */
  public traceInfo(message?: any, ...optionalParams: any[]): void {
    if (!this.logIsEnabled) { return; }
    console.info(message, ...optionalParams);
  }

  /**
   * Trace the current method execution and print as WARNING in the console
   * @param message Message to print
   * @param optionalParams Optional parameters
   */
  public traceWarning(message?: any, ...optionalParams: any[]): void {
    if (!this.logIsEnabled) { return; }
    console.warn(message, ...optionalParams);
  }

  /**
   * Trace the current method execution and print as ERROR in the console
   * @param message Message to print
   * @param optionalParams Optional parameters
   */
  public traceError(message?: any, ...optionalParams: any[]): void {
    if (!this.logIsEnabled) { return; }
    console.error(message, ...optionalParams);
  }

  /**
   * Get the current running method name
   */
  private _getCurrentMethodName(): string {
    let stackTrace = new Error().stack;
    // Index 2 is always the method name of the error stack
    let methodName = stackTrace.split('\n')[3].trim();
    methodName = methodName.substr(0, methodName.indexOf('('));
    return methodName;
  }

  /**
   * Setup the logging by setting the flag if it is enabled
   */
  private _setup(): void {
    // Get the logging flag in the
    if (this._cookieService.getItem<string>(LOGGING_ENABLE_DEF)) {
      this._logIsEnabled = true;
    }
  }
}
