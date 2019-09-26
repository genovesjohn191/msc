import {
  Component,
  QueryList,
  ViewChild,
  ContentChildren,
  AfterContentInit,
  AfterViewInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  Observable,
  merge,
  Subject
} from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { Search } from '@app/shared';
import {
  McsSelection,
  McsOption,
} from '@app/models';

// Child Items of the select tag
import { SelectTagMainItemComponent } from './select-tag-main-item/select-tag-main-item.component';
import { SelectTagSubItemComponent } from './select-tag-sub-item/select-tag-sub-item.component';
import { SelectTagSubItemPlaceholderDirective } from './select-tag-sub-item-placeholder.directive';

@Component({
  selector: 'mcs-select-tag',
  templateUrl: './select-tag.component.html',
  styleUrls: ['./select-tag.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'select-tag-wrapper'
  }
})

export class SelectTagComponent implements AfterViewInit, AfterContentInit, OnDestroy {

  @Output()
  public selectionChanged: EventEmitter<McsOption[]>;

  @ViewChild(SelectTagSubItemPlaceholderDirective, { static: false })
  private _subItemsPlaceholder: SelectTagSubItemPlaceholderDirective;

  @ViewChild('search', { static: false })
  private _search: Search;

  @ContentChildren(SelectTagMainItemComponent)
  private _mainItems: QueryList<SelectTagMainItemComponent>;

  @ContentChildren(SelectTagSubItemComponent, { descendants: true })
  private _subItems: QueryList<SelectTagSubItemComponent>;

  /** Subscriptions */
  private _destroySubject = new Subject<void>();

  /**
   * The instance of the selected main item
   */
  private _selectedMainItem: SelectTagMainItemComponent;
  public get selectedMainItem(): SelectTagMainItemComponent {
    return this._selectedMainItem;
  }
  public set selectedMainItem(value: SelectTagMainItemComponent) {
    if (this._selectedMainItem !== value) {
      this._selectedMainItem = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Selection model that holds all the selected sub elements/items
   */
  private _selectionSubModel: McsSelection<SelectTagSubItemComponent>;
  public get selectionSubModel(): McsSelection<SelectTagSubItemComponent> {
    return this._selectionSubModel;
  }

  public get toggleIconKey(): string {
    return CommonDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.selectionChanged = new EventEmitter<McsOption[]>();
    this._selectionSubModel = new McsSelection<SelectTagSubItemComponent>(true);
  }

  public ngAfterViewInit() {
    this._search.searchChangedStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        this._redisplaySubItems();
        this._search.showLoading(false);
      });
  }

  public ngAfterContentInit() {
    Promise.resolve().then(() => {
      // Listener when user selects the main item
      this._mainItems.changes
        .pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this._listenToMainSelectionChange());

      // Listener when user selects the sub item
      this._subItems.changes
        .pipe(startWith(null), takeUntil(this._destroySubject))
        .subscribe(() => this._listenToSubSelectionChange());
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Event that emits when selection is made on the main item
   */
  public get itemsMainSelectionChanged(): Observable<SelectTagMainItemComponent> {
    return merge(...this._mainItems.map((item) => item.selectionChanged));
  }

  /**
   * Event that emits when selection is made on the sub item
   */
  public get itemsSubSelectionChanged(): Observable<SelectTagSubItemComponent> {
    return merge(...this._subItems.map((item) => item.selectionChanged));
  }

  /**
   * Remove the sub item on the selection model
   * @param subItem Sub item to remove
   */
  public removeSubSelection(subItem: SelectTagSubItemComponent): void {
    if (isNullOrEmpty(subItem)) { return; }
    subItem.selected = false;
    this._selectionSubModel.deselect(subItem);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Toggle the sub item on the selection model
   * @param subItem Sub item to toggle
   */
  public toggleSubSelection(subItem: SelectTagSubItemComponent): void {
    if (isNullOrEmpty(subItem)) { return; }
    subItem.selected ? this._selectionSubModel.select(subItem) :
      this._selectionSubModel.deselect(subItem);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listener to main item selection change
   */
  private _listenToMainSelectionChange(): void {
    let resetSubject = merge(this._mainItems.changes, this._destroySubject);
    this.itemsMainSelectionChanged
      .pipe(takeUntil(resetSubject))
      .subscribe((item) => this._selectMainItem(item));
  }

  /**
   * Listener to sub item selection change
   */
  private _listenToSubSelectionChange(): void {
    let resetSubject = merge(this._subItems.changes, this._destroySubject);
    this.itemsSubSelectionChanged
      .pipe(takeUntil(resetSubject))
      .subscribe((item) => {
        this.toggleSubSelection(item);
        this._emitSubItemsSelectionChanged();
      });
  }

  /**
   * Emits the sub items selection changed
   *
   * `@Note:` This will emits the value of the sub item, otherwise
   * it will emit the text
   */
  private _emitSubItemsSelectionChanged(): void {
    // Notify changes for every selection made
    let selectedSubItems = new Array<McsOption>();
    selectedSubItems = this._selectionSubModel.selected
      .map((selectedItem) => {
        return { text: selectedItem.text, value: selectedItem.value } as McsOption;
      });
    this.selectionChanged.emit(selectedSubItems);
  }

  /**
   * Select the main item
   * @param item Item to be select
   */
  private _selectMainItem(item: SelectTagMainItemComponent) {
    if (isNullOrEmpty(item)) { return; }
    this._clearMainItemSelection(item);
    item.select();
    this.selectedMainItem = item;

    // Clear the view containers and redisplay the sub items
    this._recreateSubItems();
  }

  /**
   * Clear the main items selection to reset
   * @param selectedItem Selected item to clear
   */
  private _clearMainItemSelection(selectedItem: SelectTagMainItemComponent): void {
    this._mainItems.forEach((item) => {
      if (item.id !== selectedItem.id) {
        item.deselect();
      }
    });
  }

  /**
   * This will recreate the whole sub items based on the selected main item
   */
  private _recreateSubItems(): void {
    if (isNullOrEmpty(this._subItemsPlaceholder) ||
      isNullOrEmpty(this.selectedMainItem)) { return; }

    this._subItemsPlaceholder.viewContainer.clear();
    this.selectedMainItem.subItems.map((item) => {
      this._subItemsPlaceholder.viewContainer
        .createEmbeddedView(item.templateRef);
    });
    this._redisplaySubItems();
  }

  /**
   * This will redisplay the sub items based on the search keyword (filter)
   */
  private _redisplaySubItems(): void {
    if (isNullOrEmpty(this._subItemsPlaceholder) ||
      isNullOrEmpty(this.selectedMainItem)) { return; }

    this.selectedMainItem.subItems.map((item) => {
      if (isNullOrEmpty(this._search.keyword)) {
        item.show();
      } else {
        let searchFound = item.searchKey.toLowerCase().includes(this._search.keyword.toLowerCase());
        searchFound ? item.show() : item.hide();
      }
      item.markForCheck();
    });
    this._changeDetectorRef.markForCheck();
  }
}
