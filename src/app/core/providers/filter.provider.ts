import {
  Injectable,
  Optional
} from '@angular/core';

@Injectable()
export class FilterProvider {
  private _filters: Map<string, any>;
  private _config: any;

  constructor() {
    this._filters = new Map<string, any>();
    this.load();
  }

  /**
   * Get default filters (JSON Format)
   * @param key Filter item Key
   */
  public getDefaultFilters(key: string): any {
    let value: any = null;

    // Get default filter items
    if (this._filters.has(key)) {
      value = this._filters.get(key);
    } else {
      value = this._config[key];
      this._filters.set(key, value);
    }

    // Return value (default filter items)
    return value;
  }

  /**
   * Load filter configuration
   */
  private load(): void {
    this._config = require('../../config/filter.config.json');
  }
}
