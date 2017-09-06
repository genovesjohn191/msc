import {
  Injectable,
  Optional
} from '@angular/core';

/** Core Configuration */
import { CoreConfig } from '../core.config';
import { CoreDefinition } from '../core.definition';
import { isNullOrEmpty } from '../../utilities';

@Injectable()
export class McsAssetsProvider {
  private _images: Map<string, string>;
  private _fontIcons: Map<string, string>;
  private _svgIcons: Map<string, string>;
  private _gifIcons: Map<string, string>;
  private _config: any;

  constructor(private _coreConfig: CoreConfig) {
    this._fontIcons = new Map<string, string>();
    this._svgIcons = new Map<string, string>();
    this._images = new Map<string, string>();
    this._gifIcons = new Map<string, string>();
    this.load();
  }

  /**
   * This will get the font awesome icon class on the map list
   * based on the key provided
   * @param key Icon Key
   */
  public getFontAwesomeIconClass(key: string): string {
    let value: string = null;

    // Get icon path
    if (this._fontIcons.has(key)) {
      value = this._fontIcons.get(key);
    } else {
      value = this._config.fontIcons[key];
      this._fontIcons.set(key, value);
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
      value = isNullOrEmpty(value) ? value : `${this._coreConfig.iconRoot}/${value}`;
      this._svgIcons.set(key, value);
    }

    // Return value (SVG icon path)
    return value;
  }

  /**
   * Get GIF Icon Path from the given key
   * @param key Icon Key
   */
  public getGifIconPath(key: string): string {
    let value: string = null;

    // Get icon path
    if (this._gifIcons.has(key)) {
      value = this._gifIcons.get(key);
    } else {
      value = this._config.gifIcons[key];
      value = isNullOrEmpty(value) ? value : `${this._coreConfig.iconRoot}/${value}`;
      this._gifIcons.set(key, value);
    }

    // Return value (GIF icon path)
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
    return `${this._coreConfig.imageRoot}/${value}`;
  }

  /**
   * Load assets configuration
   */
  private load(): void {
    this._config = require('../../config/assets.config.json');
  }
}
