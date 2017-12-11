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
import { coerceBoolean } from '../../utilities';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ],
  host: {
    'class': 'checkbox-wrapper'
  }
})

export class CheckboxComponent implements ControlValueAccessor {
  @Output()
  public onClick: EventEmitter<any> = new EventEmitter();

  @Input()
  public id: string = `mcs-checkbox-${nextUniqueId++}`;

  @Input()
  public get indeterminate(): boolean { return this._indeterminate; }
  public set indeterminate(value: boolean) { this._indeterminate = coerceBoolean(value); }
  private _indeterminate: boolean;

  @Input()
  public get checked(): boolean {
    return this._checked;
  }
  public set checked(value: boolean) {
    if (this._checked !== value) {
      this._checked = coerceBoolean(value);
      this._onChanged(this._checked);
      this._changeDetectorRef.markForCheck();
    }
  }
  private _checked: boolean;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
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
    if (value !== this.checked) {
      this.checked = value;
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

  // View <-> Model callback methods
  private _onChanged: (value: any) => void = () => { /** dummy */ };
  private _onTouched = () => { /** dummy */ };
}
