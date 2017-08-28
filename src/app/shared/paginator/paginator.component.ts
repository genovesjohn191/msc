import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter
} from '@angular/core';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsPaginator
} from '../../core';

@Component({
  selector: 'mcs-paginator',
  templateUrl: './paginator.component.html',
  styles: [require('./paginator.component.scss')],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PaginatorComponent implements McsPaginator {

  public textContent: any;
  public pageStream: EventEmitter<any>;

  @Input()
  public get pageIndex(): number { return this._pageIndex; }
  public set pageIndex(value: number) {
    this._pageIndex = value;
    this._changeDetectorRef.markForCheck();
  }
  private _pageIndex: number;

  @Input()
  public get pageSize(): number { return this._pageSize; }
  public set pageSize(value: number) {
    this._pageSize = value;
    this._changeDetectorRef.markForCheck();
  }
  private _pageSize: number;

  @Input()
  public get length(): number { return this._length; }
  public set length(value: number) {
    this._length = value;
    this._changeDetectorRef.markForCheck();
  }
  private _length: number;

  @Input()
  public get loading(): boolean { return this._isLoading; }
  public set loading(value: boolean) {
    this._isLoading = value;
    this._changeDetectorRef.markForCheck();
  }
  private _isLoading: boolean;

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _textContentProvider: McsTextContentProvider
  ) {
    this._pageIndex = 0;
    this._pageSize = 0;
    this._length = 0;
    this._isLoading = false;
    this.pageStream = new EventEmitter<any>();
    this.textContent = _textContentProvider.content.shared.paginator;
  }

  /**
   * Return true if the paginator has next page otherwise false
   */
  public get hasNextPage(): boolean {
    let numberOfPages = Math.ceil(this.length / this.pageSize) - 1;
    return this.pageIndex < numberOfPages && this.pageSize !== 0;
  }

  /**
   * Return true if the paginator has previous page otherwise false
   */
  public get hasPreviousPage(): boolean {
    return this.pageIndex >= 1 && this.pageSize !== 0;
  }

  /**
   * Return all the displayed item count in the table
   */
  public get displayedItemsCount(): number {
    let currentDisplayed = (this.pageIndex + 1) * this.pageSize;
    return currentDisplayed > this.length ? this.length : currentDisplayed;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_FONT_SPINNER;
  }

  public get arrowDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  public nextPage() {
    if (!this.hasNextPage) { return; }
    this.pageIndex++;
    this._emitPageEvent();
  }

  public previousPage() {
    if (!this.hasPreviousPage) { return; }
    this.pageIndex--;
    this._emitPageEvent();
  }

  private _emitPageEvent() {
    this.pageStream.next(this);
  }
}
