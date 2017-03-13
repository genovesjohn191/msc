import { Injectable } from '@angular/core';

@Injectable()
export class EnvironmentProvider {
  /**
   * Environment Property (get/set)
   */
  private _environment: string;
  public get environment(): string {
    return this._environment;
  }

  /**
   * Host Property (get/set)
   */
  private _host: string;
  public get host(): string {
    return this._host;
  }

  constructor() {
    this.loadEnvironment();
  }

  /**
   * Load Environment Settings (production/development mode)
   */
  private loadEnvironment(): void {
    let config = require('../../config/environment.config.json');

    if (config != null) {
      this._environment = config.fusion_environment;

      switch (this._environment) {
        case 'production':
          this._host = config.fusion_production;
          break;

        case 'development':
        default:
          this._host = config.fusion_development;
          break;
      }
    }
  }
}
