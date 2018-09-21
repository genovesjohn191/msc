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
  throwError,
  isObservable,
  Observable
} from 'rxjs';
import {
  takeUntil,
  startWith,
  catchError
} from 'rxjs/operators';
/** Core / Utilities */
import { CoreDefinition } from '@app/core';
import { McsDataStatus } from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  unsubscribeSubject
} from '@app/utilities';
/** Shared Directives */
import {
  CellOutletDirective,
  HeaderPlaceholderDirective,
  DataPlaceholderDirective,
  DataStatusPlaceholderDirective,
  CellOutletContext
} from './shared';
/** Column */
import { ColumnDefDirective } from './column';
/** Headers */
import {
  HeaderRowDefDirective,
  HeaderCellDefDirective
} from './header';
/** Datarow */
import {
  DataCellDefDirective,
  DataRowDefDirective
} from './data';
/** Datastatus */
import { DataStatusDefDirective } from './data-status';
import { TableDataSource } from './table.datasource';
import { McsDataSource } from './mcs-data-source.interface';

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

export class TableComponent<T> implements OnInit, AfterContentInit, AfterContentChecked, OnDestroy {
  /**
   * Trackby function to use wheater the data has been changed
   */
  @Input()
  public set trackBy(fn: TrackByFunction<T>) { this._trackBy = fn; }
  public get trackBy(): TrackByFunction<T> { return this._trackBy; }
  private _trackBy: TrackByFunction<T>;

