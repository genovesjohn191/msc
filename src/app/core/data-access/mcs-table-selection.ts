import { Observable } from 'rxjs';
import {
  McsSelection,
  McsSelectionChange
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';
import { McsTableDataSource } from './mcs-table-datasource';

export class McsTableSelection<T> {
  private _selectionModel: McsSelection<T>;
  private _dataSource: McsTableDataSource<T>;

  constructor(dataSource: McsTableDataSource<T>, isMultiple: boolean = true) {
    this._dataSource = dataSource;
    this._selectionModel = new McsSelection(isMultiple);
    this._validateDatasource();
  }

  /**
   * Event that emits when the data has been changed
   */
  public dataSelectionChange(): Observable<McsSelectionChange<T>> {
    return this._selectionModel.change.asObservable();
  }

  /**
   * Clears all the selection
   */
  public clearAllSelection(): void {
    this._selectionModel.clear();
  }

  /**
   * Selects the item
   * @param item Item to be selected
   */
  public selectItem(item: T): void {
    this._selectionModel.select(item);
  }

  /**
   * Deselects the item
   * @param item Item to be deselected
   */
  public deselectItem(item: T): void {
    this._selectionModel.select(item);
  }

  /**
   * Toggles the item selection
   * @param item Item to be selected/deselected
   */
  public toggleItemSelection(item: T): void {
    this._selectionModel.toggle(item);
  }

  /**
   * Returns true when the item is selected
   * @param item Item to be checked
   */
  public isItemSelected(item: T): boolean {
    return this._selectionModel.isSelected(item);
  }

  /**
   * Gets all the selected items
   */
  public getSelectedItems(): T[] {
    return this._selectionModel.selected;
  }

  /**
   * Returns true when all of the items are selected
   */
  public allItemsAreSelected(predicate?: (item: T) => boolean): boolean {
    if (isNullOrEmpty(this._dataSource.dataRecords)) { return false; }
    return !isNullOrEmpty(predicate) ?
      this._dataSource.dataRecords.filter(predicate).length === this._selectionModel.selected.length :
      this._dataSource.dataRecords.length === this._selectionModel.selected.length;
  }

  /**
   * Returns true when some of the items are selected
   */
  public someItemsAreSelected(): boolean {
    if (isNullOrEmpty(this._dataSource.dataRecords)) { return false; }
    return this._selectionModel.hasValue() &&
      this._dataSource.dataRecords.length !== this._selectionModel.selected.length;
  }

  /**
   * Toggle all items selection
   * @param predicate Predicate that will judge if the item should be selectable
   */
  public toggleAllItemsSelection(predicate?: (item: T) => boolean): void {
    if (this.allItemsAreSelected(predicate)) {
      this._selectionModel.clear();
      return;
    }

    this._dataSource.dataRecords.forEach((record) => {
      if (isNullOrEmpty(predicate) || predicate(record)) {
        this._selectionModel.select(record);
      }
    });
  }

  /**
   * Validates datasource if it has value, otherwise an error will be thrown
   */
  private _validateDatasource(): void {
    if (isNullOrEmpty(this._dataSource)) {
      throw new Error(`Datasource for table selection must not be empty.`);
    }
  }
}
