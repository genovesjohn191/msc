import { Injectable } from '@angular/core';

@Injectable()
export class AssetsProvider {
  private prefix: string = 'assets/img/'; // TODO: Remove this, and set to actual environment

  private _icons: Map<string, string>;
  private _images: Map<string, string>;
  private _config: any;

  constructor() {
    this._icons = new Map<string, string>();
    this._images = new Map<string, string>();
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
      value = this._config.icons[key];
      this._icons.set(key, value);
    }

    // Return value (icon path)
    return value;
  }

  /**
   * Get Image Path from the given key
   * @param key Image Key
   */
  public getImagePath(key: string): string {
    let value: string = null;

    // Get image path
    if (this._images.has(key)) {
      value = this._images.get(key);
    } else {
      value = this._config.images[key];
      this._images.set(key, value);
    }

    // Return value (image path)
    return this.prefix + value;
  }

  /**
   * Load assets configuration
   */
  private load(): void {
    this._config = require('../../config/assets.config.json');
  }
}
