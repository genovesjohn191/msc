import {
  Directive,
  Input,
  OnChanges,
  AfterContentInit,
  OnDestroy,
  ContentChild,
  ContentChildren,
  QueryList,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  startWith,
  takeUntil
} from 'rxjs/operators';
/** Directives */
import {
  HeaderCellDefDirective,
  HeaderCellComponent
} from '../header';
import {
  DataCellDefDirective,
  DataCellComponent
} from '../data';
import {
  isNullOrEmpty,
  unsubscribeSubject
} from '@app/utilities';

@Directive({
  selector: '[mcsColumnDef]'
})

export class ColumnDefDirective implements OnChanges, AfterContentInit, OnDestroy {
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

  @Input('mcsColumnDefHidden')
  public get hidden(): boolean { return this._hidden; }
  public set hidden(value: boolean) { this._hidden = value; }
  private _hidden: boolean = false;

  private _destroySubject = new Subject<void>();

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  public ngOnChanges(changes: SimpleChanges) {
    let displayChanges = changes['hidden'];
    if (!isNullOrEmpty(displayChanges)) {
      this._setHeaderCellVisibility();
      this._setDataCellsVisibility();
      this._changeDetectorRef.markForCheck();
    }
  }

  public ngAfterContentInit(): void {
    this._headerCellsComponent.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => this._setHeaderCellVisibility());

    this._dataCellsComponent.changes
      .pipe(startWith(null), takeUntil(this._destroySubject))
      .subscribe(() => this._setDataCellsVisibility());
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Sets the display of the associated header cell for this column
   */
  private _setHeaderCellVisibility(): void {
    if (isNullOrEmpty(this._headerCellsComponent)) { return; }
    this._headerCellsComponent.forEach((headerCell) => headerCell.hidden = this.hidden);
  }

  /**
   * Sets the display of the associated data cells for this column
   */
  private _setDataCellsVisibility(): void {
    if (isNullOrEmpty(this._dataCellsComponent)) { return; }
    this._dataCellsComponent.forEach((dataCell) => dataCell.hidden = this.hidden);
  }
}
