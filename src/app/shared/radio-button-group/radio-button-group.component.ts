import {
  Component,
  forwardRef,
  Input,
  AfterContentInit,
  OnDestroy,
  ContentChildren,
  QueryList,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
  Observable,
  merge,
  Subject
} from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import { Key } from '@app/models';
import {
  coerceNumber,
  isNullOrEmpty,
  unsubscribeSubject,
  McsOrientationType
} from '@app/utilities';
import { RadioButtonComponent } from './radio-button/radio-button.component';
import { McsUniqueId } from '@app/core';

@Component({
  selector: 'mcs-radio-button-group',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./radio-button-group.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioButtonGroupComponent),
      multi: true
    }
  ],
  host: {
    'class': 'radio-button-group-wrapper',
    '[class.radio-button-group-horizontal]': 'orientation === "horizontal"',
    '[class.radio-button-group-vertical]': 'orientation === "vertical"',
    'role': 'radiogroup',
    '[attr.tabindex]': 'tabindex',
    '(keydown)': 'onKeyDown($event)'
  }
})

export class RadioButtonGroupComponent implements AfterContentInit,
  ControlValueAccessor, OnDestroy {

  @Input()
  public orientation: McsOrientationType = 'horizontal';

  @Input()
  public get tabindex(): number { return this._tabindex; }
  public set tabindex(value: number) { this._tabindex = coerceNumber(value, this._tabindex); }
  private _tabindex: number = 0;

  @Input()
  public get name(): string { return this._name; }
  public set name(value: string) {
    this._name = value;
    this._updateRadioButtonNames();
  }
  private _name: string = McsUniqueId.NewId('radio-button-group');

  /**
   * Model Value of the tag list (Two way binding)
   */
  @Input()
  public get value() { return this._value; }
  public set value(value: any) {
    if (value !== this._value) {
      this._value = value;
      this._selectElementByValue(this.value);
      this._onChanged(this._value);
      this._changeDetectorRef.markForCheck();
    }
  }
  private _value: any;

  /**
   * Radio buttons content
   */
  @ContentChildren(RadioButtonComponent, { descendants: true })
  private _radioButtons: QueryList<RadioButtonComponent>;

  // Other variables
  private _selectedItemIndex: number;
  private _destroySubject = new Subject<void>();

  /**
   * Combine stream of all the selected item child's change event
   */
  public get itemsSelectionChanged(): Observable<RadioButtonComponent> {
    return merge(...this._radioButtons.map((item) => item.change));
  }

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngAfterContentInit() {
    this._radioButtons.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => {
        this._listenToSelectionChanges();
        this._initializeSelection();
        this._updateRadioButtonNames();
      });
  }

  public ngOnDestroy() {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Event that emits when key is press
   * @param event Keyboard event elements
   */
  public onKeyDown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case Key.UpArrow:
      case Key.RightArrow:
        let nextTag = Math.min((this._radioButtons.length - 1),
          this._selectedItemIndex + 1);
        this._radioButtons.toArray()[nextTag].onClickEvent(null);
        break;

      case Key.DownArrow:
      case Key.LeftArrow:
        let previousTag = Math.max(0, this._selectedItemIndex - 1);
        this._radioButtons.toArray()[previousTag].onClickEvent(null);
        break;

      default:
        break;
    }
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    this.value = value;
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
   * Event that emits when focus is removed
   */
  public onBlur(): void {
    this._onTouched();
  }

  /**
   * Selects the element based on the value
   */
  private _selectElementByValue(value: any): void {
    if (isNullOrEmpty(value)) { return; }

    let radioButtonFound = this._radioButtons.find((radioButton) => radioButton.value === value);
    if (!isNullOrEmpty(radioButtonFound)) {
      radioButtonFound.onClickEvent(null);
    }
  }

  /**
   * Set the initial selection of the radio button group
   */
  private _initializeSelection(): void {
    // Defer setting the value in order to avoid the "Expression
    // has changed after it was checked" errors from Angular.
    Promise.resolve().then(() => {
      if (isNullOrEmpty(this.value)) {
        this._radioButtons.first.onClickEvent(null);
      } else {
        let elementByValue = this._radioButtons.find((radio) => {
          return radio.value === this.value;
        });
        if (isNullOrEmpty(elementByValue)) {
          throw new Error('Specified value could not be found within the group.');
        }
        elementByValue.onClickEvent(null);
      }
    });
  }

  /**
   * Update radio button names for groupings
   */
  private _updateRadioButtonNames(): void {
    if (this._radioButtons) {
      this._radioButtons.forEach((radio) => {
        radio.name = this.name;
      });
    }
  }

  /**
   * Listen to selection changes of each tag
   */
  private _listenToSelectionChanges(): void {
    let resetSubject = merge(this._radioButtons.changes, this._destroySubject);
    this.itemsSelectionChanged
      .pipe(takeUntil(resetSubject))
      .subscribe((item) => {
        this._selectItem(item);
        this._selectedItemIndex = this._radioButtons.toArray().indexOf(item);
      });
  }

  /**
   * Select tag item and set it to the model value
   * @param item Item to be selected
   */
  private _selectItem(item: RadioButtonComponent) {
    if (isNullOrEmpty(item)) { return; }
    this._clearItemSelection(item);
    item.checkRadioButton();
    this.value = item.value;
  }

  /**
   * Clear all the selection
   * @param selectedItem Selected tag component
   */
  private _clearItemSelection(selectedItem: RadioButtonComponent): void {
    this._radioButtons.forEach((item) => {
      if (item.generatedId !== selectedItem.generatedId) {
        item.uncheckRadioButton();
        item.markForCheck();
      }
    });
  }

  // View <-> Model callback methods
  private _onChanged: (value: any) => void = () => { /** dummy */ };
  private _onTouched = () => { /** dummy */ };
}
