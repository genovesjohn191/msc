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

let UNIQUE_ID: number = 0;

@Component({
  selector: 'mcs-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
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
  @Output()
  public onClick: EventEmitter<any> = new EventEmitter();

  @Input()
  public id: string;

  @Input()
  public label: string;

  @Input()
  public indeterminate: boolean;

  @Input()
  public get checked(): boolean {
    return this._checked;
  }
  public set checked(value: boolean) {
    if (this._checked !== value) {
      this._checked = value;
      this.isChecked = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _checked: boolean;

  /**
   * This will generate a new unique id if the id is not given
   */
  private _nextUniqueId: number = ++UNIQUE_ID;

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
      if (this._onChanged) {
        this._onChanged(value);
      }
      this._changeDetectorRef.markForCheck();
    }
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.label = '';
    this.id = `mcs-checkbox-${this._nextUniqueId}`;
  }

  public onClickEvent($event) {
    this.onClick.emit($event);
  }

  public onBlur(): void {
    this._onTouched();
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    if (value !== this.isChecked) {
      this.isChecked = value;
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
