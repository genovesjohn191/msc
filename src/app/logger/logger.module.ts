import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { LoggerConfig } from './logger.config';
import { LoggerContext } from './logger.context';

@NgModule({
  providers: [ ]
})

export class LoggerModule {

  public static forRoot(config: (...args: any[]) => LoggerConfig, injectors?: any[]): ModuleWithProviders {
    return {
      ngModule: LoggerModule,
      providers: [
        { provide: LoggerConfig, useFactory: config, deps: injectors }
      ]
    };
  }

  constructor(
    @Optional() @SkipSelf() parentModule: LoggerModule,
    @Optional() private _config: LoggerConfig
  ) {
    if (parentModule) {
      throw new Error(
        'LoggerModule is already loaded. Import it in the AppModule only');
    }
    this._updateLoggerContext();
  }

  /**
   * Updates the logger context instance
   */
  private _updateLoggerContext(): void {
    let loggerContext = LoggerContext.getInstance();
    loggerContext.setLoggingState(this._config.enableLogging);
  }
}
