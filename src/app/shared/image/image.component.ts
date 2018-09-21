import {
  Component,
  OnChanges,
  Input,
  ElementRef,
  Renderer2,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CoreDefinition,
  McsAssetsProvider
} from '@app/core';
import {
  isNullOrEmpty,
  McsSizeType
} from '@app/utilities';
import {
  Image,
  ImageType,
  ImageService
} from './image.service';

@Component({
  selector: 'mcs-image',
  template: '',
  styleUrls: ['./image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'image-wrapper'
  }
})

export class ImageComponent implements OnChanges {
  @Input()
  public key: string;

  /**
   * Size of all the images
   * `@Note` If the type of image that you need to render is SVG and the size of it is 'auto',
   * you need to provide the actual size of the image instead.
   * Because 100% width and height of SVG element doesn't work on IE.
   */
  @Input()
  public set size(value: McsSizeType | string) {
    let sizeIsDifferent = !isNullOrEmpty(value) && value !== this._size;
    if (sizeIsDifferent) {
      this._size = value;
      let mapSize = this._imageSizeTable.get(value as McsSizeType);
      this._imageActualSize = isNullOrEmpty(mapSize) ? this._size : mapSize;
    }
  }
  private _size: McsSizeType | string;

  // Image variables
  private _image: Image;
  private _imageContainer: HTMLElement;
  private _imageSizeTable: Map<McsSizeType, string>;
  private _imageActualSize: string;

  public constructor(
    private _imageService: ImageService,
    private _assetsProvider: McsAssetsProvider,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this._createSizeTable();
    this.size = 'auto';
  }

  public async ngOnChanges() {
    this._setImageContent();

    // Recreate image element if it is already exist
    this._clearImageContainer();
    await this._createImageAsync();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Set the representation image content to variable
   */
  private _setImageContent(): void {
    this._image = {} as any;
    this._image = this._imageService.getImageDetails(this.key);

    // In case of no image found.::.
    // Display the no-image availabe image
    if (isNullOrEmpty(this._image)) {
      this._image = this._imageService
        .getImageDetails(CoreDefinition.ASSETS_SVG_NO_ICON_AVAILABLE);
    }
  }

  /**
   * Creates the size table for mapping
   */
  private _createSizeTable(): void {
    this._imageSizeTable = new Map<McsSizeType, string>();
    this._imageSizeTable.set('xsmall', `${CoreDefinition.IMAGE_SIZE_XSMALL}px`);
    this._imageSizeTable.set('small', `${CoreDefinition.IMAGE_SIZE_SMALL}px`);
    this._imageSizeTable.set('medium', `${CoreDefinition.IMAGE_SIZE_MEDIUM}px`);
    this._imageSizeTable.set('large', `${CoreDefinition.IMAGE_SIZE_LARGE}px`);
    this._imageSizeTable.set('xlarge', `${CoreDefinition.IMAGE_SIZE_XLARGE}px`);
    this._imageSizeTable.set('xxlarge', `${CoreDefinition.IMAGE_SIZE_XXLARGE}px`);
    this._imageSizeTable.set('auto', `auto`);
  }

  /**
   * Create the image in an asynchronous
   */
  private _createImageAsync(): Promise<void> {
    return new Promise<void>((resolve) => {
      this._createImageContainer();

      switch (this._image.type) {
        case ImageType.Svg:
          this._renderSvgElement(this._imageContainer)
            .subscribe(() => resolve());
          break;

        case ImageType.Png:
        default:
          this._renderImageElement(this._imageContainer)
            .subscribe(() => resolve());
          break;
      }
    });
  }

  /**
   * Creates the image container which serves as a div element
   */
  private _createImageContainer(): void {
    this._imageContainer = this._renderer.createElement('div');
    this._renderer.appendChild(
      this._elementRef.nativeElement,
      this._imageContainer);
    this._renderer.addClass(this._imageContainer, 'image-container');
  }

  /**
   * Render the svg element to the container provided
   * @param parentContainer Parent container were the svg element will be attached
   */
  private _renderSvgElement(parentContainer: HTMLElement): Observable<HTMLElement> {
    return this._assetsProvider
      .getSvgElement(this._image.value)
      .pipe(
        map((svgElement) => {
          if (this._imageActualSize === 'auto') {
            throw new Error(`auto width is not working on IE for SVG Elements,
            set the actual size for image instead`);
          }
          // Get the actual ratio of the svg to calculate manually the height of
          // since auto height is not working properly on IE
          let svgViewBox = (svgElement as SVGSVGElement).viewBox;
          let svgRatio = svgViewBox.baseVal.height / svgViewBox.baseVal.width;
          let actualHeight = +(this._imageActualSize.replace('px', '')) * svgRatio;

          svgElement.setAttribute('width', this._imageActualSize);
          svgElement.setAttribute('height', `${actualHeight}px`);
          this._renderer.appendChild(parentContainer, svgElement);
          return parentContainer;
        })
      );
  }

  /**
   * Render the image element to the container provided
   * @param parentContainer Parent container were the image element will be attached
   */
  private _renderImageElement(parentContainer: HTMLElement): Observable<HTMLElement> {
    let imageElement = this._renderer.createElement('img');
    let imageSize = this._imageActualSize === 'auto' ? '100%' : this._imageActualSize;
    this._renderer.setAttribute(imageElement, 'src', this._image.value);
    this._renderer.setStyle(imageElement, 'display', 'block');
    this._renderer.setStyle(imageElement, 'height', 'auto');
    this._renderer.setStyle(imageElement, 'width', imageSize);
    this._renderer.setStyle(imageElement, 'max-width', '100%');

    this._renderer.appendChild(parentContainer, imageElement);
    return of(parentContainer);
  }

  /**
   * Clear the corresponding image by deleting its container
   */
  private _clearImageContainer(): void {
    if (this._imageContainer) {
      this._renderer.removeChild(this._elementRef.nativeElement, this._imageContainer);
    }
  }
}
