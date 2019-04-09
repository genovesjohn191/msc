import { Subject } from 'rxjs';
import { isNullOrEmpty } from '@app/utilities';
import { McsSelectionChange } from './mcs-selection-change';

export class McsSelection<T> {

  public change: Subject<McsSelectionChange<T>> = new Subject();

  /**
   * List of selected element based on the given ID
   */
  private _selected: Set<T> = new Set<T>();
  public get selected(): T[] {
    return !isNullOrEmpty(this._selected) ? Array.from(this._selected.values()) : undefined;
  }

  private _newSelectedItems: T[] = [];
  private _deselectedItems: T[] = [];

  constructor(private _isMultiple = false) { }

  /**
   * Return true if the given entity is selected othwerwise false
   * @param value Value of the entity to check
   */
  public isSelected(value: T): boolean {
    return this._selected.has(value);
  }

  /**
   * Select the given record and add it to the list of selection
   * @param value Value of the entity to select
   */
  public select(...values: T[]): void {
    values.forEach((value) => this._selectItem(value));
    this._emitChanges();
  }

  /**
   * Remove the selected entity from the list
   * @param value Value of the entity to deselect
   */
  public deselect(...values: T[]): void {
    values.forEach((value) => this._deselectItem(value));
    this._emitChanges();
  }

  /**
   * Toggle the entity selected
   * @param value Value to of the entity to be toggled
   */
  public toggle(value: T): void {
    this.isSelected(value) ? this.deselect(value) : this.select(value);
  }

  /**
   * Return true when there is an entity selected othwerise false
   */
  public hasValue(): boolean {
    return this._selected.size > 0;
  }

  /**
   * Clear the selected entities
   */
  public clear(): void {
    this._selected.clear();
    this._emitChanges();
  }

  /**
   * Notify the changes for the selectionChanged subscribers
   */
  private _emitChanges(): void {
    this.change.next({
      source: this,
      added: this._newSelectedItems,
      removed: this._deselectedItems
    });
    this._newSelectedItems = [];
    this._deselectedItems = [];
  }

  private _selectItem(value: T): void {
    if (this.isSelected(value)) { return; }
    if (!this._isMultiple) {
      this._selected.clear();
    }

    this._selected.add(value);
    this._newSelectedItems.push(value);
  }

  private _deselectItem(value: T) {
    if (!this.isSelected(value)) { return; }
    this._selected.delete(value);
    this._deselectedItems.push(value);
  }
}
