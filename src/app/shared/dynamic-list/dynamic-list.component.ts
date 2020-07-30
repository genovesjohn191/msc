import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  EventEmitter,
  Output,
  ViewEncapsulation,
  forwardRef,
  OnChanges,
  SimpleChanges,
  Optional
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  FormControl,
  Validator,
  ValidationErrors,
  NgForm,
  FormGroupDirective
} from '@angular/forms';
import {
  Observable,
  BehaviorSubject
} from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import {
  CommonDefinition,
  Guid,
  isNullOrEmpty,
  isNullOrUndefined,
  getSafeProperty,
  moveRecordByIndex,
  coerceBoolean,
  isArray,
  ErrorStateMatcher
} from '@app/utilities';
import {
  CoreValidators,
  McsFormFieldControlBase,
  McsUniqueId
} from '@app/core';

const DEFAULT_MINIMUM_ITEM = 0;
const DEFAULT_MAXIMUM_ITEM = 20;

interface DynamicListItem {
  id: string;
  value: string;
}

@Component({
  selector: 'mcs-dynamic-list',
  templateUrl: './dynamic-list.component.html',
  styleUrls: ['./dynamic-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [ /* TODO: Add Animations */],
  providers: [
    { provide: McsFormFieldControlBase, useExisting: DynamicListComponent },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicListComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DynamicListComponent),
      multi: true
    }
  ],
  host: {
    'class': 'dynamic-list-wrapper'
  }
})

export class DynamicListComponent extends McsFormFieldControlBase<any> implements ControlValueAccessor, Validator, OnInit, OnChanges {

  public list$: Observable<DynamicListItem[]>;

  private _templateListChange: BehaviorSubject<DynamicListItem[]>;
  private _validators: Function[] = [];
  private _listCache: any[] = [];

  @Output()
  public listChange = new EventEmitter<string[]>();

  @Input()
  public id: string = McsUniqueId.NewId('dynamic-list');

  @Input()
  public placeholder: string;

  @Input()
  public errorStateMatcher: ErrorStateMatcher;

  @Input()
  public get value(): string[] { return this._value; }
  public set value(value: string[]) {
    if (this._value !== value) {
      this._value = value;
      this._listCache = value;

      let list: DynamicListItem[] = [];
      value.forEach((item) => list.push(this._createDynamicListItem(item)));
      this._templateListChange.next(list);
    }
  }
  private _value: string[];

  @Input()
  public get disabled(): boolean {
    return this._disabled;
  }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;

  @Input()
  public get resettable(): boolean {
    return this._resettable;
  }
  public set resettable(value: boolean) { this._resettable = coerceBoolean(value); }
  private _resettable: boolean = false;

  @Input()
  public get required(): boolean {
    return this._required;
  }
  public set required(value: boolean) { this._required = coerceBoolean(value); }
  private _required: boolean = false;

  @Input()
  public get minimum(): number {
    return this._minimum;
  }
  public set minimum(min: number) {
    if (min < 0) {
      throw new Error('Declared minimum item count should be greater than or equal to zero');
    }
    if (min > this._maximum) {
      throw new Error('Declared minimum item count should be less than maximum item count');
    }
    this._minimum = min;
  }
  private _minimum: number = DEFAULT_MINIMUM_ITEM;

  @Input()
  public get maximum(): number {
    return this._maximum;
  }
  public set maximum(max: number) {
    if (this._minimum > max) {
      throw new Error('Declared maximum item count should be greater than minimum item count');
    }
    this._maximum = max;
  }
  private _maximum: number = DEFAULT_MAXIMUM_ITEM;

  @ViewChild('inputItemFc', { static: false })
  public inputItemFc: ElementRef;

  public get addIconKey(): string {
    return CommonDefinition.ASSETS_SVG_PLUS;
  }

  public get removeIconKey(): string {
    return CommonDefinition.ASSETS_SVG_DELETE;
  }

  public get resetKey(): string {
    return CommonDefinition.ASSETS_SVG_RESET;
  }

  public get moveUpKey(): string {
    return CommonDefinition.ASSETS_SVG_ARROW_UP_SORT_BLACK;
  }

  public get moveDownKey(): string {
    return CommonDefinition.ASSETS_SVG_ARROW_DOWN_SORT_BLACK;
  }

