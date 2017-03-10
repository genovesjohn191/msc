import { Injectable } from '@angular/core';

@Injectable()
export class IconProvider {

  /**
   * Icons Property (get/set)
   */
  private _icons: Map<string, string>;
  public get icons(): Map<string, string> {
    return this._icons;
  }

  constructor() {
    this.loadIcons();
  }

  /**
   * Load icons configuration
   */
  private loadIcons(): void {
    let config = require('../../config/icon.config.json');

    // Set icon data (Key/Value)
    this._icons = new Map<string, string>();
    if (config != null) {
      for (let icon of config.icons) {
        this._icons.set(icon.key, icon.value);
      }
    }
  }
}
