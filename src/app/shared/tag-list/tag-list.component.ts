import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  ContentChildren,
  ContentChild,
  QueryList,
  ChangeDetectorRef,
  ElementRef,
  Optional,
  Self,
  AfterContentInit,
  DoCheck,
  OnChanges,
  OnDestroy
} from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { merge } from 'rxjs/observable/merge';
import { startWith } from 'rxjs/operator/startWith';
import {
  ControlValueAccessor,
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import {
  Key,
  McsFormFieldControlBase
} from '../../core';
import {
  isNullOrEmpty,
  refreshView,
  coerceNumber,
  coerceBoolean,
  ErrorStateMatcher,
  unsubscribeSafely
} from '../../utilities';
import { TagComponent } from './tag/tag.component';
import { TagInputDirective } from './tag-input/tag-input.directive';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: McsFormFieldControlBase, useExisting: TagListComponent }
  ],
  host: {
    'class': 'tag-list-wrapper',
    'role': 'listbox',
    '[attr.id]': 'id',
    '[attr.tabindex]': 'tabindex',
    '(keydown)': 'onKeyDown($event)',
    '(blur)': 'onBlur()',
    '(focus)': 'onFocus()'
  }
})

export class TagListComponent extends McsFormFieldControlBase<any>
  implements AfterContentInit, DoCheck, OnChanges, OnDestroy, ControlValueAccessor {

  @Input()
  public id: string = `mcs-taglist-${nextUniqueId++}`;

  @Input()
  public placeholder: string;

  @Input()
  public errorStateMatcher: ErrorStateMatcher;

  @Input()
  public get required() { return this._required; }
  public set required(value: boolean) { this._required = coerceBoolean(value); }
  private _required: boolean = false;

  @Input()
  public get disabled() { return this.ngControl ? this.ngControl.disabled : this._disabled; }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;

  @Input()
  public get tabindex(): number { return this._tabindex; }
  public set tabindex(value: number) { this._tabindex = coerceNumber(value, this._tabindex); }
  private _tabindex: number = 0;

  /**
   * Model Value of the tag list (Two way binding)
   */
  @Input()
  public get value() { return this._value; }
  public set value(value: any) {
    if (value !== this._value) {
      this._value = value;
      this._onChanged(value);
      this._changeDetectorRef.markForCheck();
    }
  }
  private _value: any;

  /**
   * Tags item
   */
  @ContentChildren(TagComponent, { descendants: true })
  private _items: QueryList<TagComponent>;

  /**
   * Tag Input directive
   */
  @ContentChild(TagInputDirective)
  private _tagInput: TagInputDirective;

  // Other variables
  private _activeTagIndex: number;
  private _selectionSubscription: any;
  private _removedSubscription: any;
  private _focusedSubscription: any;
  private _itemsSubscripton: any;

  constructor(
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
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._selectionSubscription);
    unsubscribeSafely(this._removedSubscription);
    unsubscribeSafely(this._focusedSubscription);
    unsubscribeSafely(this._itemsSubscripton);
    this.stateChanges.complete();
  }

  public ngAfterContentInit() {
    this._itemsSubscripton = startWith.call(this._items.changes, null).subscribe(() => {
      this._listenToFocusChanges();
      this._listenToSelectionChanges();
      this._listenToRemovedChanges();
      this._setModelValue(this._items.length);
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

  /**
   * Element Reference of the associated component
   */
  public get elementRef(): ElementRef {
    return this._elementRef;
  }

  /**
   * Combine stream of all the selected item child's change event
   */
  public get itemsSelectionChanged(): Observable<TagComponent> {
    return merge(...this._items.map((item) => item.selectionChanged));
  }

  /**
   * Combine stream of all the removed of child's event
   */
  public get itemRemoveChanged(): Observable<TagComponent> {
    return merge(...this._items.map((item) => item.removed));
  }

  /**
   * Combine stream of all the received focus of child's event
   */
  public get itemFocusChanged(): Observable<TagComponent> {
    return merge(...this._items.map((item) => item.receivedFocus));
  }

  /**
   * Base implementation of empty checking
   */
  public isEmpty(): boolean {
    return isNullOrEmpty(this.value);
  }

  /**
   * Event that emits when the element removed focus
   */
  public onBlur(): void {
    this.focused = false;
    if (!this.disabled) {
      this._onTouched();
      this.stateChanges.next();
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Event that emits when the element received focus
   */
  public onFocus(): void {
    this.focused = true;
    if (this._tagInput && this._tagInput.focused) { return; }

    // Focus the first element if the input is not focused, otherwise focus the input
    // if the tags was not yet added
    if (this._items.length > 0) {
      this._items.first.focus();
    } else if (!isNullOrEmpty(this._tagInput)) {
      this._tagInput.focus();
    }
    this.stateChanges.next();
  }

  /**
   * Event that emits when the element received keyboard input
   */
  public onKeyDown(_event: KeyboardEvent) {
    let target = event.target as HTMLElement;
    let isInputEmpty = this._isInputEmpty(target);

    // If they are on an empty input and hit backspace, focus the last tag
    if (isInputEmpty && _event.keyCode === Key.Backspace) {
      this._items.last.focus();
      _event.preventDefault();
      return;
    }

    // Exit arrow keys code when the input is on focused
    if (this._tagInput && this._tagInput.focused) { return; }

    // Check for arrow keys and set the focus to corresponding tag
    switch (_event.keyCode) {
      case Key.LeftArrow:
      case Key.DownArrow:
        let previousTag = Math.max(0, this._activeTagIndex - 1);
        this._items.toArray()[previousTag].focus();
        break;

      case Key.RightArrow:
      case Key.UpArrow:
        let nextTag = Math.min((this._items.length - 1), this._activeTagIndex + 1);
        this._items.toArray()[nextTag].focus();
        break;

      default:
        // Do nothing
        break;
    }
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(_value: any) {
    if (!isNullOrEmpty(_value)) {
      this.value = _value;
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

  /**
   * Listen to selection changes of each tag
   */
  private _listenToSelectionChanges(): void {
    unsubscribeSafely(this._selectionSubscription);
    this._selectionSubscription = this.itemsSelectionChanged.subscribe((item) => {
      this._selectItem(item);
    });
  }

  /**
   * Listen to removed changes of each tag
   */
  private _listenToRemovedChanges(): void {
    unsubscribeSafely(this._removedSubscription);
    this._removedSubscription = this.itemRemoveChanged.subscribe((item) => {
      this._setFocusToInlineTag(item);
    });
  }

  /**
   * Listen to focus changes of each tag
   */
  private _listenToFocusChanges(): void {
    unsubscribeSafely(this._focusedSubscription);
    this._focusedSubscription = this.itemFocusChanged.subscribe((item) => {
      this._activeTagIndex = this._items.toArray().indexOf(item);
    });
  }

  /**
   * Select tag item and set it to the model value
   * @param item Item to be selected
   */
  private _selectItem(item: TagComponent) {
    if (isNullOrEmpty(item)) { return; }
    this._clearItemSelection(item);
    item.select();
    this.stateChanges.next();
  }

  /**
   * Clear all the selection
   * @param selectedItem Selected tag component
   */
  private _clearItemSelection(selectedItem: TagComponent): void {
    this._items.forEach((item) => {
      if (item.id !== selectedItem.id) {
        item.deselect();
      }
    });
  }

  /**
   * Returns true when the input is empty, otherwise false
   * @param element Element to be check if empty
   */
  private _isInputEmpty(element: HTMLElement): boolean {
    if (element && element.nodeName.toLowerCase() === 'input') {
      let input = element as HTMLInputElement;
      return !input.value;
    }
    return false;
  }

  /**
   * Set the focus to inline item/tag
   *
   * `@Note:` When the active tag was the last item going backward,
   * it will delete the next item/t
   * @param activeTag Currently active item/tag
   */
  private _setFocusToInlineTag(activeTag: TagComponent): void {
    let tagIndex = this._items.toArray().indexOf(activeTag);
    let inlineTagIndex = Math.max(0, tagIndex - 1);

    // We need to refresh the view first in order to get the latest
    // items rendered in the DOM
    refreshView(() => {
      if (inlineTagIndex <= this._items.length - 1) {
        this._items.toArray()[inlineTagIndex].focus();
      }
    });
  }

  /**
   * Set the model value
   * @param tagsCount Tags count
   */
  private _setModelValue(tagsCount: number): void {
    this.value = tagsCount === 0 ? undefined : tagsCount;
    if (tagsCount > 0) { this._onTouched(); }
    this.stateChanges.next();
    this._changeDetectorRef.markForCheck();
  }
}
