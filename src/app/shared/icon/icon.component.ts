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
import { McsAssetsProvider } from '@app/core';
import {
  isNullOrEmpty,
  McsSizeType,
  McsColorType,
  CommonDefinition
} from '@app/utilities';
import {
  IconType,
  Icon,
  IconService
} from './icon.service';

@Component({
  selector: 'mcs-icon',
  template: '',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'icon-wrapper'
  }
})

export class IconComponent implements OnChanges {
  @Input()
  public key: string;

  @Input()
  public color: McsColorType;

  /**
   * Size of all the icons
   * `@Note` If the type of icon that you need to render is SVG and the size of it is 'auto',
   * you need to provide the actual size of the icon instead.
   * Because 100% width and height of SVG element doesn't work on IE.
   */
  @Input()
  public set size(value: McsSizeType | string) {
    let sizeIsDifferent = !isNullOrEmpty(value) && value !== this._size;
    if (sizeIsDifferent) {
      this._size = value;
      let mapSize = this._iconSizeTable.get(value as McsSizeType);
      this._iconActualSize = isNullOrEmpty(mapSize) ? this._size : mapSize;
    }
  }
  private _size: McsSizeType | string;

  // Icon variables
  private _icon: Icon;
  private _iconContainer: HTMLElement;
  private _iconSizeTable: Map<McsSizeType, string>;
  private _iconActualSize: string;

  public constructor(
    private _iconService: IconService,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _assetsProvider: McsAssetsProvider
  ) {
    // Size of icons by default is medium and the type is SVG
    this._createSizeTable();
    this.size = 'medium';
    this.color = 'black';
  }

  public async ngOnChanges() {
    this._setIconContent();

    // Recreate Icon if it is already exist
    this._clearIconContainer();
    await this._createIconAsync();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Set the representation icon content to variable
   */
  private _setIconContent(): void {
    this._icon = {} as any;
    this._icon = this._iconService.getIconDetails(this.key);

    // In case of no icon found.::.
    // Display the no-image availabe icon
    if (isNullOrEmpty(this._icon)) {
      this._icon = this._iconService.getIconDetails(CommonDefinition.ASSETS_SVG_NO_ICON_AVAILABLE);
    }
  }

  /**
   * Creates the size table for mapping
   */
  private _createSizeTable(): void {
    this._iconSizeTable = new Map<McsSizeType, string>();
    this._iconSizeTable.set('xxsmall', `${CommonDefinition.ICON_SIZE_XXSMALL}px`);
    this._iconSizeTable.set('xsmall', `${CommonDefinition.ICON_SIZE_XSMALL}px`);
    this._iconSizeTable.set('small', `${CommonDefinition.ICON_SIZE_SMALL}px`);
    this._iconSizeTable.set('medium', `${CommonDefinition.ICON_SIZE_MEDIUM}px`);
    this._iconSizeTable.set('large', `${CommonDefinition.ICON_SIZE_LARGE}px`);
    this._iconSizeTable.set('xlarge', `${CommonDefinition.ICON_SIZE_XLARGE}px`);
    this._iconSizeTable.set('xxlarge', `${CommonDefinition.ICON_SIZE_XXLARGE}px`);
    this._iconSizeTable.set('auto', `auto`);
  }

  /**
   * Create the icon in an asynchronous
   */
  private _createIconAsync(): Promise<void> {
    return new Promise<void>((resolve) => {
      this._createIconContainer();

      switch (this._icon.type) {
        case IconType.Svg:
          this._renderSvgElement(this._iconContainer)
            .subscribe(() => resolve());
          break;

        case IconType.Gif:
          this._renderImageElement(this._iconContainer)
            .subscribe(() => resolve());
          break;

        case IconType.FontAwesome:
        default:
          this._renderFontElement(this._iconContainer)
            .subscribe(() => resolve());
          break;
      }
    });
  }

  /**
   * Creates the icon container which serves as a div element
   */
  private _createIconContainer(): void {
    this._iconContainer = this._renderer.createElement('div');
    this._renderer.appendChild(
      this._elementRef.nativeElement,
      this._iconContainer);
    this._renderer.addClass(this._iconContainer, 'icon-container');
  }

  /**
   * Render the svg element to the container provided
   * @param parentContainer Parent container were the icon element will be attached
   */
  private _renderSvgElement(parentContainer: HTMLElement): Observable<HTMLElement> {
    return this._assetsProvider
      .getSvgElement(this._icon.value)
      .pipe(
        map((svgElement) => {
          if (this._iconActualSize === 'auto') {
            throw new Error(`auto width is not working on IE for SVG Elements,
            set the actual size for icon instead`);
          }
          // Get the actual ratio of the svg to calculate manually the height of
          // since auto height is not working properly on IE
          let svgViewBox = (svgElement as SVGSVGElement).viewBox;
          let svgRatio = svgViewBox.baseVal.height / svgViewBox.baseVal.width;
          let actualHeight = +(this._iconActualSize.replace('px', '')) * svgRatio;
          svgElement.setAttribute('width', this._iconActualSize);
          svgElement.setAttribute('height', `${actualHeight}px`);
          this._clearSvgFillColor(svgElement);
          svgElement.setAttribute(`fill-svg-${this.color}`, '');
          this._renderer.appendChild(parentContainer, svgElement);
          return parentContainer;
        })
      );
  }

  /**
   * Render the image element to the container provided
   * @param parentContainer Parent container were the icon element will be attached
   */
  private _renderImageElement(parentContainer: HTMLElement): Observable<HTMLElement> {
    let imageElement = this._renderer.createElement('img');
    this._renderer.setAttribute(imageElement, 'src', this._icon.value);
    this._renderer.setStyle(imageElement, 'display', 'block');
    this._renderer.setStyle(imageElement, 'height', 'auto');
    this._renderer.setStyle(imageElement, 'width', this._iconActualSize);

    this._renderer.appendChild(parentContainer, imageElement);
    return of(parentContainer);
  }

  /**
   * Render the Font element to the container provided
   * @param parentContainer Parent container were the icon element will be attached
   */
  private _renderFontElement(parentContainer: HTMLElement): Observable<HTMLElement> {
    let imageElement = this._renderer.createElement('i');

    // Add class for the font awesome icons
    let fontClasses: string[] = this._icon.value.split(' ');
    fontClasses.forEach((fontClass) => {
      this._renderer.addClass(imageElement, fontClass);
    });

    // Set the size of the Font Awesome icon based on the font-size
    this._renderer.setStyle(imageElement, 'font-size', this._iconActualSize);
    this._renderer.setAttribute(parentContainer, `text-color`, this.color);
    this._renderer.appendChild(parentContainer, imageElement);
    return of(parentContainer);
  }

  /**
   * Clear the corresponding icon by deleting its container
   */
  private _clearIconContainer(): void {
    if (this._iconContainer) {
      this._renderer.removeChild(this._elementRef.nativeElement, this._iconContainer);
    }
  }

  private _clearSvgFillColor(element: SVGElement): void {
    let colors: string[] = [
      'primary' , 'secondary' , 'tertiary',
      'success' , 'warning' , 'danger',
      'light' , 'medium' , 'dark' , 'black'];

    colors.forEach(color => {
      element.removeAttribute(`fill-svg-${color}`);
    });
  }
}
