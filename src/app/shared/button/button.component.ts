import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  Renderer2,
  ElementRef,
  ViewChild,
  HostBinding
} from '@angular/core';

/** Interface */
import { Loading } from '../loading.interface';

/** Providers */
import {
  McsAssetsProvider,
  CoreDefinition
} from '../../core';

enum IconType {
  Svg = 0,
  FontAwesome = 1
}

@Component({
  selector: 'mcs-button',
  templateUrl: './button.component.html',
  styles: [require('./button.component.scss')]
})

export class ButtonComponent implements OnInit, AfterViewInit, Loading {
  public iconType: IconType;
  public iconTypeEnum = IconType;
  public svgIcon: string;
  public fontAwesomeIcon: string;
  public spinnerIcon: string;

  @Input()
  public type: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

  @Input()
  public icon: 'normal' | 'arrow' | 'calendar';

  @Input()
  public size: 'default' | 'small';

  @Input()
  public width: string;

  @Input()
  public lightboxId: string;

  @Input()
  public lightboxDismiss: string;

  @Input()
  public disabled: boolean;

  @Output()
  public onClick: EventEmitter<any> = new EventEmitter();

  @ViewChild('mcsButton')
  public mcsButton: ElementRef;

  @ViewChild('mcsButtonIcon')
  public mcsButtonIcon: ElementRef;

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _renderer: Renderer2
  ) {
    this.type = 'primary';
    this.icon = 'normal';
    this.size = 'default';
    this.iconType = IconType.Svg;
  }

  public ngOnInit() {
    this._setIconType(this.icon);
    this.svgIcon = CoreDefinition.ASSETS_SVG_ARROW_RIGHT_WHITE;
    this.fontAwesomeIcon = this._assetsProvider.getIcon('calendar');
  }

  public ngAfterViewInit() {
    if (this.type) {
      this._renderer.addClass(this.mcsButton.nativeElement, this.type);
    }

    if (this.icon === 'normal') {
      this._renderer.addClass(this.mcsButton.nativeElement, 'normal');
    } else {
      this._renderer.addClass(this.mcsButton.nativeElement, 'has-icon');
    }

    if (this.size) {
      this._renderer.addClass(this.mcsButton.nativeElement, this.size);
    }

    if (this.width) {
      this._renderer.setStyle(this.mcsButton.nativeElement, 'width', '100%');
      this._renderer.setStyle(this.mcsButton.nativeElement, 'max-width', this.width);
    }

    if (this.lightboxId) {
      this._renderer.setAttribute(this.mcsButton.nativeElement, 'data-toggle', 'modal');
      this._renderer.setAttribute(
        this.mcsButton.nativeElement, 'data-target', '#' + this.lightboxId);
    }

    if (this.lightboxDismiss === 'true') {
      this._renderer.setAttribute(this.mcsButton.nativeElement, 'data-dismiss', 'modal');
    }

    if (this.disabled) {
      this._renderer.setProperty(this.mcsButton.nativeElement, 'disabled', this.disabled);
    }
  }

  public emitEvent($event) {
    this.onClick.emit($event);
  }

  public showLoader(): void {
    this.spinnerIcon = this._assetsProvider.getIcon('spinner');
  }

  public hideLoader(): void {
    this.spinnerIcon = undefined;
  }

  private _setIconType(icon: string): void {
    switch (icon) {
      case 'arrow':
        this.iconType = IconType.Svg;
        break;
      case 'calendar':
        this.iconType = IconType.FontAwesome;
        break;
      case 'normal':
      default:
        this.iconType = undefined;
        break;
    }
  }

}
