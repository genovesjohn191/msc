import {
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import {
  Subject,
  Observable
} from 'rxjs';
import {
  takeUntil,
  tap,
  map
} from 'rxjs/operators';
import {
  isNullOrEmpty,
  convertMapToJsonObject,
  unsubscribeSubject
} from '@app/utilities';
import {
  McsFilterInfo,
  Breakpoint,
  McsApiCollection,
  McsQueryParam
} from '@app/models';
import {
  Search,
  Paginator,
  FilterSelector
} from '@app/shared';
import { McsBrowserService } from '../services/mcs-browser.service';
import { McsTableDataSource } from '../data-access/mcs-table-datasource';
import { McsTableSelection } from '../data-access/mcs-table-selection';

export abstract class McsTableListing<T> implements AfterViewInit {
  @ViewChild('search')
  public search: Search;

  @ViewChild('paginator')
  public paginator: Paginator;

  @ViewChild('filterSelector')
  public filterSelector: FilterSelector;

  public selection: McsTableSelection<T>;

  // Table variables
  protected dataSource: McsTableDataSource<T>;
  protected dataColumns: string[] = [];
  protected columnSettings: any;

  // Other variables
  private _baseDestroySubject = new Subject<void>();
  private _totalRecordsCount: number = 0;
  private _isMobile: boolean;

  constructor(
    protected browserService: McsBrowserService,
    protected changeDetectorRef: ChangeDetectorRef,
    protected allowMultipleSelection: boolean = true
  ) {
    this._subscribeToBreakpointChange();
    this.dataSource = new McsTableDataSource<T>([]);
    this.selection = new McsTableSelection(this.dataSource, allowMultipleSelection);
  }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._validateComponents();
      this._initializeDataSource();
    });
  }

  /**
   * Returns true when mode is mobile
   */
  public get isMobile(): boolean {
    return this._isMobile;
  }

  /**
   * Returns true when search box is currently processing
   */
  public get isSearching(): boolean {
    return isNullOrEmpty(this.search) ? false :
      this.search.keyword.length > 0;
  }

  /**
   * Returns the total records count of the record
   */
  public get totalRecordsCount(): number {
    return Math.max(this._totalRecordsCount, 0);
  }

  /**
   * Update the column settings based on filtered selectors
   * and update the data column of the table together
   * @param columns New column settings
   */
  public updateColumnSettings(columns: Map<string, McsFilterInfo>): void {
    if (isNullOrEmpty(columns)) { return; }
    this.columnSettings = convertMapToJsonObject(columns);
    this.dataColumns = Object.keys(this.columnSettings);
  }

  /**
   * Retry the obtainment from the datasource when an error occured
   */
  public retryDatasource(): void {
    if (isNullOrEmpty(this.dataSource)) { return; }
    this._initializeDataSource();
  }

  protected abstract getEntityListing(query: McsQueryParam): Observable<McsApiCollection<T>>;

  /**
   * Returns the column settings filter key or the listing table
   */
  protected abstract get columnSettingsKey(): string;

  /**
   * Dispose all of the resource from the datasource including all the subscription
   *
   * `@Note`: This should be call inside the destroy of the component
   */
  protected dispose(): void {
    if (!isNullOrEmpty(this.dataSource)) {
      (this.dataSource as any).disconnect();
    }
    if (!isNullOrEmpty(this.dataColumns)) {
      this.dataColumns = [];
      this.dataColumns = null;
    }
    unsubscribeSubject(this._baseDestroySubject);
  }

  /**
   * Listen to any changes in size of the browser
   */
  private _subscribeToBreakpointChange(): void {
    this.browserService.breakpointChange().pipe(
      takeUntil(this._baseDestroySubject)
    ).subscribe((deviceType) => {
      this._isMobile = deviceType === Breakpoint.Small ||
        deviceType === Breakpoint.XSmall;
      this.changeDetectorRef.markForCheck();
    });
  }

  private _initializeDataSource(): void {
    this.dataSource.updateDatasource(this._getEntityCollection.bind(this));
    this.dataSource
      .registerSearch(this.search)
      .registerPaginator(this.paginator);
    this.changeDetectorRef.markForCheck();
  }

  private _getEntityCollection(): Observable<T[]> {
    return this.getEntityListing({
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      keyword: this.search.keyword
    }).pipe(
      tap((apiCollection) => this._setTotalRecordsCount(apiCollection.totalCollectionCount)),
      map((entityCollection) => entityCollection.collection)
    );
  }

  /**
   * Sets the total records count
   * @param count Count to be set
   */
  private _setTotalRecordsCount(count: number): void {
    this._totalRecordsCount = count;
    this.changeDetectorRef.markForCheck();
  }

  private _validateComponents(): void {
    if (isNullOrEmpty(this.paginator)) {
      throw new Error('Pagination was not defined on type table listing.');
    }

    if (isNullOrEmpty(this.search)) {
      throw new Error('Search was not defined on type table listing.');
    }

    if (isNullOrEmpty(this.filterSelector)) {
      throw new Error('Filter selector was not defined on type table listing.');
    }
  }
}
