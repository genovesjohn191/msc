import {
  of,
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject
} from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  startWith,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';

import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { DataStatus } from '@app/models';

import {
  cloneObject,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely
} from '../../functions/mcs-object.function';
import { containsString } from '../../functions/mcs-string.function';
import { McsSearch } from '../../interfaces/mcs-search';
import { TreeItem } from './tree-item';

type DeleteTreeSource<TValue> = () => Observable<TreeItem<TValue>[]>;
type DatasourceTreeType<TValue> = Observable<TreeItem<TValue>[]> | DeleteTreeSource<TValue>;

export class TreeDatasource<TValue> extends DataSource<TreeItem<TValue>> {
  private _datasourceFuncPointer: DeleteTreeSource<TValue>

  private _search: McsSearch;
  private _searchPredicate: (item: TValue, keyword: string) => boolean;

  private _searchSubject = new Subject<void>();
  private _dataRecordsChange = new BehaviorSubject<TreeItem<TValue>[]>(null);
  private _requestUpdate = new Subject<void>();
  private _destroySubject = new Subject<void>();
  private _dataStatusChange = new BehaviorSubject<DataStatus>(null);

  constructor(dataSource?: DatasourceTreeType<TValue>) {
    super();
    this._updateDatasourceFn(dataSource);
    this._subscribeToRequestChange();
  }

  public connect(_collectionViewer: CollectionViewer): Observable<TreeItem<TValue>[]> {
    return this._dataRecordsChange.asObservable().pipe(
      filter((records) => records !== null)
    );
  }

  public disconnect(_collectionViewer: CollectionViewer): void {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._searchSubject);
    unsubscribeSafely(this._dataStatusChange);
  }

  public dataStatusChange(): Observable<DataStatus> {
    return this._dataStatusChange.asObservable();
  }

  public updateDatasource(dataSource: DatasourceTreeType<TValue>): void {
    this._updateDatasourceFn(dataSource);
    this._subscribeToRequestChange();
  }

  public getHierarchyTextByValue(value: TValue): string {
    if (isNullOrEmpty(value)) { return ''; }

    let dataRecords = this._dataRecordsChange.getValue();
    if (isNullOrEmpty(dataRecords)) { return ''; }

    let deepSearchFunc = (items: TreeItem<TValue>[], valueToSearch: TValue) => {
      let textItems = new Array<string>();

      for (let item of items || []) {
        if (item.children?.length > 0) {
          let childText = deepSearchFunc(item.children, valueToSearch);

          if (!isNullOrEmpty(childText)) {
            textItems.push(item.text);
            textItems.push(...childText);
          }
        }

        if (item.value === valueToSearch) {
          textItems.push(item.text);
        }
      }
      return textItems;
    };
    return deepSearchFunc(dataRecords, value)?.join(' - ');
  }

  public registerSearchPredicate(
    predicate: (item: TValue, keyword: string) => boolean
  ): TreeDatasource<TValue> {
    this._searchPredicate = predicate;
    return this;
  }

  public registerSearch(search: McsSearch): TreeDatasource<TValue> {
    this._search = search;
    this._subscribeToSearching();
    return this;
  }

  private _updateDatasourceFn(dataSource: DatasourceTreeType<TValue>): void {
    let datasourceIsPredicate = typeof dataSource === 'function';
    this._datasourceFuncPointer = datasourceIsPredicate ? dataSource as any :
      this._convertDatasourceToObservable.bind(this, dataSource);
  }

  private _convertDatasourceToObservable(
    dataSource: DatasourceTreeType<TValue>
  ): Observable<TreeItem<TValue>[]> {
    if (isNullOrUndefined(dataSource)) { return of(null); }

    if (dataSource instanceof Observable) {
      return dataSource;
    }
    throw new Error('Unknown datasource type for DataRecordsSearch');
  }

  private _subscribeToRequestChange(): void {
    let initialRequest = true;

    this._requestUpdate.pipe(
      startWith([null]),
      takeUntil(this._destroySubject),
      switchMap(() => {
        if (isNullOrUndefined(this._datasourceFuncPointer)) { return of(null); }
        this._dataStatusChange.next(DataStatus.Active);

        return this._datasourceFuncPointer().pipe(
          exhaustMap((response) => {
            let clonedRecords = cloneObject<TreeItem<TValue>[]>(response);
            let filteredData = this._filterData(clonedRecords);
            return of(filteredData);
          }),
          catchError(() => {
            this._dataStatusChange.next(DataStatus.Error);
            return EMPTY;
          })
        );
      }),
      tap((response) => {
        this._dataRecordsChange.next(response);

        if (!initialRequest) {
          this._dataStatusChange.next(response?.length > 0 ? DataStatus.Success : DataStatus.Empty);
          this._search?.showLoading(false);
        }
        initialRequest = false;
      })
    ).subscribe();
  }

  private _subscribeToSearching(): void {
    if (isNullOrEmpty(this._search)) { return; }
    this._searchSubject.next();

    this._search.searchChangedStream.pipe(
      takeUntil(this._searchSubject),
      tap(() => this._requestUpdate.next())
    ).subscribe();
  }

  private _filterData(dataRecords: TreeItem<TValue>[]): TreeItem<TValue>[] {
    if (isNullOrEmpty(dataRecords)) { return []; }

    let searchedData = this._searchData(dataRecords);
    return searchedData;
  }

  private _searchData(dataRecords: TreeItem<TValue>[]): TreeItem<TValue>[] {
    let searchKeyword = this._search?.keyword;

    let reduceCallbackFunc = (
      result: TreeItem<TValue>[],
      current: TreeItem<TValue>
    ) => {
      if (!this._searchPredicate ?
        containsString(current.text, searchKeyword) :
        this._searchPredicate(current.value, searchKeyword)
      ) {
        result.push(current);
        return result;
      }

      if (!isNullOrEmpty(current.children)) {
        let reducedItems = current.children.reduce(reduceCallbackFunc, []);
        if (reducedItems.length) {
          result.push(current);
          current.children = reducedItems;
        };
      }
      return result;
    };
    return dataRecords.reduce(reduceCallbackFunc, []);
  }
}
