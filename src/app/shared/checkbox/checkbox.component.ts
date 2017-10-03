import {
  Component,
  forwardRef,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'mcs-checkbox',
  templateUrl: './checkbox.component.html',
  styles: [require('./checkbox.component.scss')],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'checkbox-wrapper'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})

export class CheckboxComponent implements ControlValueAccessor {
  @Input()
  public label: string;

  @Output()
  public onClick: EventEmitter<any> = new EventEmitter();

  /**
   * On Touched Event Callback
   */
  private _onTouched: () => {};

  /**
   * On Changed Event Callback
   */
  private _onChanged: (_: any) => {};

  /**
   * IsChecked Flag
   */
  private _isChecked: boolean;
  public get isChecked(): boolean {
    return this._isChecked;
  }
  public set isChecked(value: boolean) {
    if (value !== this._isChecked) {
      this._isChecked = value;
      this._onChanged(value);
    }
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.label = '';
  }

  public onClickEvent($event) {
    this.onClick.emit($event);
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    if (value !== this._isChecked) {
      this._isChecked = value;
      this._changeDetectorRef.markForCheck();
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
}
