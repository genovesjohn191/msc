import {
  Component,
  OnChanges,
  Input,
  ElementRef,
  Renderer2,
  ViewChild
} from '@angular/core';
import {
  CoreConfig,
  CoreDefinition,
  McsAssetsProvider
} from '../../core';

@Component({
  selector: 'mcs-svg-icon',
  templateUrl: './svg-icon.component.html',
  styles: [require('./svg-icon.component.scss')]
})

export class SvgIconComponent implements OnChanges {
  @Input()
  public key: string;

  @Input()
  public size: 'xsmall' | 'small' | 'medium' | 'large';

  @ViewChild('svgIconElement')
  public svgIconElement: ElementRef;

  public constructor(
    private _coreConfig: CoreConfig,
    private _assetsProvider: McsAssetsProvider,
    private _renderer: Renderer2
  ) {
    this.size = 'medium';
  }

  public ngOnChanges() {
    this._setIconSize();
    this._setSvgIcon();
  }

  public getSvgIconPath() {
    if (!this.key) { return undefined; }

    // Get svg icon path based on the key, if the svg icon path
    // is not exist, the no image availabe SVG Icon will be display
    return this._assetsProvider.getSvgIconPath(this.key);
  }

  private _setSvgIcon() {
    if (this.svgIconElement) {
      this._renderer.setStyle(
        this.svgIconElement.nativeElement,
        'background-image',
        `url(${this.getSvgIconPath()})`
      );
    }
  }

  private _setIconSize() {
    let width: string;
    let height: string;

    switch (this.size) {
      case 'large':
        width = CoreDefinition.ICON_SIZE_LARGE;
        height = CoreDefinition.ICON_SIZE_LARGE;
        break;

      case 'medium':
        width = CoreDefinition.ICON_SIZE_MEDIUM;
        height = CoreDefinition.ICON_SIZE_MEDIUM;
        break;

      case 'xsmall':
        width = CoreDefinition.ICON_SIZE_XSMALL;
        height = CoreDefinition.ICON_SIZE_XSMALL;
        break;

      case 'small':
      default:
        width = CoreDefinition.ICON_SIZE_SMALL;
        height = CoreDefinition.ICON_SIZE_SMALL;
        break;
    }
    this._renderer.setStyle(this.svgIconElement.nativeElement, 'width', width);
    this._renderer.setStyle(this.svgIconElement.nativeElement, 'height', height);
  }
}
