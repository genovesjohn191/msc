import { Subject } from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';

import {
  AfterContentInit,
  ChangeDetectorRef,
  ContentChild,
  ContentChildren,
  Directive,
  Input,
  OnDestroy,
  QueryList
} from '@angular/core';
import {
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

import {
  DataCellComponent,
  DataCellDefDirective
} from '../data';
/** Directives */
import {
  HeaderCellComponent,
  HeaderCellDefDirective
} from '../header';

@Directive({
  selector: '[mcsColumnDef]'
})

export class ColumnDefDirective implements AfterContentInit, OnDestroy {
  @ContentChild(HeaderCellDefDirective)
  public headerCellDef: HeaderCellDefDirective;

  @ContentChild(DataCellDefDirective)
  public dataCellDef: DataCellDefDirective;

  @ContentChildren(HeaderCellComponent)
  private _headerCellsComponent: QueryList<HeaderCellComponent>;

  @ContentChildren(DataCellComponent)
  private _dataCellsComponent: QueryList<DataCellComponent>;

  @Input('mcsColumnDef')
  public get name(): string { return this._name; }
  public set name(value: string) { this._name = value; }
  private _name: string;

  @Input('mcsColumnDefClass')
  public get class(): string { return this._class; }
  public set class(value: string) { this._class = value; }
  private _class: string;

  public get hidden(): boolean { return this._hidden; }
  public set hidden(value: boolean) { this._hidden = value; }
  private _hidden: boolean = false;

  private _destroySubject = new Subject<void>();

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  public ngAfterContentInit() {
    Promise.resolve().then(() => {
      this._headerCellsComponent.changes.pipe(
        startWith(null as any),
        takeUntil(this._destroySubject)
      ).subscribe(() => this._updateColumnVisibility());

      this._dataCellsComponent.changes.pipe(
        startWith(null as any),
        takeUntil(this._destroySubject)
      ).subscribe(() => this._updateColumnVisibility());
    });
  }

  /**
   * Shows the column
   */
  public showColumn(): void {
    this.hidden = false;
    this._updateColumnVisibility();
  }

  /**
   * Hides the column
   */
  public hideColumn(): void {
    this.hidden = true;
    this._updateColumnVisibility();
  }

  /**
   * Updates the column visibility based on the hidden flag provided
   */
  private _updateColumnVisibility(): void {
    this._updateHeaderCellVisibility();
    this._updateDataCellsVisibility();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets the display of the associated header cell for this column
   */
  private _updateHeaderCellVisibility(): void {
    if (isNullOrEmpty(this._headerCellsComponent)) { return; }
    this._headerCellsComponent.forEach((headerCell) => headerCell.hidden = this.hidden);
  }

  /**
   * Sets the display of the associated data cells for this column
   */
  private _updateDataCellsVisibility(): void {
    if (isNullOrEmpty(this._dataCellsComponent)) { return; }
    this._dataCellsComponent.forEach((dataCell) => dataCell.hidden = this.hidden);
  }
}
