import {
  Component,
  forwardRef,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnChanges,
  Renderer2
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
  McsAssetsProvider,
  McsListItem,
  CoreDefinition
} from '../../core';

@Component({
  selector: 'mcs-radio-button-group',
  templateUrl: './radio-button-group.component.html',
  styles: [require('./radio-button-group.component.scss')],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioButtonGroupComponent),
      multi: true
    }
  ]
})

export class RadioButtonGroupComponent implements OnChanges, ControlValueAccessor {
  @Input()
  public items: McsListItem[];

  @Input()
  public orientation: 'horizontal' | 'vertical';

  @Output()
  public onClick: EventEmitter<any> = new EventEmitter();

  @ViewChild('radioButtonGroupElement')
  public radioButtonGroupElement: ElementRef;

  /**
   * On Touched Event Callback
   */
  private _onTouched: () => {};

  /**
   * On Changed Event Callback
   */
  private _onChanged: (_: any) => {};

  /**
   * Active Item (model binding)
   */
  private _activeKeyItem: any;
  public get activeKeyItem(): any {
    return this._activeKeyItem;
  }
  public set activeKeyItem(value: any) {
    if (value !== this._activeKeyItem) {
      this._activeKeyItem = value;
      this._onChanged(value);
    }
  }

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _renderer: Renderer2
  ) {
    this.items = new Array();
    this.orientation = 'vertical';
  }

  public ngOnChanges() {
    if (this.orientation) {
      this._renderer.addClass(this.radioButtonGroupElement.nativeElement,
        this.orientation);
    }
  }

  public onClickEvent($event: Event, item: McsListItem) {
    if (item) { this.activeKeyItem = item.key; }
    this.onClick.emit($event);
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    if (value !== this._activeKeyItem) {
      this._activeKeyItem = value;
    }
  }

  /**
   * On Change Event implementation of ControlValueAccessor
   * @param fn Function Invoker
   */
  public registerOnChange(fn: any) {
    this._onChanged = fn;
  }

  /**
   * On Touched Event implementation of ControlValueAccessor
   * @param fn Function Invoker
   */
  public registerOnTouched(fn: any) {
    this._onTouched = fn;
  }

  /**
   * Get radio button svg icons key based on the checked flag,
   * if it is checked the obtain svg icon is the checked
   * else it is unchecked
   */
  public getRadioButtonIconKey(item: McsListItem): string {
    return this._activeKeyItem === item.key ?
      CoreDefinition.ASSETS_SVG_RADIO_CHECKED :
      CoreDefinition.ASSETS_SVG_RADIO_UNCHECKED;
  }
}
