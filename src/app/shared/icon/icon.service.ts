import { Injectable } from '@angular/core';
import { McsAssetsProvider } from '@app/core';

/**
 * Icon type for determining the type of Icon
 */
export enum IconType {
  FontAwesome = 0,
  Svg = 1,
  Gif = 2
}

/**
 * Icon content to get the value to
 */
export interface Icon {
  value: string;
  type: IconType;
}

@Injectable()
export class IconService {

  private _icons: Map<string, Icon>;

  constructor(private _assetsProvider: McsAssetsProvider) {
    this._icons = new Map<string, Icon>();
  }

  /**
   * This will get the icon based on the inputted key
   * and it will search in all icons directory
   * @param key Icon key to be searched in the list
   */
  public getIconDetails(key: string): Icon {
    let icon: Icon;
    let iconValue: string = '';

    // Find in the map first for fast searching in cached memory
    if (this._icons.has(key)) {
      icon = this._icons.get(key);
    }

    // Find the record in SVG
    if (!icon) {
      iconValue = this._assetsProvider.getSvgIconPath(key);
      if (iconValue) {
        icon = {} as any;
        icon.value = iconValue;
        icon.type = IconType.Svg;
      }
    }

    // Find the record in GIF
    if (!icon) {
      iconValue = this._assetsProvider.getGifIconPath(key);
      if (iconValue) {
        icon = {} as any;
        icon.value = iconValue;
        icon.type = IconType.Gif;
      }
    }

    // Find the record in Font Awesome
    if (!icon) {
      iconValue = this._assetsProvider.getFontAwesomeIconClass(key);
      if (iconValue) {
        icon = {} as any;
        icon.value = iconValue;
        icon.type = IconType.FontAwesome;
      }
    }

    // Add icon on the map list
    this._icons.set(key, icon);
    return icon;
  }
}