  /**
   * An observable datasource to bind inside the table data
   */
  @Input()
  public set dataSource(value: McsDataSource<T> | Observable<T[]> | T[]) {
    let dataSourceHasBeenChanged = this._dataSource !== value;
    if (dataSourceHasBeenChanged) {
      // Convert the actual data source based on its type
      let actualDataSource = Array.isArray(value) || isObservable(value) ?
        new TableDataSource(value) : value;
      if (isNullOrEmpty(actualDataSource)) {
        actualDataSource = new TableDataSource(undefined);
      }

      this._listenToDataLoading(actualDataSource);
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

  /**
   * Get/Set the data obtainment status based on observables
   */
  private _dataStatus: McsDataStatus;
  public get dataStatus(): McsDataStatus { return this._dataStatus; }
  public set dataStatus(value: McsDataStatus) {
    if (this._dataStatus !== value) {
      this._dataStatus = value;
      this._switchDataStatus(value);
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Returns all the displayed columns of the table
   */
  public get displayedColumns(): QueryList<ColumnDefDirective> {
    return this._columnDefinitions;
  }

  /**
   * Placeholders within the table template where the header and rows data will be inserted
   */
  @ViewChild(HeaderPlaceholderDirective)
  private _headerPlaceholder: HeaderPlaceholderDirective;

  @ViewChild(DataPlaceholderDirective)
  private _dataPlaceholder: DataPlaceholderDirective;

  @ViewChild(DataStatusPlaceholderDirective)
  private _dataStatusPlaceholder: DataStatusPlaceholderDirective;

  /** Columns */
  @ContentChildren(ColumnDefDirective)
  private _columnDefinitions: QueryList<ColumnDefDirective>;
  private _columnDefinitionsMap: Map<string, ColumnDefDirective>;

  /** Template of the header row directive */
  @ContentChild(HeaderRowDefDirective)
  private _headerRowDefinition: HeaderRowDefDirective;

  /** Template of the data row directives */
  @ContentChildren(DataRowDefDirective)
  private _dataRowDefinitions: QueryList<DataRowDefDirective>;

  /** Template of the data status directives */
  @ContentChild(DataStatusDefDirective)
  private _dataStatusDefinition: DataStatusDefDirective;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _differs: IterableDiffers
  ) {
    this._data = [];
    this._columnDefinitionsMap = new Map<string, ColumnDefDirective>();

    // Add loader while table is initializing
    this.dataStatus = McsDataStatus.InProgress;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_LOADER_SPINNER;
  }

  public get dataStatusEnum(): any {
    return McsDataStatus;
  }

  public ngOnInit() {
    // Set role to grid
    this._renderer.setAttribute(this._elementRef.nativeElement, 'role', 'grid');
    this._dataDiffer = this._differs.find([]).create(this._trackBy);
  }

  public ngAfterContentInit() {
    // Set the column definition mapping for easy accessing
    this._columnDefinitions.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(this._setColumnDefinitionsMap.bind(this));

    // Render row headers
    this._renderHeaderRows();
  }

  public ngAfterContentChecked() {
    this._updateTableData();
    if (this._dataSource && !this._dataSourceSubscription) {
      this._getDatasourceData();
    }
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._dataSourceSubscription);
    unsubscribeSafely(this._dataLoadingSubscription);
    unsubscribeSubject(this._destroySubject);
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
      this._dataPlaceholder.viewContainer.clear();
    }
  }

  /**
   * Switch the data status based on the new data status
   * `@Note:` This will remove the previous status in the DOM
   * @param newDataStatus New datastatus to be set
   */
  private _switchDataStatus(newDataStatus: McsDataStatus) {
    if (isNullOrEmpty(this._dataStatusDefinition)) { return; }
    this._dataStatusPlaceholder.viewContainer.clear();

    switch (newDataStatus) {
      case McsDataStatus.Empty:
        if (isNullOrEmpty(this._dataStatusDefinition.dataEmptyDef)) { break; }
        this._dataStatusPlaceholder.viewContainer
          .createEmbeddedView(this._dataStatusDefinition.dataEmptyDef.template);
        break;

      case McsDataStatus.Error:
        if (isNullOrEmpty(this._dataStatusDefinition.dataErrorDef)) { break; }
        this._dataStatusPlaceholder.viewContainer
          .createEmbeddedView(this._dataStatusDefinition.dataErrorDef.template);
      default:
        break;
    }
  }

  /**
   * Listener when data is loading from the datasource
   * @param newDatasource New datasource to listen
   */
  private _listenToDataLoading(newDatasource: McsDataSource<T>) {
    unsubscribeSafely(this._dataLoadingSubscription);

    // Subscribe to data loading process
    if (isNullOrEmpty(newDatasource.dataLoadingStream)) {
      newDatasource.dataLoadingStream = new Subject<any>();
    }
    this._dataLoadingSubscription = newDatasource.dataLoadingStream
      .subscribe((status) => this.dataStatus = status);
  }

  /**
   * This will update the table data including the header row
   * based on the new header
   */
  private _updateTableData(): void {
    // Header row refresh
    if (this._headerRowDefinition.getColumnsDiff()) {
      this._headerPlaceholder.viewContainer.clear();
      this._renderHeaderRows();
    }
    // Data rows refresh
    this._dataRowDefinitions.forEach((rowDefinition) => {
      if (!!rowDefinition.getColumnsDiff()) {
        this._dataDiffer.diff([]);
        this._dataPlaceholder.viewContainer.clear();
        this._renderDataRows();
      }
    });
  }

  /**
   * This will render the header rows including each header cells
   */
  private _renderHeaderRows(): void {
    if (isNullOrEmpty(this._headerRowDefinition)) { return; }

    // Get all header cells within the container
    let headerCells: HeaderCellDefDirective[] = new Array();
    this._headerRowDefinition.columns
      .map((columnName) => {
        if (this._columnDefinitionsMap.has(columnName)) {
          let column = this._columnDefinitionsMap.get(columnName);
          headerCells.push(column.headerCellDef);
        }
      });

    // Render the view for the header row
    this._headerPlaceholder.viewContainer
      .createEmbeddedView(this._headerRowDefinition.template, { headerCells });
    headerCells.forEach((cell) => {
      CellOutletDirective.mostRecentOutlet.viewContainer.createEmbeddedView(cell.template, {});
    });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * This will render the data rows with assigned data context
   * to be able to use the context as "let row" keyword on the HTML
   *
   * `@Note` The context should have $implicit variable to access
   * the data object on the HTML directly
   */
  private _renderDataRows(): void {
    if (isNullOrEmpty(this._dataRowDefinitions)) { return; }
    let changes = this._dataDiffer.diff(this._data);
    if (!changes) { return; }

    let dataRowViewContainer = this._dataPlaceholder.viewContainer;
    changes.forEachOperation(
      (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
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
    this._dataPlaceholder.viewContainer.createEmbeddedView(row.template, context, index);
    dataCells.forEach((cell) => {
      CellOutletDirective.mostRecentOutlet.viewContainer.createEmbeddedView(cell.template, context);
    });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Updates the context for each row to reflect any data changes that may have caused
   * rows to be added, removed, or moved. The view container contains the same context
   * that was provided to each of its cells.
   */
  private _updateDataRowContext() {
    const viewContainer = this._dataPlaceholder.viewContainer;
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
    this._dataSourceSubscription = this._dataSource.connect()
      .pipe(
        catchError((error) => {
          this.dataStatus = McsDataStatus.Error;
          this._dataSource.onCompletion(this.dataStatus, undefined);
          return throwError(error);
        })
      )
      .subscribe((data) => {
        this._data = data;
        this._renderDataRows();
        this.dataStatus = isNullOrEmpty(data) ?
          McsDataStatus.Empty :
          McsDataStatus.Success;
        this._dataSource.onCompletion(this.dataStatus, data);
      });
  }
}
