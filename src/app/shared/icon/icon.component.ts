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
  McsColorType
} from '../../core';
import { isNullOrEmpty } from '../../utilities';
import {
  IconType,
  Icon,
  IconService
} from './icon.service';

@Component({
  selector: 'mcs-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'icon-wrapper'
  }
})

export class IconComponent implements OnChanges {
  public icon: Icon;
  public iconElement: any;

  @Input()
  public key: string;

  @Input()
  public size: McsSizeType;

  @Input()
  public color: McsColorType;

  private _iconActualSize: number;

  public constructor(
    private _iconService: IconService,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    // Size of icons by default is medium and the type is SVG
    this.size = 'medium';
    this.color = 'black';
  }

  public ngOnChanges() {
    // Set Icon content and actual size
    this._setIconContent();
    this._setActualSize();

    // Recreate Icon if it is already exist
    this._recreateIcon();

    // Add Icon Styling
    this._setIconStyles();
  }

  private _setIconContent(): void {
    this.icon = {} as any;
    this.icon = this._iconService.getIcon(this.key);

    // In case of no icon found.::.
    // Display the no-image availabe icon
    if (isNullOrEmpty(this.icon)) {
      this.icon = this._iconService.getIcon(CoreDefinition.ASSETS_SVG_NO_ICON_AVAILABLE);
    }
  }

  private _setActualSize() {
    if (!this.icon) { return; }

    // Set size for the icon variables
    switch (this.size) {
      case 'xlarge':
        this._iconActualSize = CoreDefinition.ICON_SIZE_XLARGE;
        break;

      case 'large':
        this._iconActualSize = CoreDefinition.ICON_SIZE_LARGE;
        break;

      case 'small':
        this._iconActualSize = CoreDefinition.ICON_SIZE_SMALL;
        break;

      case 'xsmall':
        this._iconActualSize = CoreDefinition.ICON_SIZE_XSMALL;
        break;

      case 'medium':
      default:
        this._iconActualSize = CoreDefinition.ICON_SIZE_MEDIUM;
        break;
    }

    // Set size for the icon wrapper
    this._renderer.setStyle(this._elementRef.nativeElement, 'min-width',
      `${this._iconActualSize}px`);
    this._renderer.setStyle(this._elementRef.nativeElement, 'min-height',
      `${this._iconActualSize}px`);
  }

  private _setIconStyles() {
    if (!this.iconElement || !this.icon) { return; }

    switch (this.icon.type) {
      case IconType.FontAwesome:
        // Add class for the font awesome icons
        let fontClasses: string[] = this.icon.value.split(' ');
        fontClasses.forEach((fontClass) => {
          this._renderer.addClass(this.iconElement, fontClass);
        });

        // Set the sie of the Font Awesome icon based on the font-size
        this._renderer.setStyle(this.iconElement, 'font-size',
          `${this._iconActualSize}px`);
        break;

      case IconType.Gif:
        this._renderer.setAttribute(this.iconElement, 'src', this.icon.value);

        // Set the size of the SVG element based on the height and width
        this._renderer.setStyle(this.iconElement, 'width',
          `${this._iconActualSize}px`);
        this._renderer.setStyle(this.iconElement, 'height',
          `${this._iconActualSize}px`);
        break;

      case IconType.Svg:
      default:
        // Set the style to populate the background image of the SVG
        this._renderer.setStyle(
          this.iconElement,
          'background-image',
          `url(${this.icon.value})`
        );

        // Set the size of the SVG element based on the height and width
        this._renderer.setStyle(this.iconElement, 'width',
          `${this._iconActualSize}px`);
        this._renderer.setStyle(this.iconElement, 'height',
          `${this._iconActualSize}px`);
        break;
    }

    this._renderer.addClass(this.iconElement, this.color);
    this._renderer.addClass(this.iconElement, 'icon-container');
  }

  private _recreateIcon(): void {
    // Remove icon if it is already exist
    if (this.iconElement) {
      this._renderer.removeChild(this._elementRef.nativeElement, this.iconElement);
    }

    // Create icon
    this.iconElement = this.icon.type === IconType.Gif ?
      this._renderer.createElement('img') :
      this._renderer.createElement('i');
    this._renderer.appendChild(this._elementRef.nativeElement,
      this.iconElement);

    // Refresh view manually
    this._changeDetectorRef.markForCheck();
  }
}
