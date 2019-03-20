import { QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { isNullOrEmpty } from '@app/utilities';

export abstract class McsItemListManager<T> {

  public activeItemChanged: Subject<T> = new Subject();
  public preActiveItemChanged: Subject<T> = new Subject();

  /**
   * Returns all the array of the querylist provided
   */
  public get itemsArray(): T[] { return this._items.toArray(); }

  /**
   * Returns the currently active item
   */
  public get activeItem(): T { return this._activeItem; }
  private _activeItem: T;

  /**
   * Returns the previously active item
   */
  public get previouslyActiveItem(): T { return this._previouslyActiveItem; }
  private _previouslyActiveItem: T;

  /**
   * Returns the currently active index
   */
  public get activeItemIndex(): number { return this._activeItemIndex; }
  private _activeItemIndex: number = -1;

  constructor(protected _items: QueryList<T>) {
    this._listenToItemsChanged();
  }

  /**
   * Sets the item as active
   * @param item Item to be set as active
   */
  public setActiveItem(item: T): void {
    if (isNullOrEmpty(item)) { return; }

    // Notify Pre active changed event
    this._previouslyActiveItem = this.itemsArray[this._activeItemIndex];
    this.preActiveItemChanged.next(this._previouslyActiveItem);

    // Set the active item and item index
    this._activeItemIndex = this.itemsArray.indexOf(item);
    this._activeItem = this.itemsArray[this._activeItemIndex];
    this.activeItemChanged.next(this._activeItem);
  }

  /**
   * Sets the item based on its index in the array
   * @param index Index in the array to be selected
   */
  public setActiveItemByIndex(index: number): void {
    let indexIsInRanged: boolean;
    indexIsInRanged = index >= 0 && index < this.itemsArray.length;
    if (!indexIsInRanged) { return; }
    this.setActiveItem(this.itemsArray[index]);
  }

  /**
   * Sets the next item to be active
   */
  public setNextItemActive(): void {
    let nextIndex = Math.min(this.itemsArray.length - 1, this._activeItemIndex + 1);
    this.setActiveItemByIndex(nextIndex);
  }

  /**
   * Sets the previous item to be active
   */
  public setPreviousItemActive(): void {
    let previousIndex = Math.max(0, this._activeItemIndex - 1);
    this.setActiveItemByIndex(previousIndex);
  }

  /**
   * Sets the first item to be active
   */
  public setFirstItemActive(): void {
    this.setActiveItemByIndex(0);
  }

  /**
   * Sets the last item to be active
   */
  public setLastItemActive(): void {
    let lastIndex = Math.max(0, this.itemsArray.length - 1);
    this.setActiveItemByIndex(lastIndex);
  }

  /**
   * Clears the active item
   */
  public clearActiveItem(): void {
    if (isNullOrEmpty(this.activeItem)) { return; }
    this._activeItem = undefined;
    this._activeItemIndex = -1;
  }

  /**
   * Listen to each item changes to update the indexing
   */
  private _listenToItemsChanged(): void {
    this._items.changes.subscribe((newItems: QueryList<T>) => {
      if (this._activeItem) {
        let itemArray = newItems.toArray();
        let newIndex = itemArray.indexOf(this._activeItem);

        let newItemSelected = newIndex > -1 && newIndex !== this._activeItemIndex;
        if (newItemSelected) {
          this._activeItemIndex = newIndex;
        }
      }
    });
  }
}
