import {
  Component,
  Input,
  QueryList,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnDestroy,
  AfterContentInit,
  ContentChildren,
  forwardRef,
  ElementRef
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { startWith } from 'rxjs/operator/startWith';
import {
  Key,
  McsSelection,
  CoreDefinition
} from '../../core';
import {
  isNullOrEmpty,
  registerEvent,
  unregisterEvent
} from '../../utilities';
import { SelectItemComponent } from './select-item/select-item.component';

@Component({
  selector: 'mcs-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  host: {
    'class': 'select-wrapper',
    '(keydown)': 'onKeyDown($event)',
    '(blur)': 'onBlur()'
  }
})

export class SelectComponent implements AfterContentInit, OnDestroy, ControlValueAccessor {
  @Input()
  public placeholder: string;

  @ContentChildren(SelectItemComponent, { descendants: true })
  private _items: QueryList<SelectItemComponent>;

  /**
   * Model binding value that get updated everytime the item is selected
   */
  private _modelValue: any;
  public get modelValue(): any {
    return this._modelValue;
  }
  public set modelValue(value: any) {
    if (this._modelValue !== value) {
      this._modelValue = value;
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
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef
  ) {
    this.panelOpen = false;
    this._selection = new McsSelection<SelectItemComponent>(false);
  }

  public ngAfterContentInit(): void {
    registerEvent(document, 'click', this._closeOutsideHandler);
    this._itemsSubscripton = startWith.call(this._items.changes, null).subscribe(() => {
      this._listenToSelectionChange();
    });
  }

  public ngOnDestroy(): void {
    unregisterEvent(document, 'click', this._closeOutsideHandler);
    if (!isNullOrEmpty(this._selectionSubscription)) {
      this._selectionSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this._itemsSubscripton)) {
      this._itemsSubscripton.unsubscribe();
    }
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

  public onBlur(): void {
    if (!this.panelOpen) {
      this._onTouched();
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    if (value !== this.modelValue) {
      this.modelValue = value;
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
    this._clearItemSelection(item);
    item.select();
    this._selection.select(item);
    this.modelValue = item.value;
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
