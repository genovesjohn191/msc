import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer2,
  ViewChild
} from '@angular/core';
import {
  CoreConfig,
  CoreDefinition
} from '../../core';

@Component({
  selector: 'mcs-svg-icon',
  templateUrl: './svg-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SvgIconComponent implements OnInit {
  @Input()
  public name: string;

  @Input()
  public color: 'black' | 'blue' | 'white';

  @Input()
  public size: 'small' | 'medium' | 'large';

  @ViewChild('svgIconElement')
  public svgIconElement: ElementRef;

  public constructor(
    private _renderer: Renderer2,
    private _coreConfig: CoreConfig
  ) {
    this.color = 'black';
    this.size = 'medium';
  }

  public ngOnInit() {
    this._setIconSize();
  }

  public getSvgIconPath() {
    if (!this.name) { return undefined; }
    return `${this._coreConfig.iconRoot}/${this.color}/svg/${this.name}.svg`;
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
