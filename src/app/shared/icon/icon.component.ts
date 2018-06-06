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
  CoreDefinition,
  McsSizeType,
  McsColorType,
  McsAssetsProvider
} from '../../core';
import { isNullOrEmpty } from '../../utilities';
import {
  IconType,
  Icon,
  IconService
} from './icon.service';
import { Observable } from 'rxjs';

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

  @Input()
  public set size(value: McsSizeType) {
    let sizeIsDifferent = !isNullOrEmpty(value) && value !== this._size;
    if (sizeIsDifferent) {
      this._size = value;
      this._iconActualSize = this._iconSizeTable.get(value);
    }
  }
  private _size: McsSizeType;

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
      this._icon = this._iconService.getIconDetails(CoreDefinition.ASSETS_SVG_NO_ICON_AVAILABLE);
    }
  }

  /**
   * Creates the size table for mapping
   */
  private _createSizeTable(): void {
    this._iconSizeTable = new Map<McsSizeType, string>();
    this._iconSizeTable.set('xxsmall', `${CoreDefinition.ICON_SIZE_XXSMALL}px`);
    this._iconSizeTable.set('xsmall', `${CoreDefinition.ICON_SIZE_XSMALL}px`);
    this._iconSizeTable.set('small', `${CoreDefinition.ICON_SIZE_SMALL}px`);
    this._iconSizeTable.set('medium', `${CoreDefinition.ICON_SIZE_MEDIUM}px`);
    this._iconSizeTable.set('large', `${CoreDefinition.ICON_SIZE_LARGE}px`);
    this._iconSizeTable.set('xlarge', `${CoreDefinition.ICON_SIZE_XLARGE}px`);
    this._iconSizeTable.set('xxlarge', `${CoreDefinition.ICON_SIZE_XXLARGE}px`);
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
      .map((svgElement) => {

        // We need to set the 100% when the size is auto since SVG uses 100% only
        let svgActualSize = this._iconActualSize === 'auto' ? '100%' : this._iconActualSize;
        svgElement.setAttribute('width', svgActualSize);
        svgElement.setAttribute('height', svgActualSize);
        this._renderer.appendChild(parentContainer, svgElement);
        return parentContainer;
      });
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
    return Observable.of(parentContainer);
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
    this._renderer.addClass(parentContainer, `color-${this.color}`);
    this._renderer.appendChild(parentContainer, imageElement);
    return Observable.of(parentContainer);
  }

  /**
   * Clear the corresponding icon by deleting its container
   */
  private _clearIconContainer(): void {
    if (this._iconContainer) {
      this._renderer.removeChild(this._elementRef.nativeElement, this._iconContainer);
    }
  }
}
