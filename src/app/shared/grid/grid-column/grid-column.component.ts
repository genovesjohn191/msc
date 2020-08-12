import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { McsBrowserService } from '@app/core';
import {
  coerceNumber,
  unsubscribeSafely,
  isNullOrEmpty
} from '@app/utilities';
import { Breakpoint } from '@app/models';

@Component({
  selector: 'mcs-grid-column',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./grid-column.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'grid-column-wrapper',
    '[class.grid-column-wrapped]': 'isColumnWrapped'
  }
})

export class GridColumnComponent implements OnInit, OnDestroy {
  public isColumnWrapped: boolean;

  @Input()
  public get sizeXs(): number { return this._sizeXs; }
  public set sizeXs(value: number) { this._sizeXs = coerceNumber(value, 0); }
  private _sizeXs: number;

  @Input()
  public get sizeSm(): number { return this._sizeSm; }
  public set sizeSm(value: number) { this._sizeSm = coerceNumber(value, 0); }
  private _sizeSm: number;

  @Input()
  public get sizeMd(): number { return this._sizeMd; }
  public set sizeMd(value: number) { this._sizeMd = coerceNumber(value, 0); }
  private _sizeMd: number;

  @Input()
  public get sizeLg(): number { return this._sizeLg; }
  public set sizeLg(value: number) { this._sizeLg = coerceNumber(value, 0); }
  private _sizeLg: number;

  @Input()
  public get sizeWd(): number { return this._sizeWd; }
  public set sizeWd(value: number) { this._sizeWd = coerceNumber(value, 0); }
  private _sizeWd: number;

  private _breakpoint: Breakpoint;
  private _destroySubject = new Subject<void>();
  private _sizesTableMap = new Map<Breakpoint, number>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private _browserService: McsBrowserService
  ) { }

  public ngOnInit() {
    this._createSizeMapTable();
    this._subscribeToWindowResize();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Returns the column span based on breakpoint
   */
  public getColumnSpan(): number {
    let columnSizeByTable = this._getResponsiveBreakpointValue();
    if (isNullOrEmpty(columnSizeByTable)) { return undefined; }
    return columnSizeByTable;
  }

  /**
   * Returns the host element of the grid column
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Applies all the columns size based on the percentage given
   */
  public applyColumnWidth(actualPercentage: number, gapsize: number): void {
    let stylePercentage = actualPercentage < 100 ?
      `calc(${actualPercentage}% - ${gapsize}px)` :
      `calc(${actualPercentage}%)`;

    this.hostElement.style.flexBasis = stylePercentage;
    this.hostElement.style.width = stylePercentage;
    this.hostElement.style.maxWidth = stylePercentage;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Applies the vertical gap between grid columns
   * @param gapSize Gapsize to be set
   */
  public applyColumnVerticalGap(gapSize: number): void {
    if (isNullOrEmpty(gapSize)) { return; }
    this.hostElement.style.marginTop = `${gapSize}px`;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Removes the column vertical with when the grid column is not wrapped
   */
  public removeColumnVerticalGap(): void {
    this.hostElement.style.marginTop = `${0}px`;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Subscribes to window resize changes
   */
  private _subscribeToWindowResize(): void {
    this._browserService.breakpointChange().pipe(
      takeUntil(this._destroySubject)
    ).subscribe((deviceMode) => {
      this._breakpoint = deviceMode;
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Creates the size map table
   */
  private _createSizeMapTable(): void {
    this._sizesTableMap.set(Breakpoint.XSmall, this.sizeXs);
    this._sizesTableMap.set(Breakpoint.Small, this.sizeSm);
    this._sizesTableMap.set(Breakpoint.Medium, this.sizeMd);
    this._sizesTableMap.set(Breakpoint.Large, this.sizeLg);
    this._sizesTableMap.set(Breakpoint.Wide, this.sizeWd);
  }

  /**
   * Get the responsive breakpoint value
   */
  private _getResponsiveBreakpointValue(): number {
    // We need to find the lowest breakpoint
    let columnSizeByTable = this._sizesTableMap && this._sizesTableMap.get(this._breakpoint);
    if (isNullOrEmpty(columnSizeByTable)) {
      this._sizesTableMap.forEach((value, breakpoint) => {
        let columnSizeIsNotSet = isNullOrEmpty(columnSizeByTable)
          && this._breakpoint < breakpoint;
        if (columnSizeIsNotSet) { columnSizeByTable = value; }
      });
    }
    return columnSizeByTable;
  }
}
