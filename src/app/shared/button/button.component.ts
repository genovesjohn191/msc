import {
  Component,
  OnInit,
  OnChanges,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  Renderer2,
  ElementRef,
  ViewChild
} from '@angular/core';

/** Interface */
import { Loading } from '../loading.interface';

/** Providers */
import { CoreDefinition } from '../../core';

enum IconType {
  Svg = 0,
  FontAwesome = 1
}

@Component({
  selector: 'mcs-button',
  templateUrl: './button.component.html',
  styles: [require('./button.component.scss')]
})

export class ButtonComponent implements OnInit, OnChanges, AfterViewInit, Loading {
  public iconType: IconType;
  public iconTypeEnum = IconType;
  public showSpinner: boolean;
  public iconKey: string;

  @Input()
  public type: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

  @Input()
  public icon: 'normal' | 'arrow' | 'calendar';

  @Input()
  public size: 'default' | 'small';

  @Input()
  public width: string;

  @Input()
  public disabled: boolean;

  @Output()
  public onClick: EventEmitter<any> = new EventEmitter();

  @ViewChild('mcsButton')
  public mcsButton: ElementRef;

  @ViewChild('mcsButtonIcon')
  public mcsButtonIcon: ElementRef;

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_FONT_SPINNER;
  }

  public constructor(private _renderer: Renderer2) {
    this.type = 'primary';
    this.icon = 'normal';
    this.size = 'default';
    this.iconType = IconType.Svg;
  }

  public ngOnInit() {
    this._setIconKeyAndType(this.icon);
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
  }

  public ngOnChanges() {
    if (this.disabled) {
      this._renderer.setProperty(this.mcsButton.nativeElement, 'disabled', this.disabled);
    } else {
      this._renderer.removeAttribute(this.mcsButton.nativeElement, 'disabled');
    }
  }

  public emitEvent($event) {
    this.onClick.emit($event);
  }

  public showLoader(): void {
    this.showSpinner = true;
  }

  public hideLoader(): void {
    this.showSpinner = false;
  }

  private _setIconKeyAndType(icon: string): void {
    // Set icon type if it is SVG or font-awesome
    switch (icon) {
      case 'arrow':
        this.iconType = IconType.Svg;
        this.iconKey = CoreDefinition.ASSETS_SVG_ARROW_RIGHT_WHITE;
        break;
      case 'calendar':
        this.iconType = IconType.FontAwesome;
        this.iconKey = CoreDefinition.ASSETS_FONT_CALENDAR;
        break;
      case 'normal':
      default:
        this.iconType = undefined;
        this.iconKey = undefined;
        break;
    }
  }
}
