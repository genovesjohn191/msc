import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { finalize } from 'rxjs/operators/finalize';
import { map } from 'rxjs/operators/map';
import { share } from 'rxjs/operators/share';
import { HttpClient } from '@angular/common/http';

/** Core Configuration */
import { CoreConfig } from '../core.config';
import {
  isNullOrEmpty,
  createSvgElement
} from '../../utilities';

@Injectable()
export class McsAssetsProvider {
  private _images: Map<string, string>;
  private _fontIcons: Map<string, string>;
  private _svgIcons: Map<string, string>;
  private _svgElements: Map<string, SVGElement>;
  private _svgActiveRequest: Map<string, Observable<SVGElement>>;
  private _gifIcons: Map<string, string>;
  private _config: any;

  constructor(
    private _coreConfig: CoreConfig,
    private _httpClient: HttpClient
  ) {
    this._fontIcons = new Map<string, string>();
    this._svgIcons = new Map<string, string>();
    this._svgElements = new Map<string, SVGElement>();
    this._svgActiveRequest = new Map<string, Observable<SVGElement>>();
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
   * Returns the svg element based on the given URL
   */
  public getSvgElement(url: string): Observable<SVGElement> {
    if (isNullOrEmpty(url)) { return Observable.of(undefined); }

    // Check the svg in the cache and return it immediately.
    let svgExist = this._svgElements.has(url);
    if (svgExist) {
      return Observable.of(this._cloneSvg(this._svgElements.get(url)));
    }

    // Check the url if it is in progress and return it immediately.
    // We use share in order for the call to be executed only once
    // when the same url has been requested.
    let activeRequest = this._svgActiveRequest.get(url);
    if (!isNullOrEmpty(activeRequest)) {
      return activeRequest;
    }

    // Get the svg from http request
    let svgRequest = this._httpClient.get(url, { responseType: 'text' }).pipe(
      finalize(() => this._svgActiveRequest.delete(url)),
      share(),
      map((response) => {
        let svgElement = this._cloneSvg(createSvgElement(response));
        this._svgElements.set(url, svgElement);
        return svgElement;
      })
    );
    this._svgActiveRequest.set(url, svgRequest);
    return svgRequest;
  }

  /**
   * Clone the svg element provided in order for the instance of
   * the svg not to mimic its coordinate
   * @param svg SVG element to clone
   */
  private _cloneSvg(svg: SVGElement): SVGElement {
    return svg.cloneNode(true) as SVGElement;
  }

  /**
   * Load assets configuration
   */
  private load(): void {
    this._config = require('../../config/assets.config.json');
  }
}
