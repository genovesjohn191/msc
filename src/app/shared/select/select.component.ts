import {
  Component,
  Input,
  QueryList,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  DoCheck,
  OnChanges,
  OnDestroy,
  AfterContentInit,
  ContentChildren,
  ElementRef,
  Optional,
  Self
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { startWith } from 'rxjs/operator/startWith';
import {
  Key,
  McsSelection,
  CoreDefinition,
  McsFormFieldControlBase
} from '../../core';
import {
  isNullOrEmpty,
  registerEvent,
  unregisterEvent,
  ErrorStateMatcher,
  refreshView,
  coerceBoolean,
  coerceNumber,
  unsubscribeSafely
} from '../../utilities';
import { SelectItemComponent } from './select-item/select-item.component';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: McsFormFieldControlBase, useExisting: SelectComponent }
  ],
  host: {
    'class': 'select-wrapper',
    'role': 'listbox',
    '[attr.id]': 'id',
    '[attr.tabindex]': 'tabindex',
    '(keydown)': 'onKeyDown($event)',
    '(blur)': 'onBlur()',
    '(focus)': 'onFocus()'
  }
})

export class SelectComponent extends McsFormFieldControlBase<any>
  implements AfterContentInit, DoCheck, OnChanges, OnDestroy, ControlValueAccessor {

  @Input()
  public id: string = `mcs-select-${nextUniqueId++}`;

  @Input()
  public placeholder: string;

  @Input()
  public errorStateMatcher: ErrorStateMatcher;

  @Input()
  public size: 'default' | 'small';

  @Input()
  public get disabled(): boolean {
    return this.ngControl ? this.ngControl.disabled : this._disabled;
  }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;

  @ContentChildren(SelectItemComponent, { descendants: true })
  private _items: QueryList<SelectItemComponent>;

  @Input()
  public get required(): boolean { return this._required; }
  public set required(value: boolean) { this._required = coerceBoolean(value); }
  private _required: boolean = false;

  @Input()
  public get tabindex(): number { return this._tabindex; }
  public set tabindex(value: number) { this._tabindex = coerceNumber(value); }
  private _tabindex: number = 0;

  /**
   * Base value implementation of value accessor
   */
  private _value: any;
  public get value(): any {
    return this._value;
  }
  public set value(value: any) {
    if (this._value !== value) {
      this._value = value;
      this._onChanged(value);
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Return true when the panel is currently Open, otherwise false
   */
  private _panelOpen: boolean;
  public get panelOpen(): boolean {
    return this._panelOpen;
  }
  public set panelOpen(value: boolean) {
    if (this._panelOpen !== value) {
      this._panelOpen = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _selection: McsSelection<SelectItemComponent>;
  private _selectionSubscription: any;
  private _itemsSubscripton: any;

  /**
   * Event handler references
   */
  private _closeOutsideHandler = this._onCloseOutside.bind(this);

  public get carretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_DOWN;
  }

  public get displayedText(): string {
    return this._selection.selected.map((item) => item.viewValue).toString();
  }

  /**
   * Combine stream of all the selected item child's change event
   */
  public get itemsSelectionChanged(): Observable<SelectItemComponent> {
    return Observable.merge(...this._items.map((item) => item.selectionChanged));
  }

  public constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective
  ) {
    super(_elementRef.nativeElement, _parentFormGroup || _parentForm);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    this.panelOpen = false;
    this._selection = new McsSelection<SelectItemComponent>(false);
    this.size = 'default';
  }

  public ngAfterContentInit(): void {
    registerEvent(document, 'click', this._closeOutsideHandler);
    this._itemsSubscripton = startWith.call(this._items.changes, null).subscribe(() => {
      this._listenToSelectionChange();
    });
  }

  public ngDoCheck(): void {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  public ngOnChanges(): void {
    this.stateChanges.next();
  }

  public ngOnDestroy(): void {
    unregisterEvent(document, 'click', this._closeOutsideHandler);
    unsubscribeSafely(this._selectionSubscription);
    unsubscribeSafely(this._itemsSubscripton);
    this.stateChanges.complete();
  }

  public onKeyDown(_event: KeyboardEvent) {
    if (_event.keyCode === Key.Enter || _event.keyCode === Key.Space) {
      event.preventDefault(); // prevents the page from scrolling down when pressing space
      this.closePanel();
    }
  }

  public openPanel() {
    if (isNullOrEmpty(this._items)) { return; }
    this.panelOpen = true;
  }

  public closePanel() {
    if (isNullOrEmpty(this._items)) { return; }
    this.panelOpen = false;
  }

  public toggle() {
    this.panelOpen ? this.closePanel() : this.openPanel();
  }

  /** Callback for the cases where the focused state of the input changes. */
  public onBlur(): void {
    this.focused = false;
    if (!this.disabled && !this.panelOpen) {
      this._onTouched();
      this._changeDetectorRef.markForCheck();
      this.stateChanges.next();
    }
  }

  public onFocus(): void {
    if (!this.disabled) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    refreshView(() => {
      if (this._items) {
        let selectedItem = this._items.find((item) => item.value === value);
        this._selectItem(selectedItem);
      }
    });
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
   * Base implementation of empty checking
   */
  public isEmpty(): boolean {
    return isNullOrEmpty(this.value);
  }

  // View <-> Model callback methods
  private _onChanged: (value: any) => void = () => { /** dummy */ };
  private _onTouched = () => { /** dummy */ };

  private _onCloseOutside(_event: any) {
    if (this._elementRef.nativeElement.contains(_event.target)) {
      return;
    }
    this.closePanel();
  }

  private _listenToSelectionChange(): void {
    this._selectionSubscription = this.itemsSelectionChanged.subscribe((item) => {
      this._selectItem(item);
      this.closePanel();
    });
  }

  private _selectItem(item: SelectItemComponent) {
    if (isNullOrEmpty(item)) { return; }
    this._clearItemSelection(item);
    item.select();
    this._selection.select(item);
    this.value = item.value;
    this.stateChanges.next();
  }

  private _clearItemSelection(selectedItem: SelectItemComponent): void {
    this._selection.clear();
    this._items.forEach((item) => {
      if (item.id !== selectedItem.id) {
        item.deselect();
      }
    });
  }
}
