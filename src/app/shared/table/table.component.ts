import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterContentInit,
  AfterContentChecked,
  ViewChild,
  ContentChild,
  ContentChildren,
  ChangeDetectorRef,
  Renderer2,
  ElementRef,
  QueryList,
  NgIterable,
  IterableDiffer,
  IterableDiffers,
  TrackByFunction,
  IterableChangeRecord,
  EmbeddedViewRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  Subject,
  Subscription,
  Observable,
  isObservable
} from 'rxjs';
import {
  takeUntil,
  tap
} from 'rxjs/operators';
import { DataStatus } from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import {
  CellOutletDirective,
  HeaderPlaceholderDirective,
  DataPlaceholderDirective,
  DataStatusPlaceholderDirective,
  CellOutletContext
} from './shared';
import { ColumnDefDirective } from './column';
import {
  HeaderRowDefDirective,
  HeaderCellDefDirective
} from './header';
import {
  DataCellDefDirective,
  DataRowDefDirective
} from './data';
import { DataStatusDefDirective } from './data-status';
import { McsDataSource } from './mcs-data-source.interface';
import { TableDataSource } from './table.datasource';
import { Table } from './table.interface';

@Component({
  selector: 'mcs-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-table-wrapper'
  }
})

export class TableComponent<T> implements Table, OnInit, AfterContentInit, AfterContentChecked, OnDestroy {
  public dataStatusChange$: Observable<DataStatus>;

  @Input()
  public set trackBy(fn: TrackByFunction<T>) { this._trackBy = fn; }
  public get trackBy(): TrackByFunction<T> { return this._trackBy; }
  private _trackBy: TrackByFunction<T>;

  @Input()
  public set dataSource(value: McsDataSource<T> | T[] | Observable<T[]>) {
    let dataSourceHasBeenChanged = this._dataSource !== value;
    if (dataSourceHasBeenChanged) {

      let actualDataSource = Array.isArray(value) || isObservable(value) ?
        new TableDataSource(value) : value;
      if (isNullOrEmpty(actualDataSource)) {
        actualDataSource = new TableDataSource(undefined);
      }

      this._switchDataSource(actualDataSource);
      this._dataSource = actualDataSource;
    }
  }
  private _dataSource: McsDataSource<T>;
  private _dataSourceSubscription: Subscription;
  private _dataLoadingSubscription: Subscription;
  private _data: NgIterable<T>;
  private _dataDiffer: IterableDiffer<T>;
  private _destroySubject = new Subject<void>();
  private _dataStatusSubject = new Subject<void>();

  @ViewChild(HeaderPlaceholderDirective)
  private _headerRowOutlet: HeaderPlaceholderDirective;

  @ViewChild(DataPlaceholderDirective)
  private _dataRowsOutlet: DataPlaceholderDirective;

  @ViewChild(DataStatusPlaceholderDirective)
  private _dataStatusPlaceholder: DataStatusPlaceholderDirective;

  @ContentChildren(ColumnDefDirective)
  private _columnDefinitions: QueryList<ColumnDefDirective>;
  private _columnDefinitionsMap: Map<string, ColumnDefDirective>;

  @ContentChildren(HeaderRowDefDirective)
  private _headerRowDefinition: QueryList<HeaderRowDefDirective>;

  @ContentChildren(DataRowDefDirective)
  private _dataRowDefinitions: QueryList<DataRowDefDirective>;

  @ContentChild(DataStatusDefDirective)
  private _dataStatusDefinition: DataStatusDefDirective;

