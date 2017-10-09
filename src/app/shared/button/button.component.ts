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
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';

/** Providers */
import {
  CoreDefinition,
  McsLoader
} from '../../core';

enum IconType {
  Svg = 0,
  FontAwesome = 1
}

@Component({
  selector: 'mcs-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ButtonComponent implements OnInit, OnChanges, AfterViewInit, McsLoader {
  public iconTypeEnum = IconType;

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
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  private _iconType: IconType;
  public get iconType(): IconType {
    return this._iconType;
  }
  public set iconType(value: IconType) {
    if (this._iconType !== value) {
      this._iconType = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _showSpinner: boolean;
  public get showSpinner(): boolean {
    return this._showSpinner;
  }
  public set showSpinner(value: boolean) {
    if (this._showSpinner !== value) {
      this._showSpinner = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _iconKey: string;
  public get iconKey(): string {
    return this._iconKey;
  }
  public set iconKey(value: string) {
    if (this._iconKey !== value) {
      this._iconKey = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public constructor(
    private _renderer: Renderer2,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
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

    this._changeDetectorRef.markForCheck();
  }

  public ngOnChanges() {
    if (this.disabled) {
      this._renderer.setProperty(this.mcsButton.nativeElement, 'disabled', this.disabled);
    } else {
      this._renderer.removeAttribute(this.mcsButton.nativeElement, 'disabled');
    }

    this._changeDetectorRef.markForCheck();
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
