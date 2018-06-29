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
  Self,
  EventEmitter,
  Output
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import {
  Observable,
  Subject,
  merge
} from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import {
  Key,
  McsSelection,
  CoreDefinition,
  McsFormFieldControlBase,
  McsItemListKeyManager,
  McsScrollDispatcherService
} from '../../core';
import {
  isNullOrEmpty,
  triggerEvent,
  registerEvent,
  unregisterEvent,
  ErrorStateMatcher,
  coerceBoolean,
  coerceNumber,
  animateFactory
} from '../../utilities';
import { SelectItemComponent } from './select-item/select-item.component';

const SELECT_PANEL_MAX_HEIGHT = 400;
const SELECT_ITEM_OFFSET = 7;

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
  animations: [
    animateFactory.fadeIn,
    animateFactory.transformVertical
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

  public selection: McsSelection<SelectItemComponent>;

  @Output()
  public change = new EventEmitter<any>();

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
  public get value(): any { return this._value; }
  public set value(value: any) {
    if (this._value !== value) {
      this._value = value;
      this._onChanged(this._value);
      this.change.emit(this._value);
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Return true when the panel is currently Open, otherwise false
   */
  private _panelOpen: boolean;
  public get panelOpen(): boolean { return this._panelOpen; }
  public set panelOpen(value: boolean) {
    if (this._panelOpen !== value) {
      this._panelOpen = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  private _itemListKeyManager: McsItemListKeyManager<SelectItemComponent>;
  private _closePanelKeyEventsMap = new Map<Key, (_event) => void>();
  private _openPanelKeyEventsMap = new Map<Key, (_event) => void>();
  private _destroySubject = new Subject<void>();

  /**
   * Event handler references
   */
  private _closeOutsideHandler = this._onCloseOutside.bind(this);

  public get carretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_DOWN;
  }

  public get displayedText(): string {
    return this.selection.selected.map((item) => item.viewValue).toString();
  }

  /**
   * Combine streams of all the selected item child's change event
   */
  public get itemsSelectionChanged(): Observable<SelectItemComponent> {
    return merge(...this._items.map((item) => item.itemSelectionChanged));
  }

  /**
   * Combine streams of all the selected item child's group selection event
   */
  public get groupsSelectionChanged(): Observable<SelectItemComponent> {
    return merge(...this._items.map((item) => item.groupSelectionChanged));
  }

  /**
   * Returns all the visible items from elements
   */
  public get visibleItems(): SelectItemComponent[] {
    return this._items.filter((item) => item.isVisible());
  }

  public constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _scrollDispatcher: McsScrollDispatcherService,
    @Optional() @Self() public ngControl: NgControl,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective
  ) {
    super(_elementRef.nativeElement, _parentFormGroup || _parentForm);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    this.panelOpen = false;
    this.selection = new McsSelection<SelectItemComponent>(false);
    this.size = 'default';
  }

  public ngAfterContentInit(): void {
    registerEvent(document, 'click', this._closeOutsideHandler);
    this._initializeKeyboardManager();

    this._items.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => {
        this._listenToSelectionChange();
        this._initializeSelection();
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
    this._destroySubject.next();
    this._destroySubject.complete();
    this.stateChanges.complete();
  }

  /**
   * Event that emits when the host element received keydown
   * @param _event Keyboard event details
   */
  public onKeyDown(_event: KeyboardEvent) {
    if (!this.disabled) {
      this.panelOpen ? this._handleOpenPanelKeydown(_event) :
        this._handleClosedPanelKeydown(_event);
    }
  }

  /**
   * Opens the panel of the select
   */
  public openPanel() {
    if (isNullOrEmpty(this._items)) { return; }
    this.panelOpen = true;
  }

  /**
   * Closes the panel of the select
   */
  public closePanel() {
    if (!isNullOrEmpty(this._items) && !this.panelOpen) { return; }

    // We need to clear the active item upon closing the panel
    // to selected item as active item
    this._items.forEach((item) => item.closeGroupPanel());
    this._clearActiveItemState();
    if (this.selection.hasValue()) {
      this._itemListKeyManager.setActiveItem(this.selection.selected[0]);
    }
    setTimeout(() => this.panelOpen = false);
  }

  /**
   * Toggles the panel of the select
   */
  public toggle() {
    this.panelOpen ? this.closePanel() : this.openPanel();
  }

  /**
   * Callback for the cases where the focused state of the input changes.
   */
  public onBlur(): void {
    this.focused = false;
    if (!this.disabled && !this.panelOpen) {
      this._onTouched();
      this._changeDetectorRef.markForCheck();
      this.stateChanges.next();
    }
  }

  /**
   * Event that emits when the element received focus
   */
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
    if (!isNullOrEmpty(this._items)) { this._selectItemByValue(value); }
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

  /**
   * Event that emits when user has clicked outside the panel
   * @param _event Event details
   */
  private _onCloseOutside(_event: any) {
    if (this._elementRef.nativeElement.contains(_event.target)) { return; }
    this.closePanel();
  }

  /**
   * Listen to every selection changed event
   */
  private _listenToSelectionChange(): void {
    let changedOrDestroyed = merge(this._items.changes, this._destroySubject);
    this.itemsSelectionChanged
      .pipe(takeUntil(changedOrDestroyed))
      .subscribe((item) => {
        this._selectItem(item);
        this.closePanel();
      });

    this.groupsSelectionChanged
      .pipe(takeUntil(changedOrDestroyed))
      .subscribe((item) => {
        this._toggleItemPanel(item);
      });
  }

  /**
   * Toggle the panel of the sub-group item
   * @param item Item to be toggled
   */
  private _toggleItemPanel(item: SelectItemComponent) {
    this._items.forEach((_item) => {
      (_item === item) ? _item.toggleGroupPanel() : _item.closeGroupPanel();
    });
  }

  /**
   * Selects the item provided by the parameter
   * @param item Item to be selected
   */
  private _selectItem(item: SelectItemComponent) {
    // Clear the selection including the value in case the item is null
    // to make way with the changes when formControl.reset() was called
    if (isNullOrEmpty(item)) {
      this.value = undefined;
      this._clearItemSelection(item);
      this.stateChanges.next();
      return;
    }

    this._clearItemSelection(item);
    item.select();
    this.selection.select(item);
    this.value = item.value;
    this.stateChanges.next();
  }

  /**
   * Selects the element based on the provided value
   * @param value Value to be checked in the item options
   */
  private _selectItemByValue(value: SelectItemComponent) {
    let selectedItem = this._items.find((item) => item.value === value);
    this._selectItem(selectedItem);
  }

  /**
   * Clears the item selection model
   * @param skipItem Item to be skipped in clearing the selection
   */
  private _clearItemSelection(skipItem: SelectItemComponent): void {
    this.selection.clear();
    this._items.forEach((item) => {
      if (item !== skipItem) {
        item.deselect();
      }
    });
  }

  /**
   * Initializes the instance of keyboard manager
   */
  private _initializeKeyboardManager(): void {
    this._itemListKeyManager = new McsItemListKeyManager(this._items);

    // Register tab event subscription
    this._itemListKeyManager.tabPressed
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this.closePanel());

    // Register pre active change element
    this._itemListKeyManager.preActiveItemChanged
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._clearActiveItemState());

    // Register change element on manager subscription
    this._itemListKeyManager.activeItemChanged
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        this.panelOpen ? this._setActiveItemState() : this._selectActiveItem();
      });

    // Register keyboard events
    this._registerClosePanelKeyEvents();
    this._registerOpenPanelKeyEvents();
  }

  /**
   * Set the initial selection of the select component
   */
  private _initializeSelection(): void {
    // Defer setting the value in order to avoid the "Expression
    // has changed after it was checked" errors from Angular.
    Promise.resolve().then(() => {
      this._selectItemByValue(this.ngControl ? this.ngControl.value : this._value);
    });
  }

  /**
   * Event that emits when keydown is pressed while the panel is closed
   * @param event Keyboard eventhandler details
   */
  private _handleClosedPanelKeydown(event: KeyboardEvent): void {
    let keyCodeExists = this._closePanelKeyEventsMap.has(event.keyCode);
    if (keyCodeExists) {
      event.preventDefault();
      this._closePanelKeyEventsMap.get(event.keyCode)(event);
    }
  }

  /**
   * Event that emits when keydown is pressed while the panel is opened
   * @param event Keyboard event instance
   */
  private _handleOpenPanelKeydown(event: KeyboardEvent): void {
    let keyCodeExists = this._openPanelKeyEventsMap.has(event.keyCode);
    if (keyCodeExists) {
      event.preventDefault();
      this._openPanelKeyEventsMap.get(event.keyCode)(event);
    }
  }

  /**
   * Registers the keyboard events of the component while the panel is opened
   */
  private _registerOpenPanelKeyEvents(): void {
    this._openPanelKeyEventsMap.set(Key.Enter, this._selectActiveItem.bind(this));
    this._openPanelKeyEventsMap.set(Key.Space, this._selectActiveItem.bind(this));
    this._openPanelKeyEventsMap.set(Key.Tab, this.closePanel.bind(this));
    this._openPanelKeyEventsMap.set(Key.Escape, this.closePanel.bind(this));
    this._openPanelKeyEventsMap.set(Key.UpArrow, this._setActiveItemByVisibility.bind(this));
    this._openPanelKeyEventsMap.set(Key.DownArrow, this._setActiveItemByVisibility.bind(this));
  }

  /**
   * Registers the keyboard events of the component while the panel is closed
   */
  private _registerClosePanelKeyEvents(): void {
    this._closePanelKeyEventsMap.set(Key.Enter, this.openPanel.bind(this));
    this._closePanelKeyEventsMap.set(Key.Space, this.openPanel.bind(this));
    this._closePanelKeyEventsMap.set(Key.UpArrow, this._keymanagerKeyDown.bind(this));
    this._closePanelKeyEventsMap.set(Key.DownArrow, this._keymanagerKeyDown.bind(this));
    this._closePanelKeyEventsMap.set(Key.LeftArrow, this._keymanagerKeyDown.bind(this));
    this._closePanelKeyEventsMap.set(Key.RightArrow, this._keymanagerKeyDown.bind(this));
  }

  /**
   * Event that triggers when key is pressed
   *
   * `@Note` This is needed in order for the instace of this class
   * to be address on the bind(this), otherwise directly call to keymanager.onkeydown
   * will not work.
   * @param event Keyboard event instance
   */
  private _keymanagerKeyDown(event: KeyboardEvent): void {
    this._itemListKeyManager.onKeyDown(event);
  }

  /**
   * Select the active items while selecting using keyboard
   */
  private _selectActiveItem(): void {
    if (isNullOrEmpty(this._itemListKeyManager.activeItem)) { return; }
    triggerEvent(this._itemListKeyManager.activeItem.getTriggerElement(), 'click');
  }

  /**
   * Clears the currently active item status
   */
  private _clearActiveItemState(): void {
    if (isNullOrEmpty(this._itemListKeyManager.activeItem)) { return; }
    this._itemListKeyManager.activeItem.setInActiveState();
  }

  /**
   * Sets the active item state with scrolling down animation
   */
  private _setActiveItemState(): void {
    let activeItemDisplayed = !isNullOrEmpty(this._itemListKeyManager.activeItem) &&
      this._itemListKeyManager.activeItem.isVisible();
    if (!activeItemDisplayed) { return; }

    let activeElement = this._itemListKeyManager.activeItem.getHostElement();
    let elementsOffset = (activeElement.offsetHeight + SELECT_ITEM_OFFSET);

    let heightOffset = SELECT_PANEL_MAX_HEIGHT - (elementsOffset);
    this._scrollDispatcher.scrollToElement(activeElement, heightOffset);
    this._itemListKeyManager.activeItem.setActiveState();
  }

  /**
   * Sets the active item based on their visiblity flag
   * @param event Keyboard event instance
   */
  private _setActiveItemByVisibility(event: KeyboardEvent): void {
    let activeIndex = this._itemListKeyManager.activeItemIndex;
    let activeItem = this._itemListKeyManager.activeItem;
    activeIndex = !isNullOrEmpty(activeItem) && activeItem.isVisible() ? activeIndex : -1;

    let visibleRecords: SelectItemComponent[];
    if (event.keyCode === Key.UpArrow) {
      visibleRecords = this._itemListKeyManager.itemsArray
        .slice(0, activeIndex)
        .filter((item) => item.isVisible())
        .reverse();
    } else if (event.keyCode === Key.DownArrow) {
      visibleRecords = this._itemListKeyManager.itemsArray
        .slice(activeIndex + 1)
        .filter((item) => item.isVisible());
    }

    if (!isNullOrEmpty(visibleRecords)) {
      this._itemListKeyManager.setActiveItem(visibleRecords[0]);
    }
  }
}
