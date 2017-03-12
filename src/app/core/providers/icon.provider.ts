import { Injectable } from '@angular/core';

@Injectable()
export class IconProvider {

  private _icons: Map<string, string>;
  private _config: object;

  constructor() {
    this._icons = new Map<string, string>();
    this.load();
  }

  /**
   * Get Icon Path from the given key
   * @param key Icon Key
   */
  public getIcon(key: string): string {
    let value: string = null;

    // Get icon path
    if (this._icons.has(key)) {
      value = this._icons.get(key);
    } else {
      value = this._config[key];
      this._icons.set(key, value);
    }

    // Return value (icon path)
    return value;
  }

  /**
   * Load icons configuration
   */
  private load(): void {
    this._config = require('../../config/icon.config.json');
  }
}
