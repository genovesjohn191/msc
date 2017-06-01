import {
  Injectable,
  Optional
} from '@angular/core';

/** Core Configuration */
import { CoreConfig } from '../core.config';

@Injectable()
export class McsAssetsProvider {
  private _images: Map<string, string>;
  private _icons: Map<string, string>;
  private _svgIcons: Map<string, string>;
  private _config: any;

  constructor(private _coreConfig: CoreConfig) {
    this._icons = new Map<string, string>();
    this._svgIcons = new Map<string, string>();
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
   * Get SVG Icon Path from the given key
   * @param key Icon Key
   */
  public getSvgIconPath(key: string): string {
    let value: string = null;

    // Get icon path
    if (this._svgIcons.has(key)) {
      value = this._svgIcons.get(key);
    } else {
      value = this._config.svgIcons[key];
      this._svgIcons.set(key, value);
    }

    // Return value (SVG icon path)
    return `${this._coreConfig.iconRoot}/${value}`;
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
    return `${this._coreConfig.imageRoot}/${value}`;
  }

  /**
   * Load assets configuration
   */
  private load(): void {
    this._config = require('../../config/assets.config.json');
  }
}