  constructor(
    _elementRef: ElementRef,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective
  ) {
    super(_elementRef.nativeElement, _parentFormGroup || _parentForm);
    this._templateListChange = new BehaviorSubject([]);
    this.listChange = new EventEmitter();
  }

  public ngOnInit(): void {
    this._subscribeToListChange();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.minimum || changes.maximum) {
      this._validators.push(CoreValidators.rangeArray(this.minimum, this.maximum));
    }

    if (changes.required) {
      this._validators.push(CoreValidators.requiredArray);
    }
  }

  /**
   * Base implementation of empty checking
   */
  public isEmpty(): boolean {
    return isNullOrEmpty(this.value);
  }

  /**
   * validate method implementation of Validator
   * @param _control form control to validate
   */
  public validate(_control: FormControl): ValidationErrors | null {
    let errors = {};
    this._validators.forEach((error) => {
      errors = { ...errors, ...error };
    });
    return errors;
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any[]): void {
    if (isNullOrUndefined(value)) { return; }
    if (!isArray(value)) { throw new Error('Initial value must be an array'); }

    this._listCache = value;

    let list: DynamicListItem[] = [];
    value.forEach((item) => list.push(this._createDynamicListItem(item)));
    this._templateListChange.next(list);
  }

  /**
   * On Change Event implementation of ControlValueAccessor
   * @param fn Function Invoker
   */
  public registerOnChange(fn: any): void {
    this._propagateChange = fn;
  }

  /**
   * On Touched Event implementation of ControlValueAccessor
   * @param fn Function Invoker
   */
  public registerOnTouched(_fn: any): void { /* Dummy */ }

  /**
   * Returns true if list item count is greater than or equal to the declared maximum value, false otherwise
   * @param list list items
   */
  public isMaximum(list: DynamicListItem[]): boolean {
    return list.length >= this._maximum;
  }

  /**
   * Add an item in the list
   * @param value value to be added
   * @param list list of items
   */
  public addListItem(value: string, list: DynamicListItem[]): void {
    if (isNullOrEmpty(value) || this.isMaximum(list)) { return; }
    list.push(this._createDynamicListItem(value));
    this._updateListValues(list);
    this._resetInput(list);
  }

  /**
   * Remove an item in the list
   * @param value value to be remove
   * @param list list of items
   */
  public removeListItem(id: string, list: DynamicListItem[]): void {
    let updatedList = list.filter((listItem) => listItem.id !== id);
    this._updateListValues(updatedList);
  }

  /**
   * Move an item up the list
   * @param index index of the current item
   * @param list list of items
   */
  public moveUpListItem(index: number, list: DynamicListItem[]): void {
    moveRecordByIndex(list, index, index - 1);
    this._updateListValues(list);
  }

  /**
   * Move an item down the list
   * @param index index of the current item
   * @param list list of items
   */
  public moveDownListItem(index: number, list: DynamicListItem[]): void {
    moveRecordByIndex(list, index, index + 1);
    this._updateListValues(list);
  }

  /**
   * Reset the list items based on the default list item set on the component
   */
  public reset() {
    let list: DynamicListItem[] = [];
    this._listCache.forEach((item) => list.push(this._createDynamicListItem(item)));
    this._updateListValues(list);
  }

  /**
   *  Add an item in the list upon keyup enter
   */
  public onEnterAddItem(event: Event, value: string, list: DynamicListItem[]): void {
    if (isNullOrEmpty(event)) { return; }
    event.stopPropagation();
    this.addListItem(value, list);
  }

  private _resetInput(list: DynamicListItem[]): void {
    let inputObj = getSafeProperty(this.inputItemFc, (obj) => obj.nativeElement);
    if (isNullOrEmpty(inputObj)) { return; }

    this.inputItemFc.nativeElement.value = '';

    if (this.isMaximum(list)) {
      this.inputItemFc.nativeElement.blur();
    }
  }

  private _subscribeToListChange(): void {
    this.list$ = this._templateListChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  private _updateListValues(list: DynamicListItem[]): void {
    let stringList: string[] = [];
    if (!isNullOrEmpty(list)) {
      list.forEach((item) => {
        stringList.push(item.value);
      });
    }
    this.listChange.emit(stringList);
    this._templateListChange.next(list);
    this._propagateChange(stringList);
  }

  private _createDynamicListItem(value: string): DynamicListItem {
    return { value, id: Guid.newGuid().toString() };
  }

  private _propagateChange = (_value: string[]) => { };
}