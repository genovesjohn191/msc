import {
  Component,
  OnChanges,
  Input,
  ElementRef,
  Renderer2,
  ViewChild
} from '@angular/core';
import {
  CoreDefinition,
  McsAssetsProvider
} from '../../core';
import {
  IconType,
  Icon,
  IconService
} from './icon.service';

@Component({
  selector: 'mcs-icon',
  templateUrl: './icon.component.html',
  styles: [require('./icon.component.scss')]
})

export class IconComponent implements OnChanges {
  public icon: Icon;

  @Input()
  public key: string;

  @Input()
  public size: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

  @Input()
  public color: 'white' | 'black' | 'green' | 'red';

  @ViewChild('iconElement')
  public iconElement: ElementRef;

  private _iconActualSize: number;

  public constructor(
    private _iconService: IconService,
    private _renderer: Renderer2
  ) {
    // Size of icons by default is medium and the type is SVG
    this.size = 'medium';
    this.color = 'black';
  }

  public ngOnChanges() {
    this._setIconContent();
    this._setActualSize();
    this._setIconStyles();
  }

  private _setIconContent(): void {
    this.icon = {} as any;
    this.icon = this._iconService.getIcon(this.key);
  }

  private _setActualSize() {
    if (!this.icon) { return; }

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
  }

  private _setIconStyles() {
    if (!this.iconElement || !this.icon) { return; }

    switch (this.icon.type) {
      case IconType.FontAwesome:
        // Add class for the font awesome icons
        let fontClasses: string[] = this.icon.value.split(' ');
        fontClasses.forEach((fontClass) => {
          this._renderer.addClass(this.iconElement.nativeElement, fontClass);
        });

        // Set the sie of the Font Awesome icon based on the font-size
        this._renderer.setStyle(this.iconElement.nativeElement, 'font-size',
          `${this._iconActualSize}px`);
        this._renderer.setStyle(this.iconElement.nativeElement, 'line-height',
          `${this._iconActualSize * 1.5}px`);

        // Set the color of the Font Awesome icon based on the color inputted
        this._renderer.addClass(this.iconElement.nativeElement, this.color);
        break;

      case IconType.Svg:
      default:
        // Set the style to populate the background image of the SVG
        this._renderer.setStyle(
          this.iconElement.nativeElement,
          'background-image',
          `url(${this.icon.value})`
        );

        // Set the size of the SVG element based on the height and width
        this._renderer.setStyle(this.iconElement.nativeElement, 'width',
          `${this._iconActualSize}px`);
        this._renderer.setStyle(this.iconElement.nativeElement, 'height',
          `${this._iconActualSize}px`);

        // Set the color of the Font Awesome icon based on the color inputted
        this._renderer.addClass(this.iconElement.nativeElement, this.color);
        break;
    }
  }
}
