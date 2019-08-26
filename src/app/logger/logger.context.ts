export class LoggerContext {

  /**
   * Returns the instance of the LoggerContext
   */
  public static getInstance(): LoggerContext {
    if (this._loggerContextInstance === null || this._loggerContextInstance === undefined) {
      this._loggerContextInstance = new LoggerContext();
    }
    return this._loggerContextInstance;
  }
  private static _loggerContextInstance: LoggerContext;

  private _loggingEnabled: boolean;

  private constructor() { }

  /**
   * Returns true when logging is enabled
   */
  public get isLoggingEnabled(): boolean {
    return this._loggingEnabled;
  }

  /**
   * Sets the logging status
   * @param enabled Enabled flag for tracing
   */
  public setLoggingState(enabled: boolean): void {
    this._loggingEnabled = enabled;
  }
}
