import {
  defer,
  merge,
  Observable,
  Subject
} from 'rxjs';
import {
  startWith,
  switchMap,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  Self,
  ViewEncapsulation
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  NgControl,
  NgForm
} from '@angular/forms';
import {
  McsFormFieldControlBase,
  McsItemListKeyManager,
  McsScrollDispatcherService,
  McsUniqueId
} from '@app/core';
import {
  animateFactory,
  coerceBoolean,
  coerceNumber,
  getSafeProperty,
  isNullOrEmpty,
  registerEvent,
  unregisterEvent,
  unsubscribeSafely,
  CommonDefinition,
  ErrorStateMatcher,
  KeyboardKey
} from '@app/utilities';

import {
  OptionComponent,
  OptionGroupComponent
} from '../option-group';
import { SelectSearchDirective } from './select-search.directive';
import { SelectTriggerLabelDirective } from './select-trigger-label.directive';

const SELECT_PANEL_MAX_HEIGHT = 400;
const SELECT_ITEM_OFFSET = 7;

@Component({
  selector: 'mcs-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: McsFormFieldControlBase, useExisting: SelectComponent },
  ],
  animations: [
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

  @ContentChild(SelectTriggerLabelDirective)
  public labelTemplate: SelectTriggerLabelDirective;

  /** @deprecated Use the formcontrols.valuechanges instead */
  @Output()
  public selectionChange = new EventEmitter<any>();

  @Input()
  public id: string = McsUniqueId.NewId('select');

  @Input()
  public placeholder: string;

  @Input()
  public errorStateMatcher: ErrorStateMatcher;

  @Input()
  public size: 'default' | 'small';

  @Input()
  public get optionViewCount(): number { return this._optionViewCount; }
  public set optionViewCount(value: number) {
    this._optionViewCount = coerceNumber(value);
  }
  private _optionViewCount: number = 0;

  @Input()
  public get useTags(): boolean { return this._useTags; }
  public set useTags(value: boolean) { this._useTags = coerceBoolean(value); }
  private _useTags: boolean;

  @Input()
  public get multiple(): boolean { return this._multiple; }
  public set multiple(value: boolean) { this._multiple = coerceBoolean(value); }
  private _multiple: boolean;

  @Input()
  public get disabled(): boolean {
    return this.ngControl ? this.ngControl.disabled : this._disabled;
  }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;

  @ContentChild(SelectSearchDirective)
  private _search: SelectSearchDirective;

  @ContentChildren(OptionComponent, { descendants: true })
  private _options: QueryList<OptionComponent>;

  @ContentChildren(OptionGroupComponent, { descendants: true })
  private _optionGroups: QueryList<OptionGroupComponent>;

  @Input()
  public get required(): boolean { return this._required; }
  public set required(value: boolean) { this._required = coerceBoolean(value); }
  private _required: boolean = false;

  @Input()
  public get tabindex(): number { return this._tabindex; }
  public set tabindex(value: number) { this._tabindex = coerceNumber(value); }
  private _tabindex: number = 0;

  @Input()
  public get multiSelectLimit(): number { return this._multiSelectLimit; }
  public set multiSelectLimit(value: number) { this._multiSelectLimit = coerceNumber(value); }
  private _multiSelectLimit: number = 0;

  /**
   * Base value implementation of value accessor
   */
  private _value: any;
  public get value(): any { return this._value; }

  @Input()
  public set value(value: any) {
    if (this._value !== value) {
      this._value = value;
      this._onChanged(this._value);
      this.selectionChange.emit(this._value);
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

  private _itemListKeyManager: McsItemListKeyManager<OptionComponent>;
  private _closePanelKeyEventsMap = new Map<KeyboardKey, (_event) => void>();
  private _openPanelKeyEventsMap = new Map<KeyboardKey, (_event) => void>();
  private _destroySubject = new Subject<void>();
  private _closeOutsideHandler = this._onCloseOutside.bind(this);
  private _optionViewHeightPx: string;

  public get carretDownIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_DOWN;
  }

  public get displayedText(): string {
    return getSafeProperty(this.selectedOptions,
      (obj) => obj[0].viewValue.toString()
    );
  }

  public get hasSelectedOptions(): boolean {
    return !isNullOrEmpty(this.displayedText);
  }

  public get selectedOptions(): OptionComponent[] {
    return this._options.filter((option) => option.selected);
  }

  public get optionViewHeightPx(): string {
    return this._optionViewHeightPx;
  }

  private readonly _optionsClickEvent: Observable<OptionComponent> = defer(() => {
    if (!isNullOrEmpty(this._options)) {
      return merge<OptionComponent>(...this._options.map((option) => option.clickChange));
    }
    return this._ngZone.onStable.asObservable().pipe(
      take(1),
      switchMap(() => this._optionsClickEvent)
    );
  });

  public constructor(
    private _ngZone: NgZone,
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
    this.size = 'default';
  }

  public ngAfterContentInit(): void {
    Promise.resolve().then(() => {
      registerEvent(document, 'click', this._closeOutsideHandler);
      this._initializeKeyboardManager();
      this._subscribeToSearchChanges();
      this._subscribeToOptionItemsChanges();
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
    unsubscribeSafely(this._destroySubject);
    this.stateChanges.complete();
  }

  /**
   * Event that emits when the host element received keydown
   * @param _event Keyboard event details
   */
  public onKeyDown(_event: KeyboardEvent) {
    if (this.disabled) { return; }
    this.panelOpen ?
      this._handleOpenPanelKeydown(_event) :
      this._handleClosedPanelKeydown(_event);
  }

  /**
   * Opens the panel of the select
   */
  public openPanel() {
    if (this._options.length <= 0) { return; }
    this.panelOpen = true;
  }

  /**
   * Closes the panel of the select
   */
  public closePanel() {
    if (!isNullOrEmpty(this._options) && !this.panelOpen) { return; }
    this._clearActiveOptionsState();
    this._closeInActiveOptionPanels();

    if (!isNullOrEmpty(this.selectedOptions)) {
      this._itemListKeyManager.setActiveItem(this.selectedOptions[0]);
    }
    this.panelOpen = false;
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
    Promise.resolve().then(() => this.focused = false);
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
    if (!isNullOrEmpty(this._options)) {
      // We need to re-initialized the previous state of the select dropdown
      // in case the dropdown is required since the select dropdown should
      // consider the first item selected
      isNullOrEmpty(value) ?
        this._initializeSelection() :
        this._selectOptionByValue(value);
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

  /**
   * Deselects the option
   * @param option Option to be unselected
   */
  public deselectOption(option: OptionComponent): void {
    if (isNullOrEmpty(option)) { return; }
    this._selectOption(option);
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
  private _onCloseOutside(_event: any): void {
    if (this._elementRef.nativeElement.contains(_event.target)) { return; }
    this.closePanel();
  }

  /**
   * Selects the item provided by the parameter
   * @param option Item to be selected
   */
  private _selectOption(option: OptionComponent): void {
    // Clear the selection including the value in case the item is null
    // to make way with the changes when formControl.reset() was called
    if (isNullOrEmpty(option)) {
      this._resetSelection();
      return;
    }

    // Select the actual option item
    this.multiple ?
      this._selectMultipleOptions(option) :
      this._selectSingleOption(option);
  }

  /**
   * Resets all the selection
   */
  private _resetSelection(): void {
    this._clearOptionsSelection();
    this.value = undefined;
    this.stateChanges.next();
  }

  /**
   * Selects multiple options and the panel will remain open
   * @param options Items to be selected
   */
  private _selectMultipleOptions(...options: OptionComponent[]): void {
    if (isNullOrEmpty(options)) { return; }

    options.forEach((item) => {
        this._checkMultiSelectOptionLimit(item);
    });
  }

  /**
   * Checks whether the multiselect dropdown has reached its limit
   * @param option Item to checked
   */
  private _checkMultiSelectOptionLimit(option: OptionComponent): void {
    let isBelowSelectionLimit = this.selectedOptions.length < this.multiSelectLimit || this.multiSelectLimit === 0;

    if (isBelowSelectionLimit) {
      option.toggle();
      this.value = this.selectedOptions && this.selectedOptions.map((selectedOption) => selectedOption.value);
      this._disableNotSelectedOptions();
      this.stateChanges.next();
    }  else {
      if (option.selected === true) {
        this._removeFromSelectedOptions(option);
      }
    }
  }

  /**
   * Disable other options that are not selected on the multi select dropdown when limit was reached
   */
  private _disableNotSelectedOptions(): void {
    if (this.selectedOptions.length === this.multiSelectLimit) {
      this._options.forEach((_option) => {
        _option.disabled = (this.selectedOptions.find((selectedOption) => selectedOption.value === _option.value)) ?
        false : true;
      });
    }
  }

  /**
   * Removes an option from the list of options selected
   * @param option Item to be removed
   */
  private _removeFromSelectedOptions(option: OptionComponent): void {
    let optionToRemove = this.selectedOptions.find((selectedOption) => selectedOption.value === option.value);
    if (!isNullOrEmpty(optionToRemove)) {
      let optionIndex = this.selectedOptions.indexOf(optionToRemove);
      if (optionIndex > -1) {
        this.selectedOptions.splice(optionIndex);
      }
      option.toggle();
      this._enableAllOptions();
      this.stateChanges.next();
    }
  }

  /**
   * Enable multiselect options
   */
  private _enableAllOptions(): void {
    this._options.forEach((_option) => {
      _option.disabled = false;
    });
  }
  /**
   * Selects on single entity and always close the panel
   * @param option Item to be selected
   */
  private _selectSingleOption(option: OptionComponent): void {
    if (isNullOrEmpty(option)) { return; }

    this._clearOptionsSelection();
    option.select();
    this.value = option.value;
    this.stateChanges.next();
    this.closePanel();
  }

  /**
   * Selects the element based on the provided value
   * @param value Value to be checked in the item options
   */
  private _selectOptionByValue(value: any) {
    let selectedItem = this._options.find((item) => item.value === value);
    this._selectOption(selectedItem);
  }

  /**
   * Clears the item selection model
   */
  private _clearOptionsSelection(): void {
    this.selectedOptions.forEach((selectedOption) => selectedOption.deselect());
  }

  /**
   * Initializes the instance of keyboard manager
   */
  private _initializeKeyboardManager(): void {
    this._itemListKeyManager = new McsItemListKeyManager(this._options);

    // Register tab event subscription
    this._itemListKeyManager.tabPressed
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        this.closePanel();
        this.focus();
      });

    // Register pre active change element
    this._itemListKeyManager.preActiveItemChanged
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._clearActiveOptionsState());

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
    Promise.resolve().then(() => {
      if (this.multiple) {
        if (!isNullOrEmpty(this.selectedOptions)) {
          this.value = this.selectedOptions && this.selectedOptions.map((selectedOption) => selectedOption.value);
          this.stateChanges.next();
        }
        return;
      }

      let selectedValue = getSafeProperty(this.ngControl, (obj) => obj.value) || this._value;
      let isFirstItemSelected = this.required && !isNullOrEmpty(this._options)
        && !this._options.find((option) => option.value === selectedValue);

      isFirstItemSelected ?
        this._selectOption(this._options.first) :
        this._selectOptionByValue(this.ngControl ? this.ngControl.value : this._value);

      let associatedControl = getSafeProperty(this.ngControl, (obj) => obj.control);
      if (!isNullOrEmpty(associatedControl)) {
        associatedControl.markAsPristine();
      }
    });
  }

  /**
   * Event that emits when keydown is pressed while the panel is closed
   * @param event Keyboard eventhandler details
   */
  private _handleClosedPanelKeydown(event: KeyboardEvent): void {
    let keyCodeExists = this._closePanelKeyEventsMap.has(event.keyboardKey());
    if (keyCodeExists) {
      event.preventDefault();
      this._closePanelKeyEventsMap.get(event.keyboardKey())(event);
    }
  }

  /**
   * Event that emits when keydown is pressed while the panel is opened
   * @param event Keyboard event instance
   */
  private _handleOpenPanelKeydown(event: KeyboardEvent): void {
    let keyCodeExists = this._openPanelKeyEventsMap.has(event.keyboardKey());
    if (keyCodeExists) {
      event.preventDefault();
      this._openPanelKeyEventsMap.get(event.keyboardKey())(event);
    }
  }

  /**
   * Registers the keyboard events of the component while the panel is opened
   */
  private _registerOpenPanelKeyEvents(): void {
    this._openPanelKeyEventsMap.set(KeyboardKey.Enter, this._selectActiveItem.bind(this));
    this._openPanelKeyEventsMap.set(KeyboardKey.Space, this._selectActiveItem.bind(this));
    this._openPanelKeyEventsMap.set(KeyboardKey.Escape, this.closePanel.bind(this));
    this._openPanelKeyEventsMap.set(KeyboardKey.Tab, this._keymanagerKeyDown.bind(this));
    this._openPanelKeyEventsMap.set(KeyboardKey.UpArrow, this._setActiveItemByVisibility.bind(this));
    this._openPanelKeyEventsMap.set(KeyboardKey.DownArrow, this._setActiveItemByVisibility.bind(this));
  }

  /**
   * Registers the keyboard events of the component while the panel is closed
   */
  private _registerClosePanelKeyEvents(): void {
    this._closePanelKeyEventsMap.set(KeyboardKey.Enter, this.openPanel.bind(this));
    this._closePanelKeyEventsMap.set(KeyboardKey.Space, this.openPanel.bind(this));
    this._closePanelKeyEventsMap.set(KeyboardKey.UpArrow, this._keymanagerKeyDown.bind(this));
    this._closePanelKeyEventsMap.set(KeyboardKey.DownArrow, this._keymanagerKeyDown.bind(this));
    this._closePanelKeyEventsMap.set(KeyboardKey.LeftArrow, this._keymanagerKeyDown.bind(this));
    this._closePanelKeyEventsMap.set(KeyboardKey.RightArrow, this._keymanagerKeyDown.bind(this));
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
    this._selectOption(this._itemListKeyManager.activeItem);
  }

  /**
   * Clears the currently active item status
   */
  private _clearActiveOptionsState(): void {
    if (isNullOrEmpty(this._itemListKeyManager.activeItem)) { return; }
    this._itemListKeyManager.activeItem.setInActiveState();
  }

  /**
   * Close all the inactive group panel options
   */
  private _closeInActiveOptionPanels(): void {
    this._optionGroups.forEach((optionGroup) => {
      if (!optionGroup.hasSelectedOption) {
        optionGroup.closePanel();
      }
    });
  }

  /**
   * Sets the active item state with scrolling down animation
   */
  private _setActiveItemState(): void {
    let activeItemDisplayed = !isNullOrEmpty(this._itemListKeyManager.activeItem);
    if (!activeItemDisplayed) { return; }

    let activeElement = this._itemListKeyManager.activeItem.hostElement;
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

    let visibleRecords: OptionComponent[];
    if (event.keyboardKey() === KeyboardKey.UpArrow) {
      visibleRecords = this._itemListKeyManager.itemsArray
        .slice(0, activeIndex)
        .filter((item) => item.isVisible())
        .reverse();
    } else if (event.keyboardKey() === KeyboardKey.DownArrow) {
      visibleRecords = this._itemListKeyManager.itemsArray
        .slice(activeIndex + 1)
        .filter((item) => item.isVisible());
    }

    if (!isNullOrEmpty(visibleRecords)) {
      this._itemListKeyManager.setActiveItem(visibleRecords[0]);
    }
  }

  /**
   * Subscribes to search changes
   */
  private _subscribeToSearchChanges(): void {
    if (isNullOrEmpty(this._search)) { return; }

    this._search.searchChange().pipe(
      takeUntil(this._destroySubject),
      tap((keyword) => {
        this._options.forEach((option) => {
          let optionText = getSafeProperty(option, (obj) => obj.viewValue.toLocaleLowerCase());
          optionText.includes(keyword && keyword.toLocaleLowerCase()) ? option.show() : option.hide();
        });
      })
    ).subscribe();
  }

  /**
   * Subscrbies to option item changes
   */
  private _subscribeToOptionItemsChanges(): void {
    this._options.changes.pipe(
      startWith(null as any),
      takeUntil(this._destroySubject)
    ).subscribe(() => {
      this._enableMultipleSelection();
      this._subscribeToClickEvent();
      this._initializeSelection();
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Subscrbies to click event of an option
   */
  private _subscribeToClickEvent(): void {
    let resetSubject = merge(this._options.changes, this._destroySubject);
    this._optionsClickEvent.pipe(
      takeUntil(resetSubject)
    ).subscribe((option) => this._selectOption(option));
  }

  /**
   * Enable multiple selection on all options
   */
  private _enableMultipleSelection(): void {
    if (!this.multiple) { return; }
    this._options.forEach((option) => option.showCheckbox());
  }
}
