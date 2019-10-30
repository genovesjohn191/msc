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
import { McsUniqueId } from '@app/core';
import {
  coerceBoolean,
  coerceNumber,
  McsColorType,
  CommonDefinition
} from '@app/utilities';

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
    'class': 'checkbox-wrapper',
    '[class.checked]': 'checked',
    '[class.indeterminate]': 'indeterminate'
  }
})

export class CheckboxComponent implements ControlValueAccessor {
  @Output()
  public statusChange: EventEmitter<CheckboxComponent> = new EventEmitter();

  @Input()
  public id: string = McsUniqueId.NewId('checkbox');

  @Input()
  public color: McsColorType = 'dark';

  @Input()
  public get indeterminate(): boolean { return this._indeterminate; }
  public set indeterminate(value: boolean) { this._indeterminate = coerceBoolean(value); }
  private _indeterminate: boolean;

  @Input()
  public get tabindex(): number { return this._tabindex; }
  public set tabindex(value: number) { this._tabindex = coerceNumber(value); }
  private _tabindex: number = 0;

  @Input()
  public get checked(): boolean { return this._checked; }
  public set checked(value: boolean) {
    if (this._checked !== value) {
      this._checked = coerceBoolean(value);
      this._onChanged(this._checked);
      this._changeDetectorRef.markForCheck();
    }
  }
  private _checked: boolean = false;

  public get checkboxIconKey(): string {
    let unCheckedIcon = this.indeterminate ?
      CommonDefinition.ASSETS_SVG_CHECK_BOX_INDETERMINATE :
      CommonDefinition.ASSETS_SVG_CHECK_BOX_OUTLINE;
    return this.checked ? CommonDefinition.ASSETS_SVG_CHECK_BOX : unCheckedIcon;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }

  /**
   * Event that emits when checkbox is clicked
   * @param _event Event that emitted
   */
  public onClickEvent(_event: MouseEvent) {
    _event.stopPropagation();
    this.toggle();
    this.statusChange.emit(this);
  }

  /**
   * Event that emits when change occur
   * @param _event Event that emitted
   */
  public onChange(_event: Event) {
    // We always have to stop propagation on the change event.
    // Otherwise the change event, from the input element, will bubble up and
    // emit its event object to the `change` output.
    _event.stopPropagation();
  }

  /**
   * Event that emits when checkbox removed focused
   */
  public onBlur(): void {
    this._onTouched();
  }

  /**
   * Toggle checkbox value
   */
  public toggle(): void {
    this.checked = !this.checked;
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
