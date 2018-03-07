import { Injectable } from '@angular/core';
import { McsAssetsProvider } from '../../core';
import { isNullOrEmpty } from '../../utilities';

export enum ImageType {
  Svg = 0,
  Png = 1
}
export interface Image {
  value: string;
  type: ImageType;
}

@Injectable()
export class ImageService {

  private _images: Map<string, Image>;

  constructor(private _assetsProvider: McsAssetsProvider) {
    this._images = new Map<string, Image>();
  }

  /**
   * Returns the image details based on the inputted key
   * @param key Image key to be searched in the list of assets
   */
  public getImageDetails(key: string): Image {
    // Find in the map first for fast searching in cached memory
    if (this._images.has(key)) { return this._images.get(key); }

    let image: Image;
    let imageUrl: string = '';
    imageUrl = this._assetsProvider.getImagePath(key);
    if (imageUrl) {
      image = {} as any;
      image.value = imageUrl;
      image.type = this._getImageTypeByUrl(imageUrl);
    }

    // Add image on the map list
    this._images.set(key, image);
    return image;
  }

  /**
   * Returns the image type by url
   */
  private _getImageTypeByUrl(_url: string): ImageType {
    if (isNullOrEmpty(_url)) { return ImageType.Png; }
    let fileExtension = _url.split('.').pop();
    return fileExtension.includes('svg') ? ImageType.Svg : ImageType.Png;
  }
}
