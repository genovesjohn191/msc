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
import { takeUntil } from 'rxjs/operator/takeUntil';
/** Core / Utilities */
import { McsDataSource } from '../../core';
import { isNullOrEmpty } from '../../utilities';
/** Shared Directives */
import {
  CellOutletDirective,
  DataPlaceholderDirective,
  HeaderPlaceholderDirective,
  CellOutletContext
} from './shared';
/** Column */
import { ColumnDefDirective } from './column';
/** Headers */
import { HeaderRowDefDirective } from './header';
/** Datarow */
import {
  DataCellDefDirective,
  DataRowDefDirective
} from './data';

@Component({
  selector: 'mcs-table',
  templateUrl: './table.component.html',
  styles: [require('./table.component.scss')],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TableComponent<T> implements OnInit, AfterContentInit, AfterContentChecked, OnDestroy {
  /**
   * Trackby function to use wheater the data has been changed
   */
  @Input()
  public set trackBy(fn: TrackByFunction<T>) {
    this._trackBy = fn;
  }
  public get trackBy(): TrackByFunction<T> { return this._trackBy; }
  private _trackBy: TrackByFunction<T>;

  /**
   * An observable datasource to bind inside the table data
   */
  @Input()
  public get dataSource(): McsDataSource<T> {
    return this._dataSource;
  }
  public set dataSource(value: McsDataSource<T>) {
    if (this._dataSource !== value) {
      this._switchDataSource(value);
      this._dataSource = value;
    }
  }
  private _dataSource: McsDataSource<T>;
  private _dataSourceSubscription: any;
  private _data: NgIterable<T>;
  private _dataDiffer: IterableDiffer<T>;

  /**
   * Placeholders within the table template where the header and rows data will be inserted
   */
  @ViewChild(HeaderPlaceholderDirective)
  private _headerPlaceholder: HeaderPlaceholderDirective;

  @ViewChild(DataPlaceholderDirective)
  private _dataPlaceholder: DataPlaceholderDirective;

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

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _differs: IterableDiffers
  ) {
    this._data = [];
    this._columnDefinitionsMap = new Map<string, ColumnDefDirective>();
  }

  public ngOnInit() {
    // Set role to grid
    this._renderer.setAttribute(this._elementRef.nativeElement, 'role', 'grid');
    this._dataDiffer = this._differs.find([]).create(this._trackBy);
  }

  public ngAfterContentInit() {
    // Set the column definition mapping for easy accessing
    this._setColumnDefinitionsMap();
    this._columnDefinitions.changes.subscribe(
      this._setColumnDefinitionsMap.bind(this)
    );

    // Render row headers
    this._renderHeaderRows();
  }

  public ngAfterContentChecked() {
    this._updateTableData();
    if (this.dataSource && !this._dataSourceSubscription) {
      this._getDatasourceData();
    }
  }

  public ngOnDestroy() {
    if (this._dataSourceSubscription) {
      this._dataSourceSubscription.unsubscribe();
    }
  }

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
    if (isNullOrEmpty(newDatasource) || isNullOrEmpty(this.dataSource)) { return; }

    this._data = [];
    if (newDatasource) {
      this.dataSource.disconnect();
    }
    if (this._dataSourceSubscription) {
      this._dataSourceSubscription.unsubscribe();
      this._dataSourceSubscription = null;
    }

    if (!newDatasource) {
      this._dataPlaceholder.viewContainer.clear();
    }
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
    if (!this._headerRowDefinition) { return; }

    // Get all header cells within the container
    let headerCells = this._headerRowDefinition.columns
      .map((columnName) => {
        if (!this._columnDefinitionsMap.has(columnName)) {
          throw new Error('Invalid column definitions in rendering header');
        }
        let column = this._columnDefinitionsMap.get(columnName);
        return column.headerCellDef;
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
    if (!this._dataRowDefinitions) { return; }
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
      dataCells = row.columns.map((columnName) => {
        if (!this._columnDefinitionsMap.has(columnName)) {
          throw new Error('Invalid column definitions in rendering rows');
        }
        let column = this._columnDefinitionsMap.get(columnName);
        return column.dataCellDef;
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
    this._dataSourceSubscription = this.dataSource.connect()
      .subscribe((data) => {
        this._data = data;
        this._renderDataRows();
        this._dataSource.onCompletion();
      });
  }
}
