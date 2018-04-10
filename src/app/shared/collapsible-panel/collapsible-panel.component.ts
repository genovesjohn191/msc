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
import {
  coerceBoolean,
  coerceNumber,
  animateFactory
} from '../../utilities';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-collapsible-panel',
  templateUrl: './collapsible-panel.component.html',
  styleUrls: ['./collapsible-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CollapsiblePanelComponent),
      multi: true
    }
  ],
  animations: [
    animateFactory.expansionVertical
  ],
  host: {
    'class': 'collapsible-panel-wrapper',
    '[attr.id]': 'id',
    '[tabindex]': 'tabindex'
  }
})

export class CollapsiblePanelComponent implements ControlValueAccessor {
  @Output()
  public change: EventEmitter<CollapsiblePanelComponent> = new EventEmitter();

  @Input()
  public id: string = `mcs-collapsible-panel-${nextUniqueId++}`;

  @Input()
  public get tabindex(): number { return this._tabindex; }
  public set tabindex(value: number) { this._tabindex = coerceNumber(value); }
  private _tabindex: number = 0;

  @Input()
  public get header(): string { return this._header; }
  public set header(value: string) { this._header = value; }
  private _header: string;

  @Input()
  public get value(): boolean { return this._value; }
  public set value(value: boolean) {
    if (this._value !== value) {
      this._value = coerceBoolean(value);
      this._onChanged(this._value);
    }
  }
  private _value: boolean = false;

  /**
   * Returns true when the panel is currently open (toggled)
   */
  private _panelOpen: boolean;
  public get panelOpen(): boolean { return this._panelOpen; }
  public set panelOpen(value: boolean) {
    if (value !== this._panelOpen) {
      this._panelOpen = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }

  /**
   * Event that emits when there is change in the toggle of panel
   * @param _event Event to be pass on the emitter
   */
  public onChange(_event: any): void {
    this.panelOpen = this.value;
    this.change.emit(this);
  }

  /**
   * Event that emits when checkbox removed focused
   */
  public onBlur(): void {
    this._onTouched();
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(_value: any) {
    if (_value !== this.value) {
      this.value = _value;
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

  // View <-> Model callback methods
  private _onChanged: (value: any) => void = () => { /** dummy */ };
  private _onTouched = () => { /** dummy */ };
}
