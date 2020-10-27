import {
  merge,
  Subject
} from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import { McsBrowserService } from '@app/core';
import {
  coerceNumber,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

import { GridColumnComponent } from '../grid-column/grid-column.component';

const DEFAULT_MAX_GRID_SIZE = 12;
const DEFAULT_GAP_SIZE = 15;

@Component({
  selector: 'mcs-grid-row',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./grid-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'grid-row-wrapper'
  }
})

export class GridRowComponent implements AfterContentInit, OnDestroy {
  @Input()
  public set gapSize(value: number) { this._gapSize = coerceNumber(value); }
  private _gapSize: number = DEFAULT_GAP_SIZE;

  @ContentChildren(GridColumnComponent)
  private _gridColumns: QueryList<GridColumnComponent>;

  private _destroySubject = new Subject<void>();

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _browserService: McsBrowserService
  ) { }

  public ngAfterContentInit() {
    Promise.resolve().then(() => {
      this._subscribesToColumnChanges();
    });
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Returns the host element of the grid row
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Subscribe to column changes
   */
  private _subscribesToColumnChanges(): void {
    this._gridColumns.changes.pipe(
      startWith(null as any),
      takeUntil(this._destroySubject)
    ).subscribe(() => {
      this._subscribeToBreakpointChanges();
    });
  }

  /**
   * Subscribes to window resize changes
   */
  private _subscribeToBreakpointChanges(): void {
    let resetSubject = merge(this._gridColumns.changes, this._destroySubject);
    this._browserService.breakpointChange().pipe(
      takeUntil(resetSubject)
    ).subscribe(() => this._updateGridLayout());
  }

  /**
   * Updates the grid column width and set the values for those
   * who doesn't have width with equally divided
   */
  private _updateGridLayout(): void {
    Promise.resolve().then(() => {
      let columnsCountWithDynamicSize = this._gridColumns
        .filter((column) => isNullOrEmpty(column.getColumnSpan())).length;

      let columnsAccumulatedSize = this._gridColumns
        .filter((column) => !!column.getColumnSpan())
        .map((column) => column.getColumnSpan())
        .reduce((total, next) => total + next, 0);

      let columnsAvailableSize = Math.max(0, 12 - columnsAccumulatedSize);
      let individualDynamicColumnSize = columnsAvailableSize / columnsCountWithDynamicSize;
      let columnSizeCounter = 0;

      this._gridColumns.forEach((gridColumn) => {
        let gridHasFixedSize = !isNullOrEmpty(gridColumn.getColumnSpan());
        let gridActualSize = gridHasFixedSize ?
          gridColumn.getColumnSpan() :
          individualDynamicColumnSize;

        columnSizeCounter += gridActualSize;
        this._updateGridColumnWidth(gridActualSize, gridColumn);
        this._updateGridColumnGap(columnSizeCounter > DEFAULT_MAX_GRID_SIZE, gridColumn);
      });
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Updates the grid column width of based on inputs
   * @param gridSize Grid size to be set on the column
   * @param column Grid Column where the gridsize will be applied
   */
  private _updateGridColumnWidth(gridSize: number, column: GridColumnComponent): void {
    let actualWidthPercentage = ((gridSize / DEFAULT_MAX_GRID_SIZE) * 100);
    column.applyColumnWidth(actualWidthPercentage, this._gapSize);
  }

  /**
   * Updates the grid column gap based on the gapsize provided
   * @param isColumnWrapped Flag to be determine if the column was wrapped
   * @param column Column to be updated
   */
  private _updateGridColumnGap(isColumnWrapped: boolean, column: GridColumnComponent): void {
    isColumnWrapped ?
      column.applyColumnVerticalGap(this._gapSize) :
      column.removeColumnVerticalGap();
  }
}