  private _columnCountCache: number = 0;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _differs: IterableDiffers
  ) {
    this._data = [];
    this._columnDefinitionsMap = new Map<string, ColumnDefDirective>();
  }

  public get dataStatusEnum(): any {
    return DataStatus;
  }

  public ngOnInit() {
    // Set role to grid
    this._renderer.setAttribute(this._elementRef.nativeElement, 'role', 'grid');
    this._dataDiffer = this._differs.find([]).create(this._trackBy);
  }

  public ngAfterContentInit() {
    this._renderUpdatedColumns();

    // We need to check if the previous column count is not the same with the current column
    // since angular always triggered the changes without checking the whole context of it
    // and it makes the other table acting weird.
    // TODO: Check with the latest version of angular if this issue was already fixed.
    this._columnDefinitions.changes.pipe(takeUntil(this._destroySubject)).subscribe((columns) => {
      if (this._columnCountCache !== columns.length) { this._renderUpdatedColumns(); }
      this._columnCountCache = columns.length;
    });
  }

  public ngAfterContentChecked() {
    if (this._dataSource && !this._dataSourceSubscription) {
      this._subscribeToDataStatus();
      this._getDatasourceData();
    }
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._dataSourceSubscription);
    unsubscribeSafely(this._dataLoadingSubscription);
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._dataStatusSubject);
  }

  /**
   * Returns all the displayed columns of the table
   */
  public get displayedColumns(): QueryList<ColumnDefDirective> {
    return this._columnDefinitions;
  }

  /**
   * Shows all the columns given name, and drop the other columns
   * @param names Names of the columns to be shown
   */
  public showColumns(...names: string[]): void {
    if (isNullOrEmpty(names)) { return; }

    this._columnDefinitions.forEach((columnDef) => {
      let columnFound = names.find((name) => name === columnDef.name);
      isNullOrEmpty(columnFound) ? columnDef.hideColumn() : columnDef.showColumn();
    });
  }

  /**
   * Render updated columns based on the element definitions
   */
  private _renderUpdatedColumns(): void {
    this._setColumnDefinitionsMap();
    this._renderHeaderRows();
    this._renderDataRows();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets the column definition map to be the basis of the columns
   */
  private _setColumnDefinitionsMap(): void {
    this._columnDefinitionsMap.clear();
    this._columnDefinitions.forEach((columnDefDirective) => {
      this._columnDefinitionsMap.set(columnDefDirective.name, columnDefDirective);
    });
  }

  /**
   * This will remove the subscription of the previous datasource
   * including the data-row view to refresh all the data from scratch
   * @param newDatasource New Datasource obtained
   */
  private _switchDataSource(newDatasource: McsDataSource<T>) {
    if (isNullOrEmpty(newDatasource) || isNullOrEmpty(this._dataSource)) { return; }

    this._data = [];
    if (newDatasource) {
      this._dataSource.disconnect();
    }

    // We need to set the subscription into null in order
    // for the datasource to be renewed based on new data settings
    unsubscribeSafely(this._dataSourceSubscription);
    this._dataSourceSubscription = null;

    if (!isNullOrEmpty(newDatasource)) {
      if (this._dataDiffer) { this._dataDiffer.diff([]); }
      this._dataRowsOutlet.viewContainer.clear();
    }
  }

  /**
   * Switch the data status based on the new data status
   * `@Note:` This will remove the previous status in the DOM
   * @param newDataStatus New datastatus to be set
   */
  private _switchDataStatus(newDataStatus: DataStatus) {
    if (isNullOrEmpty(this._dataStatusDefinition)) { return; }
    this._dataStatusPlaceholder.viewContainer.clear();

    switch (newDataStatus) {
      case DataStatus.Empty:
        if (isNullOrEmpty(this._dataStatusDefinition.dataEmptyDef)) { break; }
        this._dataStatusPlaceholder.viewContainer
          .createEmbeddedView(this._dataStatusDefinition.dataEmptyDef.template);
        break;

      case DataStatus.Error:
        if (isNullOrEmpty(this._dataStatusDefinition.dataErrorDef)) { break; }
        this._dataStatusPlaceholder.viewContainer
          .createEmbeddedView(this._dataStatusDefinition.dataErrorDef.template);
      default:
        break;
    }
  }

  /**
   * This will render the header rows including each header cells
   */
  private _renderHeaderRows(): void {
    // Clear the header row outlet if any rows already exist since every table has only 1 row.
    if (this._headerRowOutlet.viewContainer.length > 0) {
      this._headerRowOutlet.viewContainer.clear();
    }

    this._headerRowDefinition.forEach((rowDef) => {
      let headerCells: HeaderCellDefDirective[] = new Array();
      rowDef.columns.forEach((columnName) => {
        let column = this._columnDefinitionsMap.get(columnName);
        if (isNullOrEmpty(column)) { return; }
        headerCells.push(column.headerCellDef);
      });

      this._headerRowOutlet.viewContainer.createEmbeddedView(rowDef.template, { headerCells });
      headerCells.forEach((cell) => {
        CellOutletDirective.mostRecentOutlet.viewContainer.createEmbeddedView(cell.template, {});
      });
    });
  }

  /**
   * Renders the data rows based on the column definition
   */
  private _renderDataRows(): void {
    if (isNullOrEmpty(this._dataRowDefinitions)) { return; }
    this._dataDiffer.diff([]);
    this._dataRowsOutlet.viewContainer.clear();
    this._createDataRows();
  }

  /**
   * This will render the data rows with assigned data context
   * to be able to use the context as "let row" keyword on the HTML
   *
   * `@Note` The context should have $implicit variable to access
   * the data object on the HTML directly
   */
  private _createDataRows(): void {
    if (isNullOrEmpty(this._dataRowDefinitions)) { return; }
    let changes = this._dataDiffer.diff(this._data);
    if (!changes) { return; }

    let dataRowViewContainer = this._dataRowsOutlet.viewContainer;
    changes.forEachOperation((
      item: IterableChangeRecord<any>,
      adjustedPreviousIndex: number,
      currentIndex: number
    ) => {
      if (item.previousIndex == null) {
        this._insertRow(this._data[currentIndex], currentIndex);
      } else if (currentIndex == null) {
        dataRowViewContainer.remove(adjustedPreviousIndex);
      } else {
        const view = dataRowViewContainer.get(adjustedPreviousIndex);
        dataRowViewContainer.move(view!, currentIndex);
      }
    });
    this._updateDataRowContext();
  }

  /**
   * Insert the data object based on the given index as position
   * @param dataRow Data object of the row to be inserted
   * @param index Index position of the object
   */
  private _insertRow(dataRow: T, index: number) {
    let dataCells: DataCellDefDirective[] = new Array();
    let row = this._dataRowDefinitions.first;

    // Insert empty cells if there is no data to improve rendering time.
    if (!isNullOrEmpty(dataRow)) {
      row.columns.map((columnName) => {
        if (this._columnDefinitionsMap.has(columnName)) {
          let column = this._columnDefinitionsMap.get(columnName);
          dataCells.push(column.dataCellDef);
        }
      });
    }

    // Row context that will be provided to both the created embedded row view and its cells.
    let context: CellOutletContext<T> = { $implicit: dataRow };

    // Render the view for the data row
    this._dataRowsOutlet.viewContainer.createEmbeddedView(row.template, context, index);
    dataCells.forEach((cell) => {
      CellOutletDirective.mostRecentOutlet.viewContainer.createEmbeddedView(cell.template, context);
    });
  }

  /**
   * Updates the context for each row to reflect any data changes that may have caused
   * rows to be added, removed, or moved. The view container contains the same context
   * that was provided to each of its cells.
   */
  private _updateDataRowContext() {
    const viewContainer = this._dataRowsOutlet.viewContainer;
    for (let index = 0, count = viewContainer.length; index < count; index++) {
      const viewRef = viewContainer.get(index) as EmbeddedViewRef<CellOutletContext<T>>;
      viewRef.context.index = index;
      viewRef.context.count = count;
      viewRef.context.first = index === 0;
      viewRef.context.last = index === count - 1;
      viewRef.context.even = index % 2 === 0;
      viewRef.context.odd = !viewRef.context.even;
    }
  }

  /**
   * Get the datasource from the given data
   *
   * `@Note` This will run asynchronously
   */
  private _getDatasourceData(): void {
    this._dataSourceSubscription = this._dataSource.connect().subscribe((data) => {
      this._data = data;
      this._createDataRows();
      this._dataSource.onCompletion(data);
    });
  }

  /**
   * Subscribe to data status
   */
  private _subscribeToDataStatus(): void {
    if (isNullOrEmpty(this._dataSource)) { return; }

    this._dataStatusSubject.next();
    this.dataStatusChange$ = this._dataSource.dataStatusChange().pipe(
      takeUntil(this._dataStatusSubject),
      tap(this._switchDataStatus.bind(this))
    );
  }
}
