import { Subject } from 'rxjs/Rx';
import { isNullOrEmpty } from '../../utilities';

export class McsSelection<T> {
  /**
   * List of selected element based on the given ID
   */
  private _selected: Set<T>;
  public get selected(): T[] {
    return !isNullOrEmpty(this._selected) ? Array.from(this._selected.values()) : undefined;
  }

  /**
   * Stream that will notify when selection changed
   */
  private _selectionChangedStream: Subject<T[]>;
  public get selectionChangedStream(): Subject<T[]> {
    return this._selectionChangedStream;
  }
  public set selectionChangedStream(value: Subject<T[]>) {
    this._selectionChangedStream = value;
  }

  constructor(private _isMultiple = false) {
    this._selected = new Set<T>();
    this._selectionChangedStream = new Subject<T[]>();
  }

  /**
   * Return true if the given entity is selected othwerwise false
   * @param value Value of the entity to check
   */
  public isSelected(value: T): boolean {
    return this._selected.has(value);
  }

  /**
   * Select the given record and add it this to the list of selection
   * @param value Value of the entity to select
   */
  public select(value: T): void {
    if (this.isSelected(value)) { return; }
    if (!this._isMultiple) {
      this._selected.clear();
    }

    this._selected.add(value);
    this._emitChanges();
  }

  /**
   * Remove the selected entity from the list
   * @param value Value of the entity to deselect
   */
  public deselect(value: T): void {
    if (!this.isSelected(value)) { return; }

    this._selected.delete(value);
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
    if (isNullOrEmpty(this.selected)) { return; }
    this.selectionChangedStream.next(this.selected);
  }
}
