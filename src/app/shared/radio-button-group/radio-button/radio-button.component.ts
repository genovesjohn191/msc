import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ChangeDetectorRef,
  ViewChild,
  ContentChild,
  AfterContentInit
} from '@angular/core';
import {
  CoreDefinition,
  McsUniqueId
} from '@app/core';
import {
  coerceBoolean,
  isNullOrEmpty
} from '@app/utilities';
import { IdDirective } from '../../directives';

@Component({
  selector: 'mcs-radio-button',
  templateUrl: './radio-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'radio-button-wrapper',
    '(focus)': 'focus()',
    '[class.radio-button-checked]': 'checked'
  }
})

export class RadioButtonComponent implements AfterContentInit {

  public generatedId: string;

  @Output()
  public change = new EventEmitter<RadioButtonComponent>();

  @Input()
  public name: string;

  @Input()
  public get checked(): boolean { return this._checked; }
  public set checked(value: boolean) {
    if (this._checked !== value) {
      this._checked = coerceBoolean(value);
      this._changeDetectorRef.markForCheck();
    }
  }
  private _checked: boolean = false;

  @Input()
  public get value(): any { return this._value; }
  public set value(value: any) { this._value = value; }
  private _value: any;

  @ViewChild('inputElement')
  private _inputElement: ElementRef;

  @ContentChild(IdDirective)
  private _idElement: IdDirective;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public ngAfterContentInit() {
    Promise.resolve().then(() => {
      this.generatedId = isNullOrEmpty(this._idElement) ?
        McsUniqueId.NewId('radio-button') :
        this._idElement.generateNewHashId();
    });
  }

  /**
   * Returns the radio button icon key based on the checked status
   */
  public get radioButtonIconKey(): string {
    return this.checked ? CoreDefinition.ASSETS_SVG_RADIO_CHECKED :
      CoreDefinition.ASSETS_SVG_RADIO_UNCHECKED;
  }

  /**
   * Refresh the view of radio button component
   */
  public markForCheck(): void {
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Check the corresponding radio button
   */
  public checkRadioButton(): void {
    this.checked = true;
  }

  /**
   * UnCheck the corresponding radio button
   */
  public uncheckRadioButton(): void {
    this.checked = false;
  }

  /**
   * Event that emits when checkbox is clicked
   * @param event Event that emitted
   */
  public onClickEvent(event?: MouseEvent) {
    if (!isNullOrEmpty(event)) {
      event.stopPropagation();
    }
    this.change.emit(this);
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
    // Touch the element
  }

  /**
   * Set focus to input element
   */
  public focus(): void {
    this._inputElement.nativeElement.focus();
  }
}
