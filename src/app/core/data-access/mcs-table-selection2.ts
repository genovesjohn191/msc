import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  McsSelection,
  McsSelectionChange
} from '@app/models';
import { isNullOrEmpty } from '@app/utilities';

import { McsTableDataSource2 } from './mcs-table-datasource2';

export class McsTableSelection2<TEntity> {
  private _selectionModel: McsSelection<TEntity>;
  private _dataSource: McsTableDataSource2<TEntity>;
  private _dataRecords: TEntity[];

  constructor(dataSource: McsTableDataSource2<TEntity>, isMultiple: boolean = true) {
    this._dataRecords = [];
    this._dataSource = dataSource;
    this._selectionModel = new McsSelection(isMultiple);
    this._validateDatasource();
    this._subscribeToDatasource();
  }

  public dataSelectionChange(): Observable<McsSelectionChange<TEntity>> {
    return this._selectionModel.change.asObservable();
  }

  public clearAllSelection(): void {
    this._selectionModel.clear();
  }

  public selectItem(item: TEntity): void {
    this._selectionModel.select(item);
  }

  public deselectItem(item: TEntity): void {
    this._selectionModel.select(item);
  }

  public toggleItemSelection(item: TEntity): void {
    this._selectionModel.toggle(item);
  }

  public isItemSelected(item: TEntity): boolean {
    return this._selectionModel.isSelected(item);
  }

  public getSelectedItems(): TEntity[] {
    return this._selectionModel.selected;
  }

  public allItemsAreSelected(predicate?: (item: TEntity) => boolean): boolean {
    if (isNullOrEmpty(this._dataRecords)) { return false; }

    return !isNullOrEmpty(predicate) ?
    this._dataRecords.filter(predicate).length === this._selectionModel.selected.length :
    this._dataRecords.length === this._selectionModel.selected.length;
  }

  public someItemsAreSelected(): boolean {
    if (isNullOrEmpty(this._dataRecords)) { return false; }

    return this._selectionModel.hasValue() &&
    this._dataRecords.length !== this._selectionModel.selected.length;
  }

  public hasSelecion(): boolean {
    if (isNullOrEmpty(this._dataRecords)) { return false; }
    return this._selectionModel.hasValue();
  }

  public toggleAllItemsSelection(predicate?: (item: TEntity) => boolean): void {
    if (this.allItemsAreSelected(predicate)) {
      this._selectionModel.clear();
      return;
    }

    this._dataRecords.forEach((record) => {
      if (isNullOrEmpty(predicate) || predicate(record)) {
        this._selectionModel.select(record);
      }
    });
  }

  private _validateDatasource(): void {
    if (isNullOrEmpty(this._dataSource)) {
      throw new Error(`Datasource for table selection must not be empty.`);
    }
  }

  private _subscribeToDatasource(): void {
    this._dataSource.dataRecords$.pipe(
      tap(records => this._dataRecords = records || [])
    ).subscribe();
  }
}
