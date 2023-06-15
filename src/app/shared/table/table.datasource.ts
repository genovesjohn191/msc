import {
  isObservable,
  of,
  BehaviorSubject,
  Observable
} from 'rxjs';

import { DataStatus } from '@app/models';
import { McsDataSource } from '@app/utilities';

type DatasourceType<T> = T[] | Observable<T[]>;

export class TableDataSource<T> implements McsDataSource<T> {
  private _dataSource: Observable<T[]>;
  private _dataStatusChange = new BehaviorSubject<DataStatus>(null);

  constructor(dataSource: DatasourceType<T>) {
    this._setDatasourceInstanceByType(dataSource);
  }

  public refreshDataRecords(): void {
    // Noop
  }

  /**
   * Connects the table to the datasource instance
   */
  public connect(): Observable<T[]> {
    return this._dataSource;
  }

  /**
   * Disconnects the datasource
   */
  public disconnect(): void {
    // Release resources
  }

  public isSearching(): boolean {
    return false;
  }

  /**
   * Event that emits when the data status has been changed
   */
  public dataStatusChange(): Observable<DataStatus> {
    return this._dataStatusChange.asObservable();
  }

  /**
   * Method that gets emitted when the job was done by the datasource
   */
  public onCompletion(): void {
    this._dataStatusChange.next(DataStatus.Success);
  }

  /**
   * Sets the datasrouce instance by type
   * @param dataSource Datasource to be set
   */
  private _setDatasourceInstanceByType(dataSource: DatasourceType<T>): void {
    this._dataSource = isObservable(dataSource) ?
      dataSource : of(dataSource);
  }
}
